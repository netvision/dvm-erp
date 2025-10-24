// AI Controller for Intelligent Library Features
const pool = require('../config/database');

class AIController {
    // Intelligent search with AI assistance
    async intelligentSearch(req, res) {
        try {
            const { 
                query, 
                context = '', 
                search_type = 'ai_assisted',
                filters = {},
                limit = 20 
            } = req.body;
            
            const userId = req.user.id;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            // Enhanced search with intelligent query expansion
            const expandedQuery = await this.expandQuery(query, context);
            
            // Multi-resource search (books, digital, media)
            const searchResults = await this.performUnifiedSearch(expandedQuery, filters, limit);
            
            // Apply AI ranking based on user preferences and behavior
            const rankedResults = await this.applyAIRanking(searchResults, userId);
            
            // Log AI search
            await this.logAIInteraction(userId, 'search', query, JSON.stringify(rankedResults), req);
            
            res.json({
                success: true,
                data: {
                    original_query: query,
                    expanded_query: expandedQuery,
                    results: rankedResults,
                    suggestions: await this.getSearchSuggestions(query),
                    facets: await this.getIntelligentFacets(rankedResults)
                }
            });
        } catch (error) {
            console.error('Error in intelligent search:', error);
            res.status(500).json({
                success: false,
                message: 'Error performing intelligent search',
                error: error.message
            });
        }
    }

    // Get personalized recommendations
    async getRecommendations(req, res) {
        try {
            const { 
                type = 'mixed', // 'books', 'digital', 'media', 'mixed'
                algorithm = 'hybrid', // 'collaborative', 'content_based', 'hybrid'
                limit = 10 
            } = req.body;
            
            const userId = req.user.id;

            // Get user preferences and history
            const userProfile = await this.getUserProfile(userId);
            
            let recommendations = [];

            switch (algorithm) {
                case 'collaborative':
                    recommendations = await this.getCollaborativeRecommendations(userId, type, limit);
                    break;
                case 'content_based':
                    recommendations = await this.getContentBasedRecommendations(userProfile, type, limit);
                    break;
                case 'hybrid':
                default:
                    const collaborative = await this.getCollaborativeRecommendations(userId, type, Math.ceil(limit / 2));
                    const contentBased = await this.getContentBasedRecommendations(userProfile, type, Math.floor(limit / 2));
                    recommendations = [...collaborative, ...contentBased];
                    break;
            }

            // Remove duplicates and add reasoning
            const uniqueRecommendations = this.deduplicateAndEnrich(recommendations);

            // Store recommendations for tracking
            await this.storeRecommendations(userId, uniqueRecommendations, algorithm);

            // Log AI interaction
            await this.logAIInteraction(userId, 'recommendation', `${type}_${algorithm}`, JSON.stringify(uniqueRecommendations), req);

            res.json({
                success: true,
                data: {
                    recommendations: uniqueRecommendations.slice(0, limit),
                    algorithm_used: algorithm,
                    user_profile_summary: {
                        preferred_genres: userProfile.preferred_genres,
                        reading_level: userProfile.reading_level,
                        activity_score: userProfile.activity_score
                    }
                }
            });
        } catch (error) {
            console.error('Error getting recommendations:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting recommendations',
                error: error.message
            });
        }
    }

    // AI Chat Assistant
    async chatAssistant(req, res) {
        try {
            const { 
                message, 
                conversation_id,
                context = 'general' // 'general', 'search_help', 'recommendation', 'technical_support'
            } = req.body;
            
            const userId = req.user.id;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }

            // Process message with AI assistant
            const response = await this.processAIChat(message, context, userId, conversation_id);
            
            // Store conversation
            await this.storeChatInteraction(userId, message, response, context, conversation_id);

            res.json({
                success: true,
                data: {
                    response: response.text,
                    suggestions: response.suggestions || [],
                    actions: response.actions || [],
                    confidence: response.confidence,
                    conversation_id: response.conversation_id
                }
            });
        } catch (error) {
            console.error('Error in chat assistant:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing chat message',
                error: error.message
            });
        }
    }

    // Summarize content
    async summarizeContent(req, res) {
        try {
            const { 
                resource_type, // 'book', 'digital', 'media'
                resource_id,
                summary_type = 'brief', // 'brief', 'detailed', 'key_points'
                target_length = 200 // words
            } = req.body;
            
            const userId = req.user.id;

            // Get resource content
            const resource = await this.getResourceForSummary(resource_type, resource_id);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Generate summary using AI
            const summary = await this.generateSummary(resource, summary_type, target_length);

            // Log AI interaction
            await this.logAIInteraction(userId, 'summarization', `${resource_type}_${resource_id}`, summary.text, req);

            res.json({
                success: true,
                data: {
                    summary: summary.text,
                    key_points: summary.key_points || [],
                    reading_time_minutes: summary.estimated_reading_time,
                    confidence_score: summary.confidence,
                    summary_type,
                    original_length: resource.content_length,
                    summary_length: summary.word_count
                }
            });
        } catch (error) {
            console.error('Error summarizing content:', error);
            res.status(500).json({
                success: false,
                message: 'Error summarizing content',
                error: error.message
            });
        }
    }

    // Translate content
    async translateContent(req, res) {
        try {
            const { 
                text, 
                source_language = 'auto',
                target_language,
                preserve_formatting = true
            } = req.body;
            
            const userId = req.user.id;

            if (!text || !target_language) {
                return res.status(400).json({
                    success: false,
                    message: 'Text and target language are required'
                });
            }

            // Perform translation
            const translation = await this.performTranslation(text, source_language, target_language, preserve_formatting);

            // Log AI interaction
            await this.logAIInteraction(userId, 'translation', `${source_language}_to_${target_language}`, translation.translated_text, req);

            res.json({
                success: true,
                data: {
                    translated_text: translation.translated_text,
                    detected_language: translation.detected_language,
                    confidence_score: translation.confidence,
                    source_language,
                    target_language,
                    character_count: text.length,
                    translation_time_ms: translation.processing_time
                }
            });
        } catch (error) {
            console.error('Error translating content:', error);
            res.status(500).json({
                success: false,
                message: 'Error translating content',
                error: error.message
            });
        }
    }

    // Get trending content
    async getTrendingContent(req, res) {
        try {
            const { 
                time_period = '7d', // '1d', '7d', '30d', '90d'
                content_type = 'all', // 'books', 'digital', 'media', 'all'
                limit = 20 
            } = req.query;

            // Calculate trending based on engagement metrics
            const trending = await this.calculateTrendingContent(time_period, content_type, limit);

            // Add AI insights about trending patterns
            const insights = await this.generateTrendingInsights(trending, time_period);

            res.json({
                success: true,
                data: {
                    trending_items: trending,
                    insights,
                    time_period,
                    content_type,
                    last_updated: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Error getting trending content:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting trending content',
                error: error.message
            });
        }
    }

    // Submit feedback for AI improvements
    async submitFeedback(req, res) {
        try {
            const { 
                interaction_id,
                feedback_type, // 'rating', 'correction', 'suggestion'
                rating, // 1-5
                feedback_text,
                specific_issues = [] // Array of issue types
            } = req.body;
            
            const userId = req.user.id;

            // Store feedback
            const feedbackQuery = `
                UPDATE ai_interactions 
                SET feedback_rating = $1, feedback_text = $2
                WHERE id = $3 AND user_id = $4
                RETURNING *
            `;

            const result = await pool.query(feedbackQuery, [rating, feedback_text, interaction_id, userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'AI interaction not found'
                });
            }

            // Process feedback for model improvement
            await this.processFeedbackForImprovement(result.rows[0], feedback_type, specific_issues);

            res.json({
                success: true,
                message: 'Feedback submitted successfully',
                data: {
                    interaction_id,
                    feedback_processed: true
                }
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            res.status(500).json({
                success: false,
                message: 'Error submitting feedback',
                error: error.message
            });
        }
    }

    // Helper methods for AI functionality
    async expandQuery(query, context) {
        // Simulate query expansion with synonyms and related terms
        // In a real implementation, this would use NLP libraries or AI services
        const expansions = {
            'science': ['physics', 'chemistry', 'biology', 'scientific'],
            'history': ['historical', 'past', 'chronological', 'timeline'],
            'fiction': ['novel', 'story', 'narrative', 'literature'],
            'programming': ['coding', 'software', 'development', 'computer science']
        };

        let expandedQuery = query;
        for (const [term, synonyms] of Object.entries(expansions)) {
            if (query.toLowerCase().includes(term)) {
                expandedQuery += ' ' + synonyms.join(' ');
            }
        }

        return expandedQuery;
    }

    async performUnifiedSearch(query, filters, limit) {
        try {
            // Search across all resource types
            const searches = [
                this.searchBooks(query, filters, Math.ceil(limit / 3)),
                this.searchDigitalResources(query, filters, Math.ceil(limit / 3)),
                this.searchMediaResources(query, filters, Math.floor(limit / 3))
            ];

            const [books, digital, media] = await Promise.all(searches);

            return [
                ...books.map(item => ({ ...item, resource_type: 'book' })),
                ...digital.map(item => ({ ...item, resource_type: 'digital' })),
                ...media.map(item => ({ ...item, resource_type: 'media' }))
            ];
        } catch (error) {
            console.error('Error performing unified search:', error);
            return [];
        }
    }

    async searchBooks(query, filters, limit) {
        const searchQuery = `
            SELECT *, ts_rank(
                to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, '')),
                plainto_tsquery('english', $1)
            ) as rank
            FROM books 
            WHERE to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
            @@ plainto_tsquery('english', $1)
            ORDER BY rank DESC
            LIMIT $2
        `;
        
        const result = await pool.query(searchQuery, [query, limit]);
        return result.rows;
    }

    async searchDigitalResources(query, filters, limit) {
        const searchQuery = `
            SELECT *, ts_rank(
                to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, '')),
                plainto_tsquery('english', $1)
            ) as rank
            FROM digital_resources 
            WHERE is_active = true 
            AND to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(description, ''))
            @@ plainto_tsquery('english', $1)
            ORDER BY rank DESC
            LIMIT $2
        `;
        
        const result = await pool.query(searchQuery, [query, limit]);
        return result.rows;
    }

    async searchMediaResources(query, filters, limit) {
        const searchQuery = `
            SELECT *, ts_rank(
                to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(author, '')),
                plainto_tsquery('english', $1)
            ) as rank
            FROM media_resources 
            WHERE is_active = true 
            AND to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(author, ''))
            @@ plainto_tsquery('english', $1)
            ORDER BY rank DESC
            LIMIT $2
        `;
        
        const result = await pool.query(searchQuery, [query, limit]);
        return result.rows;
    }

    async applyAIRanking(results, userId) {
        // Get user preferences and behavior
        const userProfile = await this.getUserProfile(userId);
        
        // Apply personalized ranking based on user preferences
        return results.map(item => {
            let personalizedScore = item.rank || 0;
            
            // Boost score based on user preferences
            if (userProfile.preferred_genres && userProfile.preferred_genres.includes(item.genre)) {
                personalizedScore += 0.2;
            }
            
            if (userProfile.reading_level && item.reading_level === userProfile.reading_level) {
                personalizedScore += 0.1;
            }
            
            return {
                ...item,
                personalized_score: personalizedScore,
                recommendation_reason: this.generateRecommendationReason(item, userProfile)
            };
        }).sort((a, b) => b.personalized_score - a.personalized_score);
    }

    async getUserProfile(userId) {
        try {
            // Get user preferences and reading history
            const profileQuery = `
                SELECT 
                    u.reading_preferences,
                    array_agg(DISTINCT br.genre) FILTER (WHERE br.genre IS NOT NULL) as borrowed_genres,
                    array_agg(DISTINCT rp.resource_type) FILTER (WHERE rp.resource_type IS NOT NULL) as active_resource_types,
                    COUNT(br.id) as total_borrows,
                    AVG(CASE WHEN br.return_date IS NOT NULL THEN 
                        EXTRACT(EPOCH FROM (br.return_date - br.borrow_date))/86400 
                    END) as avg_borrow_days
                FROM users u
                LEFT JOIN borrow_records br ON u.id = br.user_id
                LEFT JOIN reading_progress rp ON u.id = rp.user_id
                WHERE u.id = $1
                GROUP BY u.id, u.reading_preferences
            `;
            
            const result = await pool.query(profileQuery, [userId]);
            const profile = result.rows[0] || {};
            
            return {
                preferred_genres: profile.borrowed_genres || [],
                reading_level: profile.reading_preferences?.reading_level || 'intermediate',
                activity_score: Math.min(profile.total_borrows || 0, 100),
                avg_borrow_duration: profile.avg_borrow_days || 14,
                resource_preferences: profile.active_resource_types || []
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            return {
                preferred_genres: [],
                reading_level: 'intermediate',
                activity_score: 0,
                avg_borrow_duration: 14,
                resource_preferences: []
            };
        }
    }

    async getCollaborativeRecommendations(userId, type, limit) {
        // Find users with similar preferences
        const similarUsersQuery = `
            WITH user_preferences AS (
                SELECT user_id, genre
                FROM borrow_records br
                JOIN books b ON br.book_id = b.id
                WHERE br.user_id = $1
                GROUP BY user_id, genre
            ),
            similar_users AS (
                SELECT br2.user_id, COUNT(*) as similarity_score
                FROM borrow_records br2
                JOIN books b2 ON br2.book_id = b2.id
                WHERE b2.genre IN (SELECT genre FROM user_preferences)
                AND br2.user_id != $1
                GROUP BY br2.user_id
                ORDER BY similarity_score DESC
                LIMIT 10
            )
            SELECT DISTINCT b.*, 'collaborative' as recommendation_type
            FROM books b
            JOIN borrow_records br ON b.id = br.book_id
            WHERE br.user_id IN (SELECT user_id FROM similar_users)
            AND b.id NOT IN (
                SELECT book_id FROM borrow_records WHERE user_id = $1
            )
            ORDER BY random()
            LIMIT $2
        `;
        
        const result = await pool.query(similarUsersQuery, [userId, limit]);
        return result.rows;
    }

    async getContentBasedRecommendations(userProfile, type, limit) {
        // Recommend based on content similarity
        const contentQuery = `
            SELECT *, 'content_based' as recommendation_type
            FROM books 
            WHERE genre = ANY($1::text[])
            AND reading_level = $2
            ORDER BY created_at DESC
            LIMIT $3
        `;
        
        const result = await pool.query(contentQuery, [
            userProfile.preferred_genres || ['fiction'],
            userProfile.reading_level,
            limit
        ]);
        return result.rows;
    }

    async getSearchSuggestions(query) {
        // Generate search suggestions based on query
        return [
            `${query} pdf`,
            `${query} audiobook`,
            `${query} summary`,
            `similar to ${query}`
        ];
    }

    async getIntelligentFacets(results) {
        // Generate dynamic facets based on search results
        const facets = {};
        
        // Resource type facet
        facets.resource_types = {};
        results.forEach(item => {
            facets.resource_types[item.resource_type] = (facets.resource_types[item.resource_type] || 0) + 1;
        });
        
        // Genre facet
        facets.genres = {};
        results.forEach(item => {
            if (item.genre) {
                facets.genres[item.genre] = (facets.genres[item.genre] || 0) + 1;
            }
        });
        
        return facets;
    }

    generateRecommendationReason(item, userProfile) {
        const reasons = [];
        
        if (userProfile.preferred_genres && userProfile.preferred_genres.includes(item.genre)) {
            reasons.push(`matches your interest in ${item.genre}`);
        }
        
        if (item.resource_type === 'digital') {
            reasons.push('available for immediate download');
        }
        
        if (item.view_count > 100) {
            reasons.push('popular with other readers');
        }
        
        return reasons.length > 0 ? reasons.join(', ') : 'recommended for you';
    }

    async processAIChat(message, context, userId, conversationId) {
        // Simulate AI chat processing
        // In a real implementation, this would integrate with AI services like OpenAI GPT
        
        const responses = {
            'help': {
                text: "I'm here to help you navigate the library system. I can assist with finding books, digital resources, media content, and answer questions about library services.",
                suggestions: ["Find books about science", "Show me popular audiobooks", "How to download eBooks"],
                confidence: 0.95
            },
            'search': {
                text: "I can help you search for specific content. What topic or type of material are you looking for?",
                suggestions: ["Search for fiction books", "Find research papers", "Look for educational videos"],
                confidence: 0.90
            },
            'default': {
                text: "I understand you're looking for information. Could you please be more specific about what you need help with?",
                suggestions: ["Browse catalog", "Check my borrowed items", "Library hours and policies"],
                confidence: 0.70
            }
        };
        
        const lowerMessage = message.toLowerCase();
        let response;
        
        if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
            response = responses.help;
        } else if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
            response = responses.search;
        } else {
            response = responses.default;
        }
        
        return {
            ...response,
            conversation_id: conversationId || require('crypto').randomUUID()
        };
    }

    async calculateTrendingContent(timePeriod, contentType, limit) {
        // Calculate trending based on recent activity
        const timeMap = {
            '1d': '1 day',
            '7d': '7 days',
            '30d': '30 days',
            '90d': '90 days'
        };
        
        const timeFilter = timeMap[timePeriod] || '7 days';
        
        // Simplified trending calculation
        const trendingQuery = `
            WITH trending_books AS (
                SELECT 
                    'book' as resource_type,
                    b.id,
                    b.title,
                    b.author,
                    COUNT(br.id) as recent_activity,
                    b.view_count
                FROM books b
                LEFT JOIN borrow_records br ON b.id = br.book_id
                    AND br.borrow_date >= NOW() - INTERVAL '${timeFilter}'
                GROUP BY b.id, b.title, b.author, b.view_count
            )
            SELECT *,
                (recent_activity * 2 + view_count * 0.1) as trending_score
            FROM trending_books
            ORDER BY trending_score DESC
            LIMIT $1
        `;
        
        const result = await pool.query(trendingQuery, [limit]);
        return result.rows;
    }

    async generateTrendingInsights(trending, timePeriod) {
        return {
            total_trending_items: trending.length,
            top_category: 'Fiction', // Simplified
            growth_rate: '+15%', // Simplified
            insight: `Fiction books are showing increased popularity over the past ${timePeriod}.`
        };
    }

    async logAIInteraction(userId, interactionType, inputText, outputText, req) {
        try {
            const query = `
                INSERT INTO ai_interactions (
                    user_id, interaction_type, input_text, output_text,
                    ai_model, processing_time_ms, session_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `;

            await pool.query(query, [
                userId,
                interactionType,
                inputText,
                outputText,
                'library-ai-v1.0',
                Math.floor(Math.random() * 1000), // Simulated processing time
                req.sessionID || require('crypto').randomUUID()
            ]);
        } catch (error) {
            console.error('Error logging AI interaction:', error);
        }
    }

    // Additional helper methods would be implemented here
    async deduplicateAndEnrich(recommendations) {
        // Remove duplicates and add enrichment
        const seen = new Set();
        return recommendations.filter(item => {
            const key = `${item.resource_type}_${item.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    async storeRecommendations(userId, recommendations, algorithm) {
        // Store recommendations for tracking effectiveness
        const promises = recommendations.map(rec => {
            const query = `
                INSERT INTO recommendations (
                    user_id, resource_type, resource_id, recommendation_type,
                    relevance_score, reasoning
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT DO NOTHING
            `;
            
            return pool.query(query, [
                userId,
                rec.resource_type,
                rec.id,
                algorithm,
                rec.personalized_score || 0.5,
                rec.recommendation_reason || 'AI generated'
            ]);
        });
        
        await Promise.all(promises);
    }

    async getResourceForSummary(resourceType, resourceId) {
        // Get resource content for summarization
        const tables = {
            'book': 'books',
            'digital': 'digital_resources',
            'media': 'media_resources'
        };
        
        const table = tables[resourceType];
        if (!table) return null;
        
        const query = `SELECT * FROM ${table} WHERE id = $1`;
        const result = await pool.query(query, [resourceId]);
        
        return result.rows[0] || null;
    }

    async generateSummary(resource, summaryType, targetLength) {
        // Simulate content summarization
        // In real implementation, this would use AI summarization services
        
        const summaries = {
            brief: `This is a brief summary of "${resource.title}" by ${resource.author || 'Unknown Author'}. The content covers key themes and main points in an accessible format.`,
            detailed: `This is a detailed summary of "${resource.title}" by ${resource.author || 'Unknown Author'}. The work explores multiple themes and provides comprehensive coverage of the subject matter, offering insights and analysis throughout.`,
            key_points: `Key points from "${resource.title}": 1) Main theme introduction, 2) Core concepts and theories, 3) Practical applications, 4) Conclusions and implications.`
        };
        
        return {
            text: summaries[summaryType] || summaries.brief,
            key_points: ['Main theme', 'Core concepts', 'Applications', 'Conclusions'],
            estimated_reading_time: Math.ceil(targetLength / 200), // Rough estimate
            confidence: 0.85,
            word_count: targetLength
        };
    }

    async performTranslation(text, sourceLanguage, targetLanguage, preserveFormatting) {
        // Simulate translation service
        // In real implementation, this would use translation APIs like Google Translate
        
        return {
            translated_text: `[Translated to ${targetLanguage}] ${text}`,
            detected_language: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
            confidence: 0.92,
            processing_time: Math.floor(Math.random() * 500) + 100
        };
    }

    async storeChatInteraction(userId, message, response, context, conversationId) {
        // Store chat interaction for conversation history
        const query = `
            INSERT INTO ai_interactions (
                user_id, interaction_type, input_text, output_text,
                ai_model, confidence_score, session_id, metadata
            ) VALUES ($1, 'chat', $2, $3, 'chat-assistant-v1.0', $4, $5, $6)
        `;
        
        await pool.query(query, [
            userId,
            message,
            response.text,
            response.confidence,
            conversationId,
            { context, suggestions: response.suggestions }
        ]);
    }

    async processFeedbackForImprovement(interaction, feedbackType, specificIssues) {
        // Process feedback to improve AI models
        // This would typically feed into model training pipelines
        console.log('Processing AI feedback for improvement:', {
            interaction_id: interaction.id,
            feedback_type: feedbackType,
            issues: specificIssues
        });
    }
}

module.exports = new AIController();