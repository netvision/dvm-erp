// Waitlist Management Controller
const pool = require('../config/database');

class WaitlistController {
    // Get user's waitlist entries
    async getUserWaitlists(req, res) {
        try {
            const userId = req.user.id;
            const { status = 'all' } = req.query;

            let whereClause = 'WHERE w.user_id = $1';
            const queryParams = [userId];

            if (status !== 'all') {
                whereClause += ' AND w.status = $2';
                queryParams.push(status);
            }

            const query = `
                SELECT 
                    w.*,
                    CASE 
                        WHEN w.resource_type = 'book' THEN b.title
                        WHEN w.resource_type = 'digital' THEN dr.title
                        WHEN w.resource_type = 'media' THEN mr.title
                    END as resource_title,
                    CASE 
                        WHEN w.resource_type = 'book' THEN b.author
                        WHEN w.resource_type = 'digital' THEN dr.author
                        WHEN w.resource_type = 'media' THEN mr.author
                    END as resource_author,
                    CASE 
                        WHEN w.resource_type = 'book' THEN b.cover_image_url
                        WHEN w.resource_type = 'digital' THEN dr.cover_image_url
                        WHEN w.resource_type = 'media' THEN mr.thumbnail_url
                    END as resource_image,
                    (SELECT COUNT(*) FROM waitlists w2 
                     WHERE w2.resource_type = w.resource_type 
                     AND w2.resource_id = w.resource_id 
                     AND w2.status = 'waiting' 
                     AND w2.position_in_queue < w.position_in_queue) + 1 as current_position,
                    (SELECT COUNT(*) FROM waitlists w3 
                     WHERE w3.resource_type = w.resource_type 
                     AND w3.resource_id = w.resource_id 
                     AND w3.status = 'waiting') as total_in_queue
                FROM waitlists w
                LEFT JOIN books b ON w.resource_type = 'book' AND w.resource_id = b.id
                LEFT JOIN digital_resources dr ON w.resource_type = 'digital' AND w.resource_id = dr.id
                LEFT JOIN media_resources mr ON w.resource_type = 'media' AND w.resource_id = mr.id
                ${whereClause}
                ORDER BY w.requested_at DESC
            `;

            const result = await pool.query(query, queryParams);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error fetching user waitlists:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching waitlist entries',
                error: error.message
            });
        }
    }

    // Get all waitlists (Admin/Librarian only)
    async getAllWaitlists(req, res) {
        try {
            const { 
                status = 'all',
                resource_type = 'all',
                page = 1,
                limit = 20,
                sort = 'requested_at',
                order = 'DESC'
            } = req.query;

            const offset = (page - 1) * limit;
            let whereConditions = [];
            let queryParams = [];
            let paramIndex = 1;

            if (status !== 'all') {
                whereConditions.push(`w.status = $${paramIndex}`);
                queryParams.push(status);
                paramIndex++;
            }

            if (resource_type !== 'all') {
                whereConditions.push(`w.resource_type = $${paramIndex}`);
                queryParams.push(resource_type);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? 
                `WHERE ${whereConditions.join(' AND ')}` : '';

            const allowedSortColumns = ['requested_at', 'position_in_queue', 'status', 'resource_type'];
            const sortColumn = allowedSortColumns.includes(sort) ? sort : 'requested_at';
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const query = `
                SELECT 
                    w.*,
                    CASE 
                        WHEN w.resource_type = 'book' THEN b.title
                        WHEN w.resource_type = 'digital' THEN dr.title
                        WHEN w.resource_type = 'media' THEN mr.title
                    END as resource_title,
                    CASE 
                        WHEN w.resource_type = 'book' THEN b.author
                        WHEN w.resource_type = 'digital' THEN dr.author
                        WHEN w.resource_type = 'media' THEN mr.author
                    END as resource_author,
                    u.first_name || ' ' || u.last_name as user_name,
                    u.email as user_email,
                    (SELECT COUNT(*) FROM waitlists w2 
                     WHERE w2.resource_type = w.resource_type 
                     AND w2.resource_id = w.resource_id 
                     AND w2.status = 'waiting') as total_in_queue
                FROM waitlists w
                LEFT JOIN books b ON w.resource_type = 'book' AND w.resource_id = b.id
                LEFT JOIN digital_resources dr ON w.resource_type = 'digital' AND w.resource_id = dr.id
                LEFT JOIN media_resources mr ON w.resource_type = 'media' AND w.resource_id = mr.id
                LEFT JOIN users u ON w.user_id = u.id
                ${whereClause}
                ORDER BY w.${sortColumn} ${sortOrder}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);

            // Get total count
            const countQuery = `
                SELECT COUNT(*) 
                FROM waitlists w
                LEFT JOIN users u ON w.user_id = u.id
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
            console.error('Error fetching all waitlists:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching waitlist entries',
                error: error.message
            });
        }
    }

    // Join waitlist
    async joinWaitlist(req, res) {
        try {
            const {
                resource_type,
                resource_id
            } = req.body;

            const userId = req.user.id;

            // Validate required fields
            if (!resource_type || !resource_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource type and resource ID are required'
                });
            }

            // Validate resource type
            const validResourceTypes = ['book', 'digital', 'media'];
            if (!validResourceTypes.includes(resource_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid resource type'
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

            // Check if user is already on the waitlist for this resource
            const existingWaitlistQuery = `
                SELECT id FROM waitlists 
                WHERE user_id = $1 AND resource_type = $2 AND resource_id = $3 
                AND status = 'waiting'
            `;
            const existingResult = await pool.query(existingWaitlistQuery, [
                userId, resource_type, resource_id
            ]);

            if (existingResult.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'You are already on the waitlist for this resource'
                });
            }

            // Check if resource is actually unavailable (for books)
            if (resource_type === 'book') {
                const isAvailable = await this.checkBookAvailability(resource_id);
                if (isAvailable) {
                    return res.status(400).json({
                        success: false,
                        message: 'This resource is currently available for borrowing'
                    });
                }
            }

            // Get next position in queue
            const positionQuery = `
                SELECT COALESCE(MAX(position_in_queue), 0) + 1 as next_position
                FROM waitlists 
                WHERE resource_type = $1 AND resource_id = $2 AND status = 'waiting'
            `;
            const positionResult = await pool.query(positionQuery, [resource_type, resource_id]);
            const nextPosition = positionResult.rows[0].next_position;

            // Calculate expiry date (7 days from now)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);

            const query = `
                INSERT INTO waitlists (
                    user_id, resource_type, resource_id, position_in_queue,
                    expires_at, status
                ) VALUES ($1, $2, $3, $4, $5, 'waiting')
                RETURNING *
            `;

            const values = [
                userId, resource_type, resource_id, nextPosition, expiryDate
            ];

            const result = await pool.query(query, values);

            // Send confirmation notification
            await this.sendWaitlistConfirmation(result.rows[0]);

            res.status(201).json({
                success: true,
                message: 'Successfully joined waitlist',
                data: {
                    ...result.rows[0],
                    estimated_wait_time: this.calculateEstimatedWaitTime(nextPosition, resource_type)
                }
            });
        } catch (error) {
            console.error('Error joining waitlist:', error);
            res.status(500).json({
                success: false,
                message: 'Error joining waitlist',
                error: error.message
            });
        }
    }

    // Leave waitlist
    async leaveWaitlist(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Students can only leave their own waitlist entries
            let whereClause = 'WHERE id = $1 AND status = $2';
            let queryParams = [id, 'waiting'];

            if (userRole === 'student') {
                whereClause += ' AND user_id = $3';
                queryParams.push(userId);
            }

            const query = `
                UPDATE waitlists 
                SET status = 'cancelled'
                ${whereClause}
                RETURNING *
            `;

            const result = await pool.query(query, queryParams);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Waitlist entry not found or access denied'
                });
            }

            const waitlistEntry = result.rows[0];

            // Update positions for remaining users in the queue
            await this.updateQueuePositions(
                waitlistEntry.resource_type, 
                waitlistEntry.resource_id, 
                waitlistEntry.position_in_queue
            );

            // Send cancellation notification
            await this.sendWaitlistCancellation(waitlistEntry);

            res.json({
                success: true,
                message: 'Successfully left waitlist',
                data: waitlistEntry
            });
        } catch (error) {
            console.error('Error leaving waitlist:', error);
            res.status(500).json({
                success: false,
                message: 'Error leaving waitlist',
                error: error.message
            });
        }
    }

    // Notify next user in queue (Admin/Librarian only)
    async notifyNext(req, res) {
        try {
            const { id } = req.params; // Waitlist ID
            const { custom_message } = req.body;

            // Get the waitlist entry
            const waitlistQuery = `
                SELECT * FROM waitlists 
                WHERE id = $1 AND status = 'waiting'
                ORDER BY position_in_queue ASC
                LIMIT 1
            `;
            const waitlistResult = await pool.query(waitlistQuery, [id]);

            if (waitlistResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Waitlist entry not found'
                });
            }

            const waitlistEntry = waitlistResult.rows[0];

            // Update status to notified
            const updateQuery = `
                UPDATE waitlists 
                SET status = 'notified', notified_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            const updateResult = await pool.query(updateQuery, [id]);

            // Send notification to user
            await this.sendAvailabilityNotification(updateResult.rows[0], custom_message);

            res.json({
                success: true,
                message: 'User notified successfully',
                data: updateResult.rows[0]
            });
        } catch (error) {
            console.error('Error notifying next user:', error);
            res.status(500).json({
                success: false,
                message: 'Error notifying next user',
                error: error.message
            });
        }
    }

    // Auto-notify when resource becomes available
    async autoNotifyWhenAvailable(resourceType, resourceId) {
        try {
            // Get the next user in queue
            const nextUserQuery = `
                SELECT * FROM waitlists 
                WHERE resource_type = $1 AND resource_id = $2 AND status = 'waiting'
                ORDER BY position_in_queue ASC
                LIMIT 1
            `;
            const nextUserResult = await pool.query(nextUserQuery, [resourceType, resourceId]);

            if (nextUserResult.rows.length === 0) {
                return; // No one waiting
            }

            const waitlistEntry = nextUserResult.rows[0];

            // Update status to notified
            await pool.query(
                'UPDATE waitlists SET status = $1, notified_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['notified', waitlistEntry.id]
            );

            // Send notification
            await this.sendAvailabilityNotification(waitlistEntry);

            console.log(`Auto-notified user ${waitlistEntry.user_id} for ${resourceType} ${resourceId}`);
        } catch (error) {
            console.error('Error auto-notifying waitlist:', error);
        }
    }

    // Helper methods
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

    async checkBookAvailability(bookId) {
        // Check if book is currently borrowed
        const borrowQuery = `
            SELECT id FROM borrow_records 
            WHERE book_id = $1 AND return_date IS NULL
        `;
        const borrowResult = await pool.query(borrowQuery, [bookId]);
        
        return borrowResult.rows.length === 0; // Available if no active borrows
    }

    async updateQueuePositions(resourceType, resourceId, removedPosition) {
        // Update positions for users after the removed position
        const updateQuery = `
            UPDATE waitlists 
            SET position_in_queue = position_in_queue - 1
            WHERE resource_type = $1 AND resource_id = $2 
            AND position_in_queue > $3 AND status = 'waiting'
        `;

        await pool.query(updateQuery, [resourceType, resourceId, removedPosition]);
    }

    calculateEstimatedWaitTime(position, resourceType) {
        // Estimate wait time based on position and resource type
        const avgDaysPerTurn = {
            'book': 14, // Average borrow period
            'digital': 7,  // Shorter for digital
            'media': 7     // Shorter for media
        };

        const daysPerTurn = avgDaysPerTurn[resourceType] || 14;
        const estimatedDays = position * daysPerTurn;

        if (estimatedDays <= 7) {
            return 'Within a week';
        } else if (estimatedDays <= 30) {
            return `${Math.ceil(estimatedDays / 7)} weeks`;
        } else {
            return `${Math.ceil(estimatedDays / 30)} months`;
        }
    }

    async sendWaitlistConfirmation(waitlistEntry) {
        try {
            // Get user details
            const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [waitlistEntry.user_id]);
            
            if (userResult.rows.length === 0) return;
            
            const user = userResult.rows[0];

            // Get resource title
            const resourceTitle = await this.getResourceTitle(waitlistEntry.resource_type, waitlistEntry.resource_id);

            // Queue notification
            const notificationQuery = `
                INSERT INTO notification_queue (
                    user_id, notification_type, message_title, message_body,
                    delivery_method, delivery_address, related_resource_type, related_resource_id
                ) VALUES ($1, 'waitlist_joined', $2, $3, 'email', $4, $5, $6)
            `;

            const title = `Waitlist Confirmation`;
            const estimatedWait = this.calculateEstimatedWaitTime(waitlistEntry.position_in_queue, waitlistEntry.resource_type);
            const body = `Dear ${user.first_name}, you have been added to the waitlist for "${resourceTitle}". Your position is #${waitlistEntry.position_in_queue}. Estimated wait time: ${estimatedWait}.`;

            await pool.query(notificationQuery, [
                waitlistEntry.user_id, title, body, user.email, 
                waitlistEntry.resource_type, waitlistEntry.id
            ]);
        } catch (error) {
            console.error('Error sending waitlist confirmation:', error);
        }
    }

    async sendWaitlistCancellation(waitlistEntry) {
        try {
            // Get user details
            const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [waitlistEntry.user_id]);
            
            if (userResult.rows.length === 0) return;
            
            const user = userResult.rows[0];

            // Get resource title
            const resourceTitle = await this.getResourceTitle(waitlistEntry.resource_type, waitlistEntry.resource_id);

            // Queue notification
            const notificationQuery = `
                INSERT INTO notification_queue (
                    user_id, notification_type, message_title, message_body,
                    delivery_method, delivery_address, related_resource_type, related_resource_id
                ) VALUES ($1, 'waitlist_cancelled', $2, $3, 'email', $4, $5, $6)
            `;

            const title = `Waitlist Cancelled`;
            const body = `Dear ${user.first_name}, you have been removed from the waitlist for "${resourceTitle}".`;

            await pool.query(notificationQuery, [
                waitlistEntry.user_id, title, body, user.email, 
                waitlistEntry.resource_type, waitlistEntry.id
            ]);
        } catch (error) {
            console.error('Error sending waitlist cancellation:', error);
        }
    }

    async sendAvailabilityNotification(waitlistEntry, customMessage = null) {
        try {
            // Get user details
            const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [waitlistEntry.user_id]);
            
            if (userResult.rows.length === 0) return;
            
            const user = userResult.rows[0];

            // Get resource title
            const resourceTitle = await this.getResourceTitle(waitlistEntry.resource_type, waitlistEntry.resource_id);

            // Queue notification
            const notificationQuery = `
                INSERT INTO notification_queue (
                    user_id, notification_type, message_title, message_body,
                    delivery_method, delivery_address, priority, related_resource_type, related_resource_id
                ) VALUES ($1, 'waitlist_available', $2, $3, 'email', $4, 'high', $5, $6)
            `;

            const title = `Resource Available - Your Turn!`;
            const defaultMessage = `Dear ${user.first_name}, "${resourceTitle}" is now available! You have been moved to the front of the queue. Please collect or access it within ${waitlistEntry.resource_type === 'book' ? '24 hours' : '48 hours'} or it will be offered to the next person.`;
            const body = customMessage || defaultMessage;

            await pool.query(notificationQuery, [
                waitlistEntry.user_id, title, body, user.email, 
                waitlistEntry.resource_type, waitlistEntry.id
            ]);
        } catch (error) {
            console.error('Error sending availability notification:', error);
        }
    }

    async getResourceTitle(resourceType, resourceId) {
        const tables = {
            'book': 'books',
            'digital': 'digital_resources',
            'media': 'media_resources'
        };

        const table = tables[resourceType];
        if (!table) return 'Unknown Resource';

        try {
            const query = `SELECT title FROM ${table} WHERE id = $1`;
            const result = await pool.query(query, [resourceId]);
            return result.rows[0]?.title || 'Unknown Resource';
        } catch (error) {
            console.error('Error getting resource title:', error);
            return 'Unknown Resource';
        }
    }

    // Clean up expired waitlist entries (should be run as a scheduled job)
    async cleanupExpiredEntries() {
        try {
            const query = `
                UPDATE waitlists 
                SET status = 'expired'
                WHERE status = 'notified' 
                AND expires_at < CURRENT_TIMESTAMP
                RETURNING *
            `;

            const result = await pool.query(query);

            // Notify next users in queue for each expired entry
            for (const expiredEntry of result.rows) {
                await this.autoNotifyWhenAvailable(
                    expiredEntry.resource_type, 
                    expiredEntry.resource_id
                );
            }

            console.log(`Cleaned up ${result.rows.length} expired waitlist entries`);
        } catch (error) {
            console.error('Error cleaning up expired waitlist entries:', error);
        }
    }
}

module.exports = new WaitlistController();