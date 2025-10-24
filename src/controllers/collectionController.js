// Collection Management Controller for Curated Content
const pool = require('../config/database');

class CollectionController {
    // Get all collections
    async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                type = 'all',
                visibility = 'all',
                created_by,
                search
            } = req.query;

            const offset = (page - 1) * limit;
            const userId = req.user.id;
            const userRole = req.user.role;

            let whereConditions = ['rc.is_active = true'];
            let queryParams = [];
            let paramIndex = 1;

            // Visibility filter based on user role
            if (userRole === 'student') {
                whereConditions.push(`(rc.visibility = 'public' OR rc.created_by = $${paramIndex})`);
                queryParams.push(userId);
                paramIndex++;
            } else if (visibility !== 'all') {
                whereConditions.push(`rc.visibility = $${paramIndex}`);
                queryParams.push(visibility);
                paramIndex++;
            }

            // Type filter
            if (type !== 'all') {
                whereConditions.push(`rc.type = $${paramIndex}`);
                queryParams.push(type);
                paramIndex++;
            }

            // Creator filter
            if (created_by) {
                whereConditions.push(`rc.created_by = $${paramIndex}`);
                queryParams.push(created_by);
                paramIndex++;
            }

            // Search filter
            if (search) {
                whereConditions.push(`(
                    rc.name ILIKE $${paramIndex} OR 
                    rc.description ILIKE $${paramIndex}
                )`);
                queryParams.push(`%${search}%`);
                paramIndex++;
            }

            const whereClause = whereConditions.join(' AND ');

            const query = `
                SELECT 
                    rc.*,
                    u.first_name || ' ' || u.last_name as creator_name,
                    COUNT(ci.id) as item_count,
                    json_agg(
                        CASE 
                            WHEN ci.id IS NOT NULL THEN 
                                json_build_object(
                                    'id', ci.id,
                                    'resource_type', ci.resource_type,
                                    'resource_id', ci.resource_id,
                                    'sort_order', ci.sort_order
                                )
                            ELSE NULL
                        END
                    ) FILTER (WHERE ci.id IS NOT NULL) as items_preview
                FROM resource_collections rc
                LEFT JOIN users u ON rc.created_by = u.id
                LEFT JOIN collection_items ci ON rc.id = ci.collection_id
                WHERE ${whereClause}
                GROUP BY rc.id, u.first_name, u.last_name
                ORDER BY rc.created_at DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);

            // Get total count
            const countQuery = `
                SELECT COUNT(DISTINCT rc.id)
                FROM resource_collections rc
                LEFT JOIN users u ON rc.created_by = u.id
                WHERE ${whereClause}
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
            console.error('Error fetching collections:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching collections',
                error: error.message
            });
        }
    }

    // Get collection by ID with full details
    async getById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Get collection details
            const collectionQuery = `
                SELECT 
                    rc.*,
                    u.first_name || ' ' || u.last_name as creator_name,
                    u.email as creator_email
                FROM resource_collections rc
                LEFT JOIN users u ON rc.created_by = u.id
                WHERE rc.id = $1 AND rc.is_active = true
            `;

            const collectionResult = await pool.query(collectionQuery, [id]);

            if (collectionResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }

            const collection = collectionResult.rows[0];

            // Check access permissions
            if (collection.visibility === 'private' && 
                collection.created_by !== userId && 
                userRole === 'student') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to this collection'
                });
            }

            // Get collection items with resource details
            const itemsQuery = `
                SELECT 
                    ci.*,
                    CASE 
                        WHEN ci.resource_type = 'book' THEN 
                            json_build_object(
                                'title', b.title,
                                'author', b.author,
                                'isbn', b.isbn,
                                'genre', b.genre,
                                'cover_image_url', b.cover_image_url,
                                'available_copies', b.available_copies
                            )
                        WHEN ci.resource_type = 'digital' THEN 
                            json_build_object(
                                'title', dr.title,
                                'author', dr.author,
                                'type', dr.type,
                                'format', dr.format,
                                'cover_image_url', dr.cover_image_url,
                                'file_size_bytes', dr.file_size_bytes
                            )
                        WHEN ci.resource_type = 'media' THEN 
                            json_build_object(
                                'title', mr.title,
                                'author', mr.author,
                                'type', mr.type,
                                'format', mr.format,
                                'duration_seconds', mr.duration_seconds,
                                'thumbnail_url', mr.thumbnail_url
                            )
                    END as resource_details
                FROM collection_items ci
                LEFT JOIN books b ON ci.resource_type = 'book' AND ci.resource_id = b.id
                LEFT JOIN digital_resources dr ON ci.resource_type = 'digital' AND ci.resource_id = dr.id
                LEFT JOIN media_resources mr ON ci.resource_type = 'media' AND ci.resource_id = mr.id
                WHERE ci.collection_id = $1
                ORDER BY ci.sort_order ASC, ci.added_at ASC
            `;

            const itemsResult = await pool.query(itemsQuery, [id]);

            res.json({
                success: true,
                data: {
                    ...collection,
                    items: itemsResult.rows
                }
            });
        } catch (error) {
            console.error('Error fetching collection:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching collection',
                error: error.message
            });
        }
    }

    // Create new collection
    async create(req, res) {
        try {
            const {
                name,
                description,
                type,
                visibility = 'public',
                cover_image_url,
                tags = []
            } = req.body;

            const userId = req.user.id;

            // Validate required fields
            if (!name || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and type are required'
                });
            }

            // Validate type
            const validTypes = ['playlist', 'reading_list', 'course_materials', 'recommended', 'featured'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid collection type'
                });
            }

            // Validate visibility
            const validVisibility = ['public', 'private', 'restricted'];
            if (!validVisibility.includes(visibility)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid visibility setting'
                });
            }

            const query = `
                INSERT INTO resource_collections (
                    name, description, type, visibility, created_by,
                    cover_image_url, tags
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;

            const values = [
                name, description, type, visibility, userId,
                cover_image_url, tags
            ];

            const result = await pool.query(query, values);

            res.status(201).json({
                success: true,
                message: 'Collection created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating collection:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating collection',
                error: error.message
            });
        }
    }

    // Update collection
    async update(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check if collection exists and user has permission to edit
            const checkQuery = `
                SELECT * FROM resource_collections 
                WHERE id = $1 AND is_active = true
            `;
            const checkResult = await pool.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }

            const collection = checkResult.rows[0];

            // Permission check: only creator or admin/librarian can edit
            if (collection.created_by !== userId && !['admin', 'librarian'].includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to edit this collection'
                });
            }

            const allowedFields = ['name', 'description', 'type', 'visibility', 'cover_image_url', 'tags'];
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

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
                UPDATE resource_collections 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await pool.query(query, values);

            res.json({
                success: true,
                message: 'Collection updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating collection:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating collection',
                error: error.message
            });
        }
    }

    // Delete collection (soft delete)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check if collection exists and user has permission to delete
            const checkQuery = `
                SELECT * FROM resource_collections 
                WHERE id = $1 AND is_active = true
            `;
            const checkResult = await pool.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }

            const collection = checkResult.rows[0];

            // Permission check: only creator or admin/librarian can delete
            if (collection.created_by !== userId && !['admin', 'librarian'].includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to delete this collection'
                });
            }

            const query = `
                UPDATE resource_collections 
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id, name
            `;

            const result = await pool.query(query, [id]);

            res.json({
                success: true,
                message: 'Collection deleted successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error deleting collection:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting collection',
                error: error.message
            });
        }
    }

    // Add item to collection
    async addItem(req, res) {
        try {
            const { id } = req.params;
            const { resource_type, resource_id, sort_order, notes } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Validate required fields
            if (!resource_type || !resource_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource type and resource ID are required'
                });
            }

            // Check if collection exists and user has permission to edit
            const collectionQuery = `
                SELECT * FROM resource_collections 
                WHERE id = $1 AND is_active = true
            `;
            const collectionResult = await pool.query(collectionQuery, [id]);

            if (collectionResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }

            const collection = collectionResult.rows[0];

            // Permission check
            if (collection.created_by !== userId && !['admin', 'librarian'].includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to edit this collection'
                });
            }

            // Check if resource exists
            const resourceExists = await this.checkResourceExists(resource_type, resource_id);
            if (!resourceExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Check if item already exists in collection
            const existingItemQuery = `
                SELECT id FROM collection_items 
                WHERE collection_id = $1 AND resource_type = $2 AND resource_id = $3
            `;
            const existingResult = await pool.query(existingItemQuery, [id, resource_type, resource_id]);

            if (existingResult.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Item already exists in this collection'
                });
            }

            // Get next sort order if not provided
            let finalSortOrder = sort_order;
            if (!finalSortOrder) {
                const maxSortQuery = `
                    SELECT COALESCE(MAX(sort_order), 0) + 1 as next_sort_order
                    FROM collection_items 
                    WHERE collection_id = $1
                `;
                const maxSortResult = await pool.query(maxSortQuery, [id]);
                finalSortOrder = maxSortResult.rows[0].next_sort_order;
            }

            const query = `
                INSERT INTO collection_items (
                    collection_id, resource_type, resource_id, sort_order, notes
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const values = [id, resource_type, resource_id, finalSortOrder, notes];
            const result = await pool.query(query, values);

            res.status(201).json({
                success: true,
                message: 'Item added to collection successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error adding item to collection:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding item to collection',
                error: error.message
            });
        }
    }

    // Remove item from collection
    async removeItem(req, res) {
        try {
            const { id, itemId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Check if collection exists and user has permission to edit
            const collectionQuery = `
                SELECT * FROM resource_collections 
                WHERE id = $1 AND is_active = true
            `;
            const collectionResult = await pool.query(collectionQuery, [id]);

            if (collectionResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }

            const collection = collectionResult.rows[0];

            // Permission check
            if (collection.created_by !== userId && !['admin', 'librarian'].includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to edit this collection'
                });
            }

            const query = `
                DELETE FROM collection_items 
                WHERE id = $1 AND collection_id = $2
                RETURNING *
            `;

            const result = await pool.query(query, [itemId, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found in collection'
                });
            }

            res.json({
                success: true,
                message: 'Item removed from collection successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error removing item from collection:', error);
            res.status(500).json({
                success: false,
                message: 'Error removing item from collection',
                error: error.message
            });
        }
    }

    // Reorder items in collection
    async reorderItems(req, res) {
        try {
            const { id } = req.params;
            const { items } = req.body; // Array of {id, sort_order}
            const userId = req.user.id;
            const userRole = req.user.role;

            // Validate input
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Items array is required'
                });
            }

            // Check if collection exists and user has permission to edit
            const collectionQuery = `
                SELECT * FROM resource_collections 
                WHERE id = $1 AND is_active = true
            `;
            const collectionResult = await pool.query(collectionQuery, [id]);

            if (collectionResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }

            const collection = collectionResult.rows[0];

            // Permission check
            if (collection.created_by !== userId && !['admin', 'librarian'].includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to edit this collection'
                });
            }

            // Update sort orders
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                for (const item of items) {
                    await client.query(
                        'UPDATE collection_items SET sort_order = $1 WHERE id = $2 AND collection_id = $3',
                        [item.sort_order, item.id, id]
                    );
                }

                await client.query('COMMIT');

                res.json({
                    success: true,
                    message: 'Items reordered successfully'
                });
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error reordering collection items:', error);
            res.status(500).json({
                success: false,
                message: 'Error reordering collection items',
                error: error.message
            });
        }
    }

    // Helper method to check if resource exists
    async checkResourceExists(resourceType, resourceId) {
        const tables = {
            'book': 'books',
            'digital': 'digital_resources',
            'media': 'media_resources'
        };

        const table = tables[resourceType];
        if (!table) return false;

        const query = `SELECT id FROM ${table} WHERE id = $1`;
        const result = await pool.query(query, [resourceId]);
        
        return result.rows.length > 0;
    }
}

module.exports = new CollectionController();