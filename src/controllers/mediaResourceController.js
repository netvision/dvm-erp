// Media Resource Controller for Audio/Video Library Management
const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

class MediaResourceController {
    // Get all media resources with filtering and pagination
    async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                type,
                format,
                genre,
                language = 'English',
                access_level,
                search,
                sort = 'title',
                order = 'ASC'
            } = req.query;

            const offset = (page - 1) * limit;
            let whereConditions = ['is_active = true'];
            let queryParams = [];
            let paramIndex = 1;

            // Build WHERE conditions
            if (type) {
                whereConditions.push(`type = $${paramIndex}`);
                queryParams.push(type);
                paramIndex++;
            }

            if (format) {
                whereConditions.push(`format = $${paramIndex}`);
                queryParams.push(format);
                paramIndex++;
            }

            if (genre) {
                whereConditions.push(`genre ILIKE $${paramIndex}`);
                queryParams.push(`%${genre}%`);
                paramIndex++;
            }

            if (language) {
                whereConditions.push(`language = $${paramIndex}`);
                queryParams.push(language);
                paramIndex++;
            }

            if (access_level) {
                whereConditions.push(`access_level = $${paramIndex}`);
                queryParams.push(access_level);
                paramIndex++;
            }

            // Check user access level
            const userRole = req.user.role;
            if (userRole === 'student') {
                whereConditions.push(`access_level IN ('public', 'restricted')`);
            }

            // Full-text search
            if (search) {
                whereConditions.push(`(
                    to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(author, '')) 
                    @@ plainto_tsquery('english', $${paramIndex})
                    OR title ILIKE $${paramIndex + 1}
                    OR author ILIKE $${paramIndex + 1}
                )`);
                queryParams.push(search, `%${search}%`);
                paramIndex += 2;
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
            
            // Validate sort column
            const allowedSortColumns = ['title', 'author', 'publication_date', 'created_at', 'view_count', 'duration_seconds'];
            const sortColumn = allowedSortColumns.includes(sort) ? sort : 'title';
            const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

            const query = `
                SELECT 
                    id, title, description, type, format, file_path, external_url,
                    duration_seconds, quality, language, author, narrator, producer, 
                    publication_date, genre, subjects, keywords, content_rating, 
                    age_restriction, view_count, like_count, access_level, 
                    thumbnail_url, preview_url, chapters, subtitles_available, 
                    subtitle_languages, transcript_available, file_size_bytes, 
                    created_at, updated_at
                FROM media_resources 
                ${whereClause}
                ORDER BY ${sortColumn} ${sortOrder}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) 
                FROM media_resources 
                ${whereClause}
            `;
            const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
            const total = parseInt(countResult.rows[0].count);

            res.json({
                success: true,
                data: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching media resources:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching media resources',
                error: error.message
            });
        }
    }

    // Get media resource by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const query = `
                SELECT mr.*, 
                    CASE WHEN rp.id IS NOT NULL THEN 
                        json_build_object(
                            'progress_percentage', rp.progress_percentage,
                            'current_position', rp.current_position,
                            'last_accessed', rp.last_accessed
                        )
                    ELSE NULL END as progress
                FROM media_resources mr
                LEFT JOIN reading_progress rp ON mr.id = rp.resource_id 
                    AND rp.resource_type = 'media' 
                    AND rp.user_id = $2
                WHERE mr.id = $1 AND mr.is_active = true
            `;

            const result = await pool.query(query, [id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Media resource not found'
                });
            }

            const resource = result.rows[0];

            // Check access permissions
            const userRole = req.user.role;
            if (userRole === 'student' && resource.access_level === 'faculty_only') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to this resource'
                });
            }

            // Check age restriction
            if (resource.age_restriction && req.user.age && req.user.age < resource.age_restriction) {
                return res.status(403).json({
                    success: false,
                    message: 'Age restriction prevents access to this content'
                });
            }

            // Increment view count
            await pool.query(
                'UPDATE media_resources SET view_count = view_count + 1 WHERE id = $1',
                [id]
            );

            // Log access
            await this.logAccess(userId, id, 'play', req);

            res.json({
                success: true,
                data: resource
            });
        } catch (error) {
            console.error('Error fetching media resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching media resource',
                error: error.message
            });
        }
    }

    // Search media resources
    async search(req, res) {
        try {
            const {
                q: query,
                filters = {},
                page = 1,
                limit = 20
            } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            // Advanced search with ranking
            const searchQuery = `
                SELECT 
                    mr.*,
                    ts_rank(
                        to_tsvector('english', mr.title || ' ' || coalesce(mr.description, '') || ' ' || coalesce(mr.author, '')),
                        plainto_tsquery('english', $1)
                    ) as rank
                FROM media_resources mr
                WHERE 
                    mr.is_active = true
                    AND to_tsvector('english', mr.title || ' ' || coalesce(mr.description, '') || ' ' || coalesce(mr.author, ''))
                    @@ plainto_tsquery('english', $1)
                ORDER BY rank DESC, mr.view_count DESC
                LIMIT $2 OFFSET $3
            `;

            const offset = (page - 1) * limit;
            const result = await pool.query(searchQuery, [query, limit, offset]);

            // Log search
            await this.logSearch(req.user.id, query, result.rows.length, req);

            res.json({
                success: true,
                data: result.rows,
                query,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Error searching media resources:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching media resources',
                error: error.message
            });
        }
    }

    // Stream media resource
    async stream(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const range = req.headers.range;

            // Check if resource exists and user has access
            const resourceQuery = `
                SELECT * FROM media_resources 
                WHERE id = $1 AND is_active = true
            `;
            const resourceResult = await pool.query(resourceQuery, [id]);

            if (resourceResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Media resource not found'
                });
            }

            const resource = resourceResult.rows[0];

            // Check access permissions
            const userRole = req.user.role;
            if (userRole === 'student' && resource.access_level === 'faculty_only') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to stream this resource'
                });
            }

            // Handle external URLs (YouTube, Vimeo, etc.)
            if (resource.external_url) {
                return res.json({
                    success: true,
                    data: {
                        type: 'external',
                        url: resource.external_url,
                        title: resource.title,
                        description: resource.description,
                        thumbnail: resource.thumbnail_url
                    }
                });
            }

            // Handle local files with streaming support
            const filePath = path.join(__dirname, '..', 'uploads', 'media', resource.file_path);
            
            try {
                const stat = await fs.stat(filePath);
                const fileSize = stat.size;

                // Handle range requests for video streaming
                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    const chunksize = (end - start) + 1;

                    res.writeHead(206, {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': this.getMimeType(resource.format)
                    });

                    const stream = require('fs').createReadStream(filePath, { start, end });
                    stream.pipe(res);
                } else {
                    res.writeHead(200, {
                        'Content-Length': fileSize,
                        'Content-Type': this.getMimeType(resource.format)
                    });

                    const stream = require('fs').createReadStream(filePath);
                    stream.pipe(res);
                }

                // Log streaming access
                await this.logAccess(userId, id, 'play', req);
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    message: 'Media file not found on server'
                });
            }
        } catch (error) {
            console.error('Error streaming media resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error streaming media resource',
                error: error.message
            });
        }
    }

    // Create new media resource (Admin/Librarian only)
    async create(req, res) {
        try {
            const {
                title,
                description,
                type,
                format,
                duration_seconds,
                quality,
                language = 'English',
                author,
                narrator,
                producer,
                publication_date,
                genre,
                subjects = [],
                keywords = [],
                content_rating,
                age_restriction,
                access_level = 'public',
                external_url,
                subtitles_available = false,
                subtitle_languages = [],
                transcript_available = false,
                chapters = []
            } = req.body;

            // Validate required fields
            if (!title || !type || !format) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, type, and format are required'
                });
            }

            // Handle file upload (if provided)
            let file_path = null;
            let file_size_bytes = null;

            if (req.file) {
                file_path = req.file.filename;
                file_size_bytes = req.file.size;
            }

            const query = `
                INSERT INTO media_resources (
                    title, description, type, format, file_path, file_size_bytes,
                    duration_seconds, quality, language, author, narrator, producer,
                    publication_date, genre, subjects, keywords, content_rating,
                    age_restriction, access_level, external_url, subtitles_available,
                    subtitle_languages, transcript_available, chapters
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                    $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
                ) RETURNING *
            `;

            const values = [
                title, description, type, format, file_path, file_size_bytes,
                duration_seconds, quality, language, author, narrator, producer,
                publication_date, genre, subjects, keywords, content_rating,
                age_restriction, access_level, external_url, subtitles_available,
                subtitle_languages, transcript_available, chapters
            ];

            const result = await pool.query(query, values);

            res.status(201).json({
                success: true,
                message: 'Media resource created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating media resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating media resource',
                error: error.message
            });
        }
    }

    // Update media resource
    async update(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Build dynamic update query
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            const allowedFields = [
                'title', 'description', 'type', 'format', 'duration_seconds',
                'quality', 'language', 'author', 'narrator', 'producer',
                'publication_date', 'genre', 'subjects', 'keywords',
                'content_rating', 'age_restriction', 'access_level',
                'external_url', 'subtitles_available', 'subtitle_languages',
                'transcript_available', 'chapters'
            ];

            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key)) {
                    updateFields.push(`${key} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }

            if (updateFields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }

            updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
            values.push(id);

            const query = `
                UPDATE media_resources 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramIndex} AND is_active = true
                RETURNING *
            `;

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Media resource not found'
                });
            }

            res.json({
                success: true,
                message: 'Media resource updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating media resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating media resource',
                error: error.message
            });
        }
    }

    // Delete media resource (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;

            const query = `
                UPDATE media_resources 
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND is_active = true
                RETURNING id, title
            `;

            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Media resource not found'
                });
            }

            res.json({
                success: true,
                message: 'Media resource deleted successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error deleting media resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting media resource',
                error: error.message
            });
        }
    }

    // Update playback progress
    async updateProgress(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { 
                current_position, 
                progress_percentage,
                playback_duration 
            } = req.body;

            // Update or insert progress record
            const query = `
                INSERT INTO reading_progress (
                    user_id, resource_type, resource_id, current_position, 
                    progress_percentage, last_accessed
                ) VALUES ($1, 'media', $2, $3, $4, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id, resource_type, resource_id)
                DO UPDATE SET 
                    current_position = EXCLUDED.current_position,
                    progress_percentage = EXCLUDED.progress_percentage,
                    last_accessed = EXCLUDED.last_accessed
                RETURNING *
            `;

            const result = await pool.query(query, [
                userId, id, current_position, progress_percentage
            ]);

            // Log access with position data
            await this.logAccessWithPosition(userId, id, 'seek', current_position, playback_duration, req);

            res.json({
                success: true,
                message: 'Progress updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating progress:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating progress',
                error: error.message
            });
        }
    }

    // Get playback progress
    async getProgress(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const query = `
                SELECT * FROM reading_progress 
                WHERE user_id = $1 AND resource_type = 'media' AND resource_id = $2
            `;

            const result = await pool.query(query, [userId, id]);

            res.json({
                success: true,
                data: result.rows[0] || null
            });
        } catch (error) {
            console.error('Error fetching progress:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching progress',
                error: error.message
            });
        }
    }

    // Toggle like/unlike
    async toggleLike(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if user already liked this resource
            const existingLike = await pool.query(
                'SELECT id FROM bookmarks WHERE user_id = $1 AND resource_type = $2 AND resource_id = $3 AND bookmark_type = $4',
                [userId, 'media', id, 'favorite']
            );

            if (existingLike.rows.length > 0) {
                // Unlike - remove bookmark
                await pool.query(
                    'DELETE FROM bookmarks WHERE id = $1',
                    [existingLike.rows[0].id]
                );

                // Decrement like count
                await pool.query(
                    'UPDATE media_resources SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1',
                    [id]
                );

                res.json({
                    success: true,
                    message: 'Media unliked successfully',
                    liked: false
                });
            } else {
                // Like - add bookmark
                await pool.query(
                    `INSERT INTO bookmarks (user_id, resource_type, resource_id, bookmark_type)
                     VALUES ($1, 'media', $2, 'favorite')`,
                    [userId, id]
                );

                // Increment like count
                await pool.query(
                    'UPDATE media_resources SET like_count = like_count + 1 WHERE id = $1',
                    [id]
                );

                res.json({
                    success: true,
                    message: 'Media liked successfully',
                    liked: true
                });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            res.status(500).json({
                success: false,
                message: 'Error toggling like',
                error: error.message
            });
        }
    }

    // Helper methods
    async logAccess(userId, resourceId, accessType, req) {
        try {
            const query = `
                INSERT INTO media_access_logs (
                    user_id, media_resource_id, access_type, device_info, 
                    ip_address, user_agent
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `;

            const deviceInfo = {
                platform: req.headers['user-agent'],
                timestamp: new Date().toISOString()
            };

            await pool.query(query, [
                userId,
                resourceId,
                accessType,
                deviceInfo,
                req.ip,
                req.headers['user-agent']
            ]);
        } catch (error) {
            console.error('Error logging access:', error);
        }
    }

    async logAccessWithPosition(userId, resourceId, accessType, position, duration, req) {
        try {
            const query = `
                INSERT INTO media_access_logs (
                    user_id, media_resource_id, access_type, playback_position,
                    playback_duration, device_info, ip_address, user_agent
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;

            const deviceInfo = {
                platform: req.headers['user-agent'],
                timestamp: new Date().toISOString()
            };

            await pool.query(query, [
                userId,
                resourceId,
                accessType,
                position,
                duration,
                deviceInfo,
                req.ip,
                req.headers['user-agent']
            ]);
        } catch (error) {
            console.error('Error logging access with position:', error);
        }
    }

    async logSearch(userId, searchQuery, resultsCount, req) {
        try {
            const query = `
                INSERT INTO search_analytics (
                    user_id, search_query, search_type, results_count,
                    ip_address, user_agent
                ) VALUES ($1, $2, 'media', $3, $4, $5)
            `;

            await pool.query(query, [
                userId,
                searchQuery,
                resultsCount,
                req.ip,
                req.headers['user-agent']
            ]);
        } catch (error) {
            console.error('Error logging search:', error);
        }
    }

    // Generate AI-powered description for media resources
    async generateDescription(req, res) {
        try {
            const { title, type, format, genre, url, file_url, description } = req.body;

            if (!title && !description && !url && !file_url) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide at least title, description, URL, or file URL for analysis'
                });
            }

            let generatedDescription = '';
            let suggestions = {};

            // Generate description based on available information
            if (title || description) {
                // Content-based analysis using existing information
                const content = `${title || ''} ${description || ''}`.trim();
                
                if (content) {
                    // Basic content analysis and enhancement
                    const words = content.toLowerCase().split(/\s+/);
                    const mediaKeywords = {
                        'audio': ['music', 'song', 'audio', 'sound', 'track', 'album', 'artist', 'band', 'vocal', 'instrumental'],
                        'video': ['video', 'film', 'movie', 'documentary', 'tutorial', 'lesson', 'lecture', 'presentation', 'clip', 'episode'],
                        'educational': ['learn', 'education', 'tutorial', 'guide', 'lesson', 'course', 'training', 'workshop', 'seminar'],
                        'entertainment': ['entertainment', 'fun', 'comedy', 'drama', 'action', 'thriller', 'adventure', 'romance']
                    };

                    // Detect content type and generate enhanced description
                    let detectedCategories = [];
                    for (const [category, keywords] of Object.entries(mediaKeywords)) {
                        if (keywords.some(keyword => words.includes(keyword))) {
                            detectedCategories.push(category);
                        }
                    }

                    // Generate intelligent description
                    if (type === 'audio' || detectedCategories.includes('audio')) {
                        generatedDescription = `This audio resource "${title || 'Untitled'}" appears to be a ${format || 'digital'} format media file. `;
                        if (genre) generatedDescription += `Categorized under ${genre} genre, `;
                        generatedDescription += `it provides ${detectedCategories.includes('educational') ? 'educational' : 'entertainment'} content suitable for listening and learning.`;
                        
                        suggestions = {
                            recommendedGenres: ['Educational', 'Music', 'Podcast', 'Audiobook', 'Lecture'],
                            recommendedLanguage: 'English',
                            suggestedDuration: format === 'mp3' ? '30-60 minutes' : '15-45 minutes',
                            accessLevel: detectedCategories.includes('educational') ? 'Students & Faculty' : 'All Users'
                        };
                    } else if (type === 'video' || detectedCategories.includes('video')) {
                        generatedDescription = `This video resource "${title || 'Untitled'}" is a ${format || 'digital'} format media file. `;
                        if (genre) generatedDescription += `Categorized under ${genre}, `;
                        generatedDescription += `it offers ${detectedCategories.includes('educational') ? 'educational visual content' : 'video entertainment'} with informative value.`;
                        
                        suggestions = {
                            recommendedGenres: ['Educational', 'Documentary', 'Tutorial', 'Lecture', 'Entertainment'],
                            recommendedLanguage: 'English',
                            suggestedDuration: format === 'mp4' ? '45-120 minutes' : '20-90 minutes',
                            accessLevel: detectedCategories.includes('educational') ? 'Students & Faculty' : 'All Users'
                        };
                    } else {
                        generatedDescription = `This media resource "${title || 'Untitled'}" is a digital content file. `;
                        if (description) generatedDescription += `${description} `;
                        generatedDescription += `It provides valuable content for library users and supports various learning and entertainment purposes.`;
                        
                        suggestions = {
                            recommendedGenres: ['General', 'Educational', 'Reference'],
                            recommendedLanguage: 'English',
                            suggestedDuration: 'Variable',
                            accessLevel: 'All Users'
                        };
                    }

                    // Auto-detect format from URL if available
                    if (url || file_url) {
                        const mediaUrl = url || file_url;
                        const urlLower = mediaUrl.toLowerCase();
                        
                        if (urlLower.includes('.mp3') || urlLower.includes('.wav') || urlLower.includes('.m4a')) {
                            suggestions.detectedFormat = 'Audio';
                            suggestions.detectedType = 'audio';
                        } else if (urlLower.includes('.mp4') || urlLower.includes('.avi') || urlLower.includes('.mov')) {
                            suggestions.detectedFormat = 'Video';
                            suggestions.detectedType = 'video';
                        }
                    }
                }
            }

            // Fallback if no content available
            if (!generatedDescription) {
                generatedDescription = `This is a media resource file that has been added to the digital library. It contains ${type || 'multimedia'} content that can be accessed by authorized users for educational and entertainment purposes.`;
                
                suggestions = {
                    recommendedGenres: ['General', 'Uncategorized'],
                    recommendedLanguage: 'English',
                    suggestedDuration: 'Unknown',
                    accessLevel: 'All Users',
                    note: 'Please add more details like title or description for better AI analysis'
                };
            }

            res.json({
                success: true,
                message: 'Description generated successfully',
                generatedDescription,
                suggestions,
                analysis: {
                    hasTitle: !!title,
                    hasDescription: !!description,
                    hasUrl: !!(url || file_url),
                    contentLength: (title || '').length + (description || '').length,
                    analysisType: 'content-based'
                }
            });

        } catch (error) {
            console.error('Error generating media description:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate description',
                error: error.message
            });
        }
    }

    getMimeType(format) {
        const mimeTypes = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'mp4': 'video/mp4',
            'avi': 'video/x-msvideo',
            'mkv': 'video/x-matroska',
            'webm': 'video/webm',
            'm4a': 'audio/mp4',
            'flac': 'audio/flac'
        };
        return mimeTypes[format] || 'application/octet-stream';
    }
}

module.exports = new MediaResourceController();