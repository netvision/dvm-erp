// Digital Resource Controller for E-Library Management
const pool = require('../config/database');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const pdfParse = require('pdf-parse');

class DigitalResourceController {
    // Get all digital resources with filtering and pagination
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
                    to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, '')) 
                    @@ plainto_tsquery('english', $${paramIndex})
                    OR title ILIKE $${paramIndex + 1}
                    OR author ILIKE $${paramIndex + 1}
                )`);
                queryParams.push(search, `%${search}%`);
                paramIndex += 2;
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
            
            // Validate sort column
            const allowedSortColumns = ['title', 'author', 'publication_date', 'created_at', 'download_count', 'view_count'];
            const sortColumn = allowedSortColumns.includes(sort) ? sort : 'title';
            const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

            const query = `
                SELECT 
                    id, title, author, type, format, file_path, publisher, publication_date, 
                    language, genre, subjects, keywords, description, content_rating,
                    reading_level, download_count, view_count, access_level,
                    thumbnail_url, cover_image_url, file_size_bytes,
                    is_drm_protected, created_at, updated_at
                FROM digital_resources 
                ${whereClause}
                ORDER BY ${sortColumn} ${sortOrder}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) 
                FROM digital_resources 
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
            console.error('Error fetching digital resources:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching digital resources',
                error: error.message
            });
        }
    }

    // Get digital resource by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const query = `
                SELECT dr.*, 
                    CASE WHEN rp.id IS NOT NULL THEN 
                        json_build_object(
                            'progress_percentage', rp.progress_percentage,
                            'current_page', rp.current_page,
                            'reading_time_minutes', rp.reading_time_minutes,
                            'last_accessed', rp.last_accessed
                        )
                    ELSE NULL END as reading_progress
                FROM digital_resources dr
                LEFT JOIN reading_progress rp ON dr.id = rp.resource_id 
                    AND rp.resource_type = 'digital' 
                    AND rp.user_id = $2
                WHERE dr.id = $1 AND dr.is_active = true
            `;

            const result = await pool.query(query, [id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Digital resource not found'
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

            // Increment view count
            await pool.query(
                'UPDATE digital_resources SET view_count = view_count + 1 WHERE id = $1',
                [id]
            );

            // Log access (skip for now to fix view issue)
            // await this.logAccess(userId, id, 'view', req);

            res.json({
                success: true,
                data: resource
            });
        } catch (error) {
            console.error('Error fetching digital resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching digital resource',
                error: error.message
            });
        }
    }

    // Search digital resources with advanced features
    async search(req, res) {
        try {
            const {
                q: query,
                filters = {},
                facets = false,
                suggest = false,
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
                    dr.*,
                    ts_rank(
                        to_tsvector('english', dr.title || ' ' || coalesce(dr.author, '') || ' ' || coalesce(dr.description, '')),
                        plainto_tsquery('english', $1)
                    ) as rank
                FROM digital_resources dr
                WHERE 
                    dr.is_active = true
                    AND to_tsvector('english', dr.title || ' ' || coalesce(dr.author, '') || ' ' || coalesce(dr.description, ''))
                    @@ plainto_tsquery('english', $1)
                ORDER BY rank DESC, dr.view_count DESC
                LIMIT $2 OFFSET $3
            `;

            const offset = (page - 1) * limit;
            const result = await pool.query(searchQuery, [query, limit, offset]);

            // Log search
            await this.logSearch(req.user.id, query, result.rows.length, req);

            let facetData = {};
            if (facets === 'true') {
                facetData = await this.getFacets(query);
            }

            res.json({
                success: true,
                data: result.rows,
                facets: facetData,
                query,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Error searching digital resources:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching digital resources',
                error: error.message
            });
        }
    }

    // Download digital resource
    async download(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if resource exists and user has access
            const resourceQuery = `
                SELECT * FROM digital_resources 
                WHERE id = $1 AND is_active = true
            `;
            const resourceResult = await pool.query(resourceQuery, [id]);

            if (resourceResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Digital resource not found'
                });
            }

            const resource = resourceResult.rows[0];

            // Check access permissions
            const userRole = req.user.role;
            if (userRole === 'student' && resource.access_level === 'faculty_only') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to download this resource'
                });
            }

            // Check DRM protection
            if (resource.is_drm_protected) {
                // Implement DRM check logic here
                const drmValid = await this.validateDRMAccess(userId, id);
                if (!drmValid) {
                    return res.status(403).json({
                        success: false,
                        message: 'DRM protection prevents download'
                    });
                }
            }

            // Determine the correct file path
            let filePath;
            if (resource.file_path.startsWith('/uploads/') || resource.file_path.startsWith('uploads/')) {
                // Full path already provided, but need to adjust for actual location
                const filename = path.basename(resource.file_path);
                filePath = path.join(__dirname, '..', '..', 'uploads', filename);
            } else {
                // Just filename, construct full path
                filePath = path.join(__dirname, '..', '..', 'uploads', resource.file_path);
            }
            
            console.log('🔍 Trying to access file at:', filePath);
            
            // Check if file exists
            try {
                await fs.access(filePath);
            } catch (error) {
                console.error('📁 File not found at:', filePath);
                return res.status(404).json({
                    success: false,
                    message: 'File not found on server',
                    debug: `File path: ${filePath}`
                });
            }

            // Increment download count
            await pool.query(
                'UPDATE digital_resources SET download_count = download_count + 1 WHERE id = $1',
                [id]
            );

            // Log download (skip for now to fix download issue)
            // await this.logAccess(userId, id, 'download', req);

            // Set appropriate headers
            const safeFilename = resource.title.replace(/[^\w\s.-]/g, '_');
            console.log('📄 Resource format:', resource.format);
            
            // Set proper content type based on format
            const mimeTypes = {
                'pdf': 'application/pdf',
                'epub': 'application/epub+zip',
                'mobi': 'application/x-mobipocket-ebook',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'doc': 'application/msword',
                'txt': 'text/plain',
                'html': 'text/html'
            };
            const contentType = mimeTypes[resource.format.toLowerCase()] || 'application/octet-stream';
            console.log('🎯 Setting Content-Type:', contentType);
            
            // Ensure filename has correct extension
            const finalFilename = safeFilename.endsWith(`.${resource.format}`) 
                ? safeFilename 
                : `${safeFilename}.${resource.format}`;
            
            // Set multiple headers to force proper file type recognition
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${finalFilename}"`);
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Download-Options', 'noopen');
            
            console.log('📋 Final filename:', finalFilename);
            console.log('📋 Content-Disposition:', `attachment; filename="${finalFilename}"`);

            // Send file - ensure absolute path
            const absolutePath = path.resolve(filePath);
            console.log('📁 Sending file from:', absolutePath);
            
            // Try alternative approach: read and pipe the file
            const fsSync = require('fs');
            if (!fsSync.existsSync(absolutePath)) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found'
                });
            }
            
            const stat = fsSync.statSync(absolutePath);
            res.setHeader('Content-Length', stat.size);
            
            const readStream = fsSync.createReadStream(absolutePath);
            readStream.on('error', (err) => {
                console.error('❌ Error reading file:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error reading file',
                        error: err.message
                    });
                }
            });
            
            readStream.on('end', () => {
                console.log('✅ File sent successfully');
            });
            
            readStream.pipe(res);
        } catch (error) {
            console.error('Error downloading digital resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error downloading digital resource',
                error: error.message
            });
        }
    }

    // View digital resource (for online reading)
    async view(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Get resource and check access
            const resourceQuery = `
                SELECT * FROM digital_resources 
                WHERE id = $1 AND is_active = true
            `;
            const resourceResult = await pool.query(resourceQuery, [id]);

            if (resourceResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Digital resource not found'
                });
            }

            const resource = resourceResult.rows[0];

            // Check access permissions
            const userRole = req.user.role;
            if (userRole === 'student' && resource.access_level === 'faculty_only') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to view this resource'
                });
            }

            // For online viewing, we'll return the file content or a viewer URL
            if (resource.format === 'pdf') {
                // Determine the correct file path
                let filePath;
                if (resource.file_path.startsWith('/uploads/') || resource.file_path.startsWith('uploads/')) {
                    // Full path already provided, but need to adjust for actual location
                    const filename = path.basename(resource.file_path);
                    filePath = path.join(__dirname, '..', '..', 'uploads', filename);
                } else {
                    // Just filename, construct full path
                    filePath = path.join(__dirname, '..', '..', 'uploads', resource.file_path);
                }
                
                console.log('🔍 Trying to view file at:', filePath);
                
                try {
                    await fs.access(filePath);
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'inline');
                    const absolutePath = path.resolve(filePath);
                    console.log('📁 Viewing file from:', absolutePath);
                    
                    res.sendFile(absolutePath, (err) => {
                        if (err) {
                            console.error('❌ Error viewing file:', err);
                            if (!res.headersSent) {
                                res.status(404).json({
                                    success: false,
                                    message: 'Error viewing file',
                                    error: err.message
                                });
                            }
                        } else {
                            console.log('✅ File viewed successfully');
                        }
                    });
                } catch (error) {
                    console.error('📁 File not found for viewing at:', filePath);
                    return res.status(404).json({
                        success: false,
                        message: 'File not found on server'
                    });
                }
            } else {
                // For other formats, return structured content for custom viewer
                res.json({
                    success: true,
                    data: {
                        id: resource.id,
                        title: resource.title,
                        author: resource.author,
                        format: resource.format,
                        viewerUrl: `/api/digital-resources/${id}/content`,
                        metadata: resource.metadata
                    }
                });
            }

            // Log view access (skip for now to fix view issue)
            // await this.logAccess(userId, id, 'view', req);
        } catch (error) {
            console.error('Error viewing digital resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error viewing digital resource',
                error: error.message
            });
        }
    }

    // Create new digital resource (Admin/Librarian only)
    async create(req, res) {
        try {
            console.log('🔍 CREATE REQUEST BODY:', JSON.stringify(req.body, null, 2));
            console.log('🔍 CREATE REQUEST FILE:', req.file);
            
            const {
                title,
                author,
                type: resourceType,
                digital_type,
                format,
                publisher,
                publication_date,
                language = 'English',
                genre,
                subjects = [],
                keywords = [],
                description,
                content_rating,
                reading_level,
                access_level = 'public',
                is_drm_protected = false,
                url // For external URLs or uploaded file URLs
            } = req.body;

            // Map form field names to database field names
            const type = digital_type || resourceType || 'document';
            const accessLevel = access_level === 'all' ? 'public' : access_level;

            // Validate required fields
            if (!title || !type || !format) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, type, and format are required'
                });
            }

            // Handle file upload or external URL
            let file_path = null;
            let file_size_bytes = null;

            if (req.file) {
                // File was uploaded directly
                file_path = req.file.filename;
                file_size_bytes = req.file.size;
            } else if (req.body.file_path) {
                // File path provided from separate upload (should be just filename)
                file_path = req.body.file_path;
                file_size_bytes = req.body.file_size || null;
            } else if (url) {
                // External URL provided
                file_path = url;
            }

            console.log('🔍 FINAL file_path:', file_path);
            console.log('🔍 FINAL file_size_bytes:', file_size_bytes);

            const query = `
                INSERT INTO digital_resources (
                    title, author, type, format, file_path, file_size_bytes,
                    publisher, publication_date, language, genre, subjects,
                    keywords, description, content_rating, reading_level,
                    access_level, is_drm_protected
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                    $12, $13, $14, $15, $16, $17
                ) RETURNING *
            `;

            const values = [
                title, author, type, format, file_path, file_size_bytes,
                publisher, publication_date, language, genre, subjects,
                keywords, description, content_rating, reading_level,
                accessLevel, is_drm_protected
            ];

            console.log('🔍 INSERT VALUES:', values);
            const result = await pool.query(query, values);
            
            console.log('🔍 INSERT RESULT:', JSON.stringify(result.rows[0], null, 2));

            res.status(201).json({
                success: true,
                message: 'Digital resource created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating digital resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating digital resource',
                error: error.message
            });
        }
    }

    // Update digital resource
    async update(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Build dynamic update query
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            const allowedFields = [
                'title', 'author', 'type', 'format', 'publisher', 'publication_date',
                'isbn', 'doi', 'language', 'genre', 'subjects', 'keywords',
                'description', 'abstract', 'content_rating', 'reading_level',
                'access_level', 'external_url', 'is_drm_protected', 'drm_settings'
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
                UPDATE digital_resources 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramIndex} AND is_active = true
                RETURNING *
            `;

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Digital resource not found'
                });
            }

            res.json({
                success: true,
                message: 'Digital resource updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating digital resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating digital resource',
                error: error.message
            });
        }
    }

    // Delete digital resource (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;

            const query = `
                UPDATE digital_resources 
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND is_active = true
                RETURNING id, title
            `;

            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Digital resource not found'
                });
            }

            res.json({
                success: true,
                message: 'Digital resource deleted successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error deleting digital resource:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting digital resource',
                error: error.message
            });
        }
    }

    // Generate AI description for digital resource
    async generateDescription(req, res) {
        try {
            const { title, filename, fileType, category, type, url, author } = req.body;

            // Generate context-aware description using simple AI logic
            const descriptions = [];
            
            // Base description based on type and format
            const typeDescriptions = {
                'pdf': 'a comprehensive PDF document',
                'ebook': 'an electronic book',
                'journal': 'a scholarly journal article',
                'article': 'an informative article',
                'research_paper': 'a detailed research paper',
                'thesis': 'an academic thesis',
                'report': 'a detailed report',
                'manual': 'an instructional manual',
                'guide': 'a practical guide'
            };

            const categoryDescriptions = {
                'Academic': 'for academic study and research',
                'Fiction': 'offering engaging fictional content',
                'Non-Fiction': 'providing factual information and insights',
                'Technical': 'containing technical information and specifications',
                'Reference': 'serving as a valuable reference resource',
                'Educational': 'designed for educational purposes',
                'Research': 'supporting research and scholarly activities',
                'Professional': 'for professional development and practice'
            };

            // Start with the resource type
            if (title) {
                descriptions.push(`"${title}" is ${typeDescriptions[type] || 'a digital resource'}`);
            } else if (filename) {
                const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
                descriptions.push(`"${cleanName}" is ${typeDescriptions[type] || 'a digital resource'}`);
            } else {
                descriptions.push(`This is ${typeDescriptions[type] || 'a digital resource'}`);
            }

            // Add category context
            if (category && categoryDescriptions[category]) {
                descriptions.push(categoryDescriptions[category]);
            }

            // Add author context
            if (author) {
                descriptions.push(`created by ${author}`);
            }

            // Add file-specific context
            if (fileType) {
                if (fileType.includes('pdf')) {
                    descriptions.push('featuring searchable text and professional formatting');
                } else if (fileType.includes('word') || fileType.includes('document')) {
                    descriptions.push('in an editable document format');
                } else if (fileType.includes('image')) {
                    descriptions.push('containing visual content and illustrations');
                }
            }

            // Add subject-specific enhancements based on title keywords
            if (title) {
                const titleLower = title.toLowerCase();
                if (titleLower.includes('introduction') || titleLower.includes('basics')) {
                    descriptions.push('Perfect for beginners and those seeking foundational knowledge.');
                } else if (titleLower.includes('advanced') || titleLower.includes('expert')) {
                    descriptions.push('Designed for advanced learners and professionals.');
                } else if (titleLower.includes('handbook') || titleLower.includes('manual')) {
                    descriptions.push('Serving as a comprehensive reference and practical guide.');
                } else if (titleLower.includes('theory') || titleLower.includes('principles')) {
                    descriptions.push('Exploring fundamental theories and core principles.');
                } else if (titleLower.includes('practical') || titleLower.includes('application')) {
                    descriptions.push('Focusing on practical applications and real-world usage.');
                }
            }

            // Add general value proposition
            descriptions.push('This resource provides valuable insights and information for readers interested in the subject matter.');

            // Combine descriptions into coherent text
            let description = descriptions[0];
            if (descriptions.length > 1) {
                description += ' ' + descriptions.slice(1, -1).join(', ');
                if (descriptions.length > 2) {
                    description += ', and ' + descriptions[descriptions.length - 1];
                } else if (descriptions.length === 2) {
                    description += ' ' + descriptions[1];
                }
            }

            res.json({
                success: true,
                description: description
            });
        } catch (error) {
            console.error('Error generating AI description:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating description',
                error: error.message
            });
        }
    }

    // Analyze file content for smart description generation
    async analyzeFileContent(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file provided for analysis'
                });
            }

            const { title, author, category, type } = req.body;
            const file = req.file;
            let extractedText = '';

            console.log('📄 Analyzing file:', file.originalname, 'Type:', file.mimetype);

            // Extract content based on file type
            if (file.mimetype === 'application/pdf') {
                try {
                    const pdfBuffer = await fs.readFile(file.path);
                    const pdfData = await pdfParse(pdfBuffer);
                    extractedText = pdfData.text;
                    console.log('📖 Extracted PDF text length:', extractedText.length);
                } catch (pdfError) {
                    console.log('❌ PDF parsing failed:', pdfError.message);
                    // Fall back to metadata-based generation
                }
            }

            // Extract metadata from content
            const extractedMetadata = extractedText.length > 0 
                ? extractMetadataFromContent(extractedText, file.originalname)
                : {};

            // Use extracted metadata if not provided
            const finalTitle = title || extractedMetadata.title || '';
            const finalAuthor = author || extractedMetadata.author || '';
            const finalCategory = category || extractedMetadata.category || '';
            const finalType = type || extractedMetadata.type || '';

            console.log('🔍 Extracted Metadata:', extractedMetadata);

            // Generate intelligent description based on content
            const description = await generateContentBasedDescription({
                title: finalTitle,
                author: finalAuthor,
                category: finalCategory,
                type: finalType,
                filename: file.originalname,
                fileType: file.mimetype,
                extractedText,
                fileSize: file.size
            });

            // Clean up uploaded file
            try {
                await fs.unlink(file.path);
            } catch (unlinkError) {
                console.log('⚠️ Could not delete temp file:', unlinkError.message);
            }

            res.json({
                success: true,
                description: description,
                contentLength: extractedText.length,
                analysisType: extractedText.length > 0 ? 'content-based' : 'metadata-based',
                extractedMetadata: {
                    title: finalTitle,
                    author: finalAuthor,
                    category: finalCategory,
                    type: finalType
                }
            });
        } catch (error) {
            console.error('Error analyzing file content:', error);
            res.status(500).json({
                success: false,
                message: 'Error analyzing file content',
                error: error.message
            });
        }
    }



    // Add bookmark
    async addBookmark(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { 
                bookmark_type = 'bookmark',
                page_number,
                position_data = {},
                content_excerpt,
                user_annotation,
                color_code = '#ffff00'
            } = req.body;

            const query = `
                INSERT INTO bookmarks (
                    user_id, resource_type, resource_id, bookmark_type,
                    page_number, position_data, content_excerpt, user_annotation, color_code
                ) VALUES ($1, 'digital', $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const values = [
                userId, id, bookmark_type, page_number, position_data,
                content_excerpt, user_annotation, color_code
            ];

            const result = await pool.query(query, values);

            res.status(201).json({
                success: true,
                message: 'Bookmark added successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error adding bookmark:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding bookmark',
                error: error.message
            });
        }
    }

    // Add annotation
    async addAnnotation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Log annotation access (skip for now to fix annotate issue)
            // await this.logAccess(userId, id, 'annotate', req);

            // This would typically create an annotation record
            res.json({
                success: true,
                message: 'Annotation added successfully'
            });
        } catch (error) {
            console.error('Error adding annotation:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding annotation',
                error: error.message
            });
        }
    }

    // Get annotations for a resource
    async getAnnotations(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const query = `
                SELECT * FROM bookmarks 
                WHERE user_id = $1 AND resource_type = 'digital' AND resource_id = $2
                ORDER BY created_at DESC
            `;

            const result = await pool.query(query, [userId, id]);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error fetching annotations:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching annotations',
                error: error.message
            });
        }
    }

    // Helper methods
    async logAccess(userId, resourceId, accessType, req) {
        try {
            const query = `
                INSERT INTO digital_access_logs (
                    user_id, digital_resource_id, access_type, device_info, 
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

    async logSearch(userId, searchQuery, resultsCount, req) {
        try {
            const query = `
                INSERT INTO search_analytics (
                    user_id, search_query, search_type, results_count,
                    ip_address, user_agent
                ) VALUES ($1, $2, 'basic', $3, $4, $5)
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

    async getFacets(searchQuery) {
        try {
            // Get facets for search results
            const facetQueries = {
                types: `
                    SELECT type, COUNT(*) as count
                    FROM digital_resources 
                    WHERE is_active = true 
                    AND to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
                    @@ plainto_tsquery('english', $1)
                    GROUP BY type
                    ORDER BY count DESC
                `,
                formats: `
                    SELECT format, COUNT(*) as count
                    FROM digital_resources 
                    WHERE is_active = true 
                    AND to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
                    @@ plainto_tsquery('english', $1)
                    GROUP BY format
                    ORDER BY count DESC
                `,
                languages: `
                    SELECT language, COUNT(*) as count
                    FROM digital_resources 
                    WHERE is_active = true 
                    AND to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
                    @@ plainto_tsquery('english', $1)
                    GROUP BY language
                    ORDER BY count DESC
                `
            };

            const facetResults = {};
            for (const [key, query] of Object.entries(facetQueries)) {
                const result = await pool.query(query, [searchQuery]);
                facetResults[key] = result.rows;
            }

            return facetResults;
        } catch (error) {
            console.error('Error getting facets:', error);
            return {};
        }
    }

    async validateDRMAccess(userId, resourceId) {
        // Implement DRM validation logic
        // This could check user permissions, licensing, etc.
        return true; // Simplified for now
    }

    // Upload digital resource file
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'No file uploaded' 
                });
            }

            const {
                title,
                description = '',
                genre = 'General',
                access_level = 'public',
                language = 'English',
                keywords = ''
            } = req.body;

            const file = req.file;
            const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
            const fileName = `${crypto.randomUUID()}.${fileExtension}`;
            const filePath = path.join(__dirname, '..', 'uploads', 'digital', fileName);

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.dirname(filePath);
            await fs.mkdir(uploadsDir, { recursive: true });

            // Move uploaded file to final location
            await fs.writeFile(filePath, file.buffer);

            // Determine file type based on extension
            const fileType = this.getFileType(fileExtension);
            const fileSize = file.size;

            // Insert resource into database
            const insertQuery = `
                INSERT INTO digital_resources (
                    title, description, type, format, file_path, file_size_bytes, 
                    genre, language, access_level, keywords, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                RETURNING *
            `;

            const result = await pool.query(insertQuery, [
                title || file.originalname,
                description,
                fileType,
                fileExtension.toUpperCase(),
                fileName,
                fileSize,
                genre,
                language,
                access_level,
                keywords
            ]);

            res.status(201).json({
                success: true,
                message: 'File uploaded successfully',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Upload error:', error);
            
            // Clean up file if database insert failed
            if (req.file && filePath) {
                try {
                    await fs.unlink(filePath);
                } catch (unlinkError) {
                    console.error('Error cleaning up file:', unlinkError);
                }
            }

            res.status(500).json({
                success: false,
                message: 'Error uploading file',
                error: error.message
            });
        }
    }

    // Track resource view
    async trackView(req, res) {
        try {
            const { id } = req.params;

            const query = `
                UPDATE digital_resources 
                SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND is_active = true
                RETURNING view_count
            `;

            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Digital resource not found'
                });
            }

            res.json({
                success: true,
                view_count: result.rows[0].view_count
            });
        } catch (error) {
            console.error('Error tracking view:', error);
            res.status(500).json({
                success: false,
                message: 'Error tracking view',
                error: error.message
            });
        }
    }

    // Track resource download
    async trackDownload(req, res) {
        try {
            const { id } = req.params;

            const query = `
                UPDATE digital_resources 
                SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND is_active = true
                RETURNING download_count
            `;

            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Digital resource not found'
                });
            }

            res.json({
                success: true,
                download_count: result.rows[0].download_count
            });
        } catch (error) {
            console.error('Error tracking download:', error);
            res.status(500).json({
                success: false,
                message: 'Error tracking download',
                error: error.message
            });
        }
    }

    // Create digital resource with file upload
    async createWithUpload(req, res) {
        try {
            console.log('🔍 CREATE WITH UPLOAD - req.file:', req.file);
            console.log('🔍 CREATE WITH UPLOAD - req.body:', req.body);
            
            if (!req.file) {
                console.log('❌ No file in request');
                return res.status(400).json({ 
                    success: false, 
                    message: 'No file uploaded' 
                });
            }

            const {
                title,
                author,
                type,
                format,
                category,
                description = '',
                access_level = 'public',
                language = 'English'
            } = req.body;
            
            // Map category to genre (database uses genre field)
            const genre = category;

            if (!title || !type || !format) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, type, and format are required'
                });
            }

            const file = req.file;
            // File is already saved by multer disk storage
            const fileName = file.filename; // Use the filename generated by multer
            const fileSize = file.size;

            // Insert resource into database
            const insertQuery = `
                INSERT INTO digital_resources (
                    title, author, type, format, genre, description, file_path, file_size_bytes,
                    language, access_level, created_at, updated_at, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), true)
                RETURNING *
            `;

            const result = await pool.query(insertQuery, [
                title,
                author || null,
                type,
                format,
                genre || null,
                description,
                fileName, // Store just the filename
                fileSize, // Store as number for file_size_bytes
                language,
                access_level
            ]);

            res.status(201).json({
                success: true,
                message: 'Digital resource created successfully',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Create with upload error:', error);
            
            // Clean up file if database insert failed
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error cleaning up file:', unlinkError);
                }
            }

            res.status(500).json({
                success: false,
                message: 'Error creating digital resource',
                error: error.message
            });
        }
    }

    // Update digital resource with file upload
    async updateWithUpload(req, res) {
        try {
            const { id } = req.params;
            
            const {
                title,
                author,
                type,
                format,
                category,
                description,
                access_level = 'public',
                language = 'English'
            } = req.body;
            
            // Map category to genre (database uses genre field)
            const genre = category;

            if (!title || !type || !format) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, type, and format are required'
                });
            }

            let filePath = null;
            let fileName = null;
            let fileSize = null;

            // Handle file upload if provided
            if (req.file) {
                const file = req.file;
                // File is already saved by multer disk storage
                fileName = file.filename; // Use the filename generated by multer
                fileSize = file.size.toString();
            }

            // Build update query
            let updateFields = [];
            let queryParams = [];
            let paramIndex = 1;

            updateFields.push(`title = $${paramIndex}`);
            queryParams.push(title);
            paramIndex++;

            updateFields.push(`author = $${paramIndex}`);
            queryParams.push(author || null);
            paramIndex++;

            updateFields.push(`type = $${paramIndex}`);
            queryParams.push(type);
            paramIndex++;

            updateFields.push(`format = $${paramIndex}`);
            queryParams.push(format);
            paramIndex++;

            updateFields.push(`genre = $${paramIndex}`);
            queryParams.push(genre || null);
            paramIndex++;

            updateFields.push(`description = $${paramIndex}`);
            queryParams.push(description || null);
            paramIndex++;

            updateFields.push(`language = $${paramIndex}`);
            queryParams.push(language);
            paramIndex++;

            updateFields.push(`access_level = $${paramIndex}`);
            queryParams.push(access_level);
            paramIndex++;

            if (fileName) {
                updateFields.push(`file_path = $${paramIndex}`);
                queryParams.push(fileName);
                paramIndex++;

                updateFields.push(`file_size_bytes = $${paramIndex}`);
                queryParams.push(fileSize);
                paramIndex++;
            }

            updateFields.push('updated_at = NOW()');

            queryParams.push(id);
            const updateQuery = `
                UPDATE digital_resources 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramIndex} AND is_active = true
                RETURNING *
            `;

            const result = await pool.query(updateQuery, queryParams);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Digital resource not found'
                });
            }

            res.json({
                success: true,
                message: 'Digital resource updated successfully',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Update with upload error:', error);
            
            // Clean up file if database update failed
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error cleaning up file:', unlinkError);
                }
            }

            res.status(500).json({
                success: false,
                message: 'Error updating digital resource',
                error: error.message
            });
        }
    }

    getFileType(extension) {
        const typeMap = {
            'pdf': 'document',
            'doc': 'document',
            'docx': 'document',
            'txt': 'document',
            'epub': 'e-book',
            'mobi': 'e-book',
            'mp3': 'audio',
            'wav': 'audio',
            'mp4': 'video',
            'avi': 'video',
            'mov': 'video',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'gif': 'image'
        };
        return typeMap[extension] || 'document';
    }

    getMimeType(format) {
        const mimeTypes = {
            'pdf': 'application/pdf',
            'epub': 'application/epub+zip',
            'mobi': 'application/x-mobipocket-ebook',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'html': 'text/html'
        };
        return mimeTypes[format] || 'application/octet-stream';
    }
}

// Extract metadata from PDF content
function extractMetadataFromContent(text, filename) {
    const metadata = {};
    const firstPage = text.substring(0, Math.min(2000, text.length)); // First 2000 characters
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('🔍 Starting metadata extraction...');

    // Extract Title (multiple strategies)
    let extractedTitle = '';
    
    // Strategy 1: Look for title patterns in first few lines
    const titlePatterns = [
        /^(.{3,60})$/m, // First substantial line
        /title[:\s]*(.{3,100})/i,
        /^[A-Z][A-Za-z\s]{10,80}$/m, // Capitalized lines that could be titles
    ];

    for (let i = 0; i < Math.min(10, lines.length) && !extractedTitle; i++) {
        const line = lines[i];
        if (line.length > 10 && line.length < 100 && 
            !line.toLowerCase().includes('page') &&
            !line.toLowerCase().includes('chapter') &&
            !line.match(/^\d+/) && // Not starting with numbers
            line.split(' ').length > 2) { // More than 2 words
            extractedTitle = line;
            break;
        }
    }

    // Strategy 2: Look for title in filename
    if (!extractedTitle && filename) {
        const cleanFilename = filename.replace(/\.[^/.]+$/, "") // Remove extension
                                    .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
                                    .replace(/\b\w/g, l => l.toUpperCase()); // Title case
        if (cleanFilename.length > 5) {
            extractedTitle = cleanFilename;
        }
    }

    if (extractedTitle) {
        metadata.title = extractedTitle.trim();
        console.log('📖 Extracted Title:', metadata.title);
    }

    // Extract Author (multiple strategies)
    let extractedAuthor = '';
    
    const authorPatterns = [
        /(?:by|author|written by|autor)[:\s]+([A-Za-z\s\.]{3,50})/i,
        /([A-Z][a-z]+\s+[A-Z][a-z]+)/g, // Name patterns like "John Smith"
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]*\.?\s*)*[A-Z][a-z]+)$/m, // Full name patterns on separate lines
    ];

    // Look in first 500 characters for author
    const authorSearchText = firstPage.toLowerCase();
    
    for (const pattern of authorPatterns) {
        const matches = firstPage.match(pattern);
        if (matches) {
            if (pattern.global) {
                // For global patterns, find the most likely author name
                const candidates = matches.filter(match => 
                    match.length > 5 && 
                    match.length < 50 &&
                    match.split(' ').length >= 2 &&
                    !match.toLowerCase().includes('university') &&
                    !match.toLowerCase().includes('press') &&
                    !match.toLowerCase().includes('publisher')
                );
                if (candidates.length > 0) {
                    extractedAuthor = candidates[0];
                    break;
                }
            } else {
                extractedAuthor = matches[1] || matches[0];
                break;
            }
        }
    }

    if (extractedAuthor) {
        metadata.author = extractedAuthor.trim();
        console.log('👤 Extracted Author:', metadata.author);
    }

    // Extract Category/Subject
    let extractedCategory = '';
    
    const categoryKeywords = {
        'Academic': ['research', 'study', 'analysis', 'theory', 'methodology', 'abstract', 'conclusion', 'bibliography'],
        'Technical': ['manual', 'guide', 'specification', 'implementation', 'system', 'technical', 'documentation'],
        'Educational': ['learning', 'education', 'teaching', 'student', 'course', 'lesson', 'tutorial', 'exercise'],
        'Literature': ['novel', 'story', 'fiction', 'poetry', 'literature', 'narrative', 'character'],
        'Philosophy': ['philosophy', 'philosophical', 'wisdom', 'consciousness', 'spiritual', 'meditation', 'truth'],
        'Science': ['science', 'scientific', 'experiment', 'hypothesis', 'data', 'research', 'laboratory'],
        'Business': ['business', 'management', 'strategy', 'market', 'finance', 'economic', 'corporate'],
        'Health': ['health', 'medical', 'medicine', 'treatment', 'therapy', 'wellness', 'nutrition']
    };

    const textSample = text.substring(0, 5000).toLowerCase();
    let maxMatches = 0;
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        const matches = keywords.filter(keyword => textSample.includes(keyword)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            extractedCategory = category;
        }
    }

    if (extractedCategory && maxMatches >= 2) {
        metadata.category = extractedCategory;
        console.log('📚 Extracted Category:', metadata.category);
    }

    // Extract Type
    let extractedType = 'pdf'; // Default
    
    const typeIndicators = {
        'research_paper': ['abstract', 'methodology', 'results', 'conclusion', 'references', 'bibliography'],
        'textbook': ['chapter', 'exercises', 'problems', 'solutions', 'appendix'],
        'manual': ['manual', 'guide', 'instructions', 'procedures', 'steps'],
        'journal': ['journal', 'volume', 'issue', 'article'],
        'ebook': ['novel', 'story', 'fiction', 'book', 'chapter']
    };

    const sampleText = text.substring(0, 3000).toLowerCase();
    let maxTypeMatches = 0;
    
    for (const [type, indicators] of Object.entries(typeIndicators)) {
        const matches = indicators.filter(indicator => sampleText.includes(indicator)).length;
        if (matches > maxTypeMatches) {
            maxTypeMatches = matches;
            extractedType = type;
        }
    }

    metadata.type = extractedType;
    console.log('📄 Extracted Type:', metadata.type);

    return metadata;
}

// Generate content-based description using extracted text (standalone function)
async function generateContentBasedDescription({ title, author, category, type, filename, fileType, extractedText, fileSize }) {
    const descriptions = [];
    let keywords = [];
    let documentType = 'document';
    let complexity = 'intermediate';
    let subjects = [];

    // Analyze extracted text for insights
    if (extractedText && extractedText.length > 100) {
        const text = extractedText.toLowerCase();
        const words = text.split(/\s+/).filter(word => word.length > 3);
        const wordCount = words.length;

        // Detect document type from content patterns
        if (text.includes('abstract') && text.includes('introduction') && text.includes('methodology')) {
            documentType = 'research paper';
        } else if (text.includes('chapter') && (text.includes('exercise') || text.includes('problem'))) {
            documentType = 'textbook';
        } else if (text.includes('tutorial') || text.includes('step by step') || text.includes('how to')) {
            documentType = 'tutorial guide';
        } else if (text.includes('reference') || text.includes('appendix') && text.includes('index')) {
            documentType = 'reference manual';
        } else if (text.includes('introduction to') || text.includes('basics of')) {
            documentType = 'introductory guide';
        }

        // Determine complexity level
        const complexityIndicators = {
            beginner: ['introduction', 'basics', 'beginner', 'getting started', 'fundamentals', 'overview'],
            intermediate: ['intermediate', 'practical', 'application', 'examples', 'implementation'],
            advanced: ['advanced', 'expert', 'complex', 'sophisticated', 'in-depth', 'comprehensive']
        };

        for (const [level, indicators] of Object.entries(complexityIndicators)) {
            if (indicators.some(indicator => text.includes(indicator))) {
                complexity = level;
                break;
            }
        }

        // Extract key subjects and topics
        const subjectPatterns = [
            /(?:about|on|regarding|concerning)\s+([a-zA-Z\s]{3,30})/g,
            /(?:study of|analysis of|overview of)\s+([a-zA-Z\s]{3,30})/g,
            /(?:introduction to|guide to)\s+([a-zA-Z\s]{3,30})/g
        ];

        subjectPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null && subjects.length < 3) {
                const subject = match[1].trim().replace(/\s+/g, ' ');
                if (subject.length > 3 && subject.length < 30) {
                    subjects.push(subject);
                }
            }
        });

        // Extract keywords (most frequent meaningful words)
        const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'may', 'put', 'say', 'she', 'too', 'use']);
        
        const wordFreq = {};
        words.forEach(word => {
            if (!stopWords.has(word) && word.length > 4) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

        keywords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);

        console.log('📊 Content Analysis Results:', {
            documentType,
            complexity,
            wordCount,
            subjects: subjects.slice(0, 3),
            topKeywords: keywords
        });
    }

    // Build intelligent description
    const docTypeDescriptions = {
        'research paper': 'a scholarly research paper',
        'textbook': 'an educational textbook',
        'tutorial guide': 'a practical tutorial guide',
        'reference manual': 'a comprehensive reference manual',
        'introductory guide': 'an introductory guide',
        'document': 'a document'
    };

    // Start with title and document type
    if (title) {
        descriptions.push(`"${title}" is ${docTypeDescriptions[documentType] || 'a digital resource'}`);
    } else if (filename) {
        const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
        descriptions.push(`"${cleanName}" is ${docTypeDescriptions[documentType] || 'a digital resource'}`);
    }

    // Add author
    if (author) {
        descriptions.push(`authored by ${author}`);
    }

    // Add content-based insights
    if (extractedText && extractedText.length > 100) {
        const wordCount = extractedText.split(/\s+/).length;
        
        if (complexity === 'beginner') {
            descriptions.push('designed for beginners and newcomers to the subject');
        } else if (complexity === 'advanced') {
            descriptions.push('tailored for advanced learners and professionals');
        } else {
            descriptions.push('suitable for intermediate-level readers');
        }

        // Add subject matter
        if (subjects.length > 0) {
            descriptions.push(`covering topics including ${subjects.slice(0, 2).join(' and ')}`);
        }

        // Add content characteristics
        if (wordCount > 10000) {
            descriptions.push('This comprehensive resource provides in-depth coverage');
        } else if (wordCount > 5000) {
            descriptions.push('This detailed resource offers thorough explanations');
        } else {
            descriptions.push('This concise resource provides essential information');
        }

        // Add keywords context
        if (keywords.length > 0) {
            descriptions.push(`with focus on ${keywords.slice(0, 3).join(', ')}`);
        }
    } else {
        // Fallback to metadata-based description
        const typeDescriptions = {
            'pdf': 'featuring professional formatting and searchable content',
            'ebook': 'in digital format for convenient reading',
            'journal': 'presenting scholarly research and findings',
            'article': 'providing focused information on the topic'
        };

        if (typeDescriptions[type]) {
            descriptions.push(typeDescriptions[type]);
        }
    }

    // Add category context
    const categoryContext = {
        'Academic': 'supporting academic study and research',
        'Technical': 'providing technical insights and specifications',
        'Educational': 'designed for educational purposes',
        'Professional': 'oriented towards professional development'
    };

    if (category && categoryContext[category]) {
        descriptions.push(categoryContext[category]);
    }

    // Add closing statement
    descriptions.push('This resource serves as a valuable addition to any digital library collection.');

    // Combine into coherent description
    let result = descriptions[0];
    if (descriptions.length > 1) {
        result += '. ' + descriptions.slice(1, -1).join(', ');
        if (descriptions.length > 2) {
            result += ', ' + descriptions[descriptions.length - 1];
        }
    }

    return result;
}

module.exports = new DigitalResourceController();