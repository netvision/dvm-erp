// Reservation Management Controller
const pool = require('../config/database');

class ReservationController {
    // Get user's reservations
    async getUserReservations(req, res) {
        try {
            const userId = req.user.id;
            const { status = 'all' } = req.query;

            let whereClause = 'WHERE r.user_id = $1';
            const queryParams = [userId];

            if (status !== 'all') {
                whereClause += ' AND r.status = $2';
                queryParams.push(status);
            }

            const query = `
                SELECT 
                    r.*,
                    CASE 
                        WHEN r.resource_type = 'book' THEN b.title
                        WHEN r.resource_type = 'digital' THEN dr.title
                        WHEN r.resource_type = 'media' THEN mr.title
                    END as resource_title,
                    CASE 
                        WHEN r.resource_type = 'book' THEN b.author
                        WHEN r.resource_type = 'digital' THEN dr.author
                        WHEN r.resource_type = 'media' THEN mr.author
                    END as resource_author,
                    CASE 
                        WHEN r.resource_type = 'book' THEN b.cover_image_url
                        WHEN r.resource_type = 'digital' THEN dr.cover_image_url
                        WHEN r.resource_type = 'media' THEN mr.thumbnail_url
                    END as resource_image,
                    u.first_name || ' ' || u.last_name as user_name
                FROM reservations r
                LEFT JOIN books b ON r.resource_type = 'book' AND r.resource_id = b.id
                LEFT JOIN digital_resources dr ON r.resource_type = 'digital' AND r.resource_id = dr.id
                LEFT JOIN media_resources mr ON r.resource_type = 'media' AND r.resource_id = mr.id
                LEFT JOIN users u ON r.user_id = u.id
                ${whereClause}
                ORDER BY r.reservation_date DESC
            `;

            const result = await pool.query(query, queryParams);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Error fetching user reservations:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching reservations',
                error: error.message
            });
        }
    }

    // Get all reservations (Admin/Librarian only)
    async getAllReservations(req, res) {
        try {
            const { 
                status = 'all',
                resource_type = 'all',
                page = 1,
                limit = 20,
                sort = 'reservation_date',
                order = 'DESC'
            } = req.query;

            const offset = (page - 1) * limit;
            let whereConditions = [];
            let queryParams = [];
            let paramIndex = 1;

            if (status !== 'all') {
                whereConditions.push(`r.status = $${paramIndex}`);
                queryParams.push(status);
                paramIndex++;
            }

            if (resource_type !== 'all') {
                whereConditions.push(`r.resource_type = $${paramIndex}`);
                queryParams.push(resource_type);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? 
                `WHERE ${whereConditions.join(' AND ')}` : '';

            const allowedSortColumns = ['reservation_date', 'expiry_date', 'status', 'resource_type'];
            const sortColumn = allowedSortColumns.includes(sort) ? sort : 'reservation_date';
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const query = `
                SELECT 
                    r.*,
                    CASE 
                        WHEN r.resource_type = 'book' THEN b.title
                        WHEN r.resource_type = 'digital' THEN dr.title
                        WHEN r.resource_type = 'media' THEN mr.title
                    END as resource_title,
                    CASE 
                        WHEN r.resource_type = 'book' THEN b.author
                        WHEN r.resource_type = 'digital' THEN dr.author
                        WHEN r.resource_type = 'media' THEN mr.author
                    END as resource_author,
                    u.first_name || ' ' || u.last_name as user_name,
                    u.email as user_email
                FROM reservations r
                LEFT JOIN books b ON r.resource_type = 'book' AND r.resource_id = b.id
                LEFT JOIN digital_resources dr ON r.resource_type = 'digital' AND r.resource_id = dr.id
                LEFT JOIN media_resources mr ON r.resource_type = 'media' AND r.resource_id = mr.id
                LEFT JOIN users u ON r.user_id = u.id
                ${whereClause}
                ORDER BY r.${sortColumn} ${sortOrder}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);

            // Get total count
            const countQuery = `
                SELECT COUNT(*) 
                FROM reservations r
                LEFT JOIN users u ON r.user_id = u.id
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
            console.error('Error fetching all reservations:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching reservations',
                error: error.message
            });
        }
    }

    // Create new reservation
    async createReservation(req, res) {
        try {
            const {
                resource_type,
                resource_id,
                reservation_date,
                notes
            } = req.body;

            const userId = req.user.id;

            // Validate required fields
            if (!resource_type || !resource_id || !reservation_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource type, resource ID, and reservation date are required'
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

            // Check if user already has an active reservation for this resource
            const existingReservationQuery = `
                SELECT id FROM reservations 
                WHERE user_id = $1 AND resource_type = $2 AND resource_id = $3 
                AND status = 'active'
            `;
            const existingResult = await pool.query(existingReservationQuery, [
                userId, resource_type, resource_id
            ]);

            if (existingResult.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an active reservation for this resource'
                });
            }

            // Check if resource is available for reservation
            const isAvailable = await this.checkResourceAvailability(resource_type, resource_id, reservation_date);
            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource is not available for the requested date'
                });
            }

            // Calculate expiry date (24 hours after reservation date)
            const expiryDate = new Date(reservation_date);
            expiryDate.setHours(expiryDate.getHours() + 24);

            const query = `
                INSERT INTO reservations (
                    user_id, resource_type, resource_id, reservation_date,
                    expiry_date, notes, status
                ) VALUES ($1, $2, $3, $4, $5, $6, 'active')
                RETURNING *
            `;

            const values = [
                userId, resource_type, resource_id, reservation_date,
                expiryDate, notes
            ];

            const result = await pool.query(query, values);

            // Send confirmation notification
            await this.sendReservationConfirmation(result.rows[0]);

            res.status(201).json({
                success: true,
                message: 'Reservation created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating reservation:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating reservation',
                error: error.message
            });
        }
    }

    // Update reservation
    async updateReservation(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Students can only update their own reservations
            let whereClause = 'WHERE id = $1';
            let queryParams = [id];

            if (userRole === 'student') {
                whereClause += ' AND user_id = $2';
                queryParams.push(userId);
            }

            const allowedFields = ['reservation_date', 'notes', 'status'];
            
            // Admin/Librarian can update status, students cannot
            if (userRole === 'student' && updates.status) {
                delete updates.status;
            }

            const updateFields = [];
            const values = [];
            let paramIndex = queryParams.length + 1;

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
            
            // If reservation date is updated, update expiry date too
            if (updates.reservation_date) {
                const expiryDate = new Date(updates.reservation_date);
                expiryDate.setHours(expiryDate.getHours() + 24);
                updateFields.push(`expiry_date = $${paramIndex}`);
                values.push(expiryDate);
                paramIndex++;
            }

            const finalQueryParams = [...queryParams, ...values];

            const query = `
                UPDATE reservations 
                SET ${updateFields.join(', ')}
                ${whereClause}
                RETURNING *
            `;

            const result = await pool.query(query, finalQueryParams);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Reservation not found or access denied'
                });
            }

            res.json({
                success: true,
                message: 'Reservation updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating reservation:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating reservation',
                error: error.message
            });
        }
    }

    // Cancel reservation
    async cancelReservation(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            // Students can only cancel their own reservations
            let whereClause = 'WHERE id = $1 AND status = $2';
            let queryParams = [id, 'active'];

            if (userRole === 'student') {
                whereClause += ' AND user_id = $3';
                queryParams.push(userId);
            }

            const query = `
                UPDATE reservations 
                SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
                ${whereClause}
                RETURNING *
            `;

            const result = await pool.query(query, queryParams);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Active reservation not found or access denied'
                });
            }

            // Send cancellation notification
            await this.sendCancellationNotification(result.rows[0]);

            res.json({
                success: true,
                message: 'Reservation cancelled successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error cancelling reservation:', error);
            res.status(500).json({
                success: false,
                message: 'Error cancelling reservation',
                error: error.message
            });
        }
    }

    // Fulfill reservation (Admin/Librarian only)
    async fulfillReservation(req, res) {
        try {
            const { id } = req.params;
            const { notes } = req.body;

            const query = `
                UPDATE reservations 
                SET 
                    status = 'fulfilled',
                    notes = COALESCE($2, notes),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND status = 'active'
                RETURNING *
            `;

            const result = await pool.query(query, [id, notes]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Active reservation not found'
                });
            }

            const reservation = result.rows[0];

            // If it's a book reservation, create a borrow record
            if (reservation.resource_type === 'book') {
                await this.createBorrowFromReservation(reservation);
            }

            // Send fulfillment notification
            await this.sendFulfillmentNotification(reservation);

            res.json({
                success: true,
                message: 'Reservation fulfilled successfully',
                data: reservation
            });
        } catch (error) {
            console.error('Error fulfilling reservation:', error);
            res.status(500).json({
                success: false,
                message: 'Error fulfilling reservation',
                error: error.message
            });
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

    async checkResourceAvailability(resourceType, resourceId, reservationDate) {
        // For books, check if it's not already borrowed or reserved for that date
        if (resourceType === 'book') {
            // Check current borrows
            const borrowQuery = `
                SELECT id FROM borrow_records 
                WHERE book_id = $1 AND return_date IS NULL
            `;
            const borrowResult = await pool.query(borrowQuery, [resourceId]);
            
            if (borrowResult.rows.length > 0) {
                return false; // Already borrowed
            }

            // Check overlapping reservations
            const reservationQuery = `
                SELECT id FROM reservations 
                WHERE resource_type = 'book' AND resource_id = $1 
                AND status = 'active'
                AND reservation_date::date = $2::date
            `;
            const reservationResult = await pool.query(reservationQuery, [resourceId, reservationDate]);
            
            return reservationResult.rows.length === 0;
        }

        // Digital and media resources are typically always available
        return true;
    }

    async createBorrowFromReservation(reservation) {
        try {
            // Create a borrow record when a book reservation is fulfilled
            const borrowQuery = `
                INSERT INTO borrow_records (
                    user_id, book_id, borrow_date, due_date, status
                ) VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'borrowed')
                RETURNING *
            `;

            const result = await pool.query(borrowQuery, [
                reservation.user_id, 
                reservation.resource_id
            ]);

            console.log('Borrow record created from reservation:', result.rows[0]);
        } catch (error) {
            console.error('Error creating borrow record from reservation:', error);
        }
    }

    async sendReservationConfirmation(reservation) {
        try {
            // Get user details
            const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [reservation.user_id]);
            
            if (userResult.rows.length === 0) return;
            
            const user = userResult.rows[0];

            // Get resource title
            const resourceTitle = await this.getResourceTitle(reservation.resource_type, reservation.resource_id);

            // Queue notification
            const notificationQuery = `
                INSERT INTO notification_queue (
                    user_id, notification_type, message_title, message_body,
                    delivery_method, delivery_address, related_resource_type, related_resource_id
                ) VALUES ($1, 'reservation_confirmation', $2, $3, 'email', $4, $5, $6)
            `;

            const title = `Reservation Confirmed`;
            const body = `Dear ${user.first_name}, your reservation for "${resourceTitle}" has been confirmed for ${new Date(reservation.reservation_date).toLocaleDateString()}. It will expire on ${new Date(reservation.expiry_date).toLocaleDateString()}.`;

            await pool.query(notificationQuery, [
                reservation.user_id, title, body, user.email, 
                reservation.resource_type, reservation.id
            ]);
        } catch (error) {
            console.error('Error sending reservation confirmation:', error);
        }
    }

    async sendCancellationNotification(reservation) {
        try {
            // Get user details
            const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [reservation.user_id]);
            
            if (userResult.rows.length === 0) return;
            
            const user = userResult.rows[0];

            // Get resource title
            const resourceTitle = await this.getResourceTitle(reservation.resource_type, reservation.resource_id);

            // Queue notification
            const notificationQuery = `
                INSERT INTO notification_queue (
                    user_id, notification_type, message_title, message_body,
                    delivery_method, delivery_address, related_resource_type, related_resource_id
                ) VALUES ($1, 'reservation_cancelled', $2, $3, 'email', $4, $5, $6)
            `;

            const title = `Reservation Cancelled`;
            const body = `Dear ${user.first_name}, your reservation for "${resourceTitle}" scheduled for ${new Date(reservation.reservation_date).toLocaleDateString()} has been cancelled.`;

            await pool.query(notificationQuery, [
                reservation.user_id, title, body, user.email, 
                reservation.resource_type, reservation.id
            ]);
        } catch (error) {
            console.error('Error sending cancellation notification:', error);
        }
    }

    async sendFulfillmentNotification(reservation) {
        try {
            // Get user details
            const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [reservation.user_id]);
            
            if (userResult.rows.length === 0) return;
            
            const user = userResult.rows[0];

            // Get resource title
            const resourceTitle = await this.getResourceTitle(reservation.resource_type, reservation.resource_id);

            // Queue notification
            const notificationQuery = `
                INSERT INTO notification_queue (
                    user_id, notification_type, message_title, message_body,
                    delivery_method, delivery_address, related_resource_type, related_resource_id
                ) VALUES ($1, 'reservation_fulfilled', $2, $3, 'email', $4, $5, $6)
            `;

            const title = `Reservation Ready`;
            const body = `Dear ${user.first_name}, your reservation for "${resourceTitle}" is now ready for pickup or access. Please collect it within the specified timeframe.`;

            await pool.query(notificationQuery, [
                reservation.user_id, title, body, user.email, 
                reservation.resource_type, reservation.id
            ]);
        } catch (error) {
            console.error('Error sending fulfillment notification:', error);
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
}

module.exports = new ReservationController();