// Fine Management Controller
const pool = require('../config/database');

class FineController {
    // Get user's fines
    async getUserFines(req, res) {
        try {
            const userId = req.user.id;
            const { status = 'all' } = req.query;

            let whereClause = 'WHERE f.user_id = $1';
            const queryParams = [userId];

            if (status !== 'all') {
                whereClause += ' AND f.status = $2';
                queryParams.push(status);
            }

            const query = `
                SELECT 
                    f.*,
                    br.book_id,
                    b.title as book_title,
                    b.author as book_author,
                    u.first_name || ' ' || u.last_name as user_name
                FROM fines f
                LEFT JOIN borrow_records br ON f.borrow_record_id = br.id
                LEFT JOIN books b ON br.book_id = b.id
                LEFT JOIN users u ON f.user_id = u.id
                ${whereClause}
                ORDER BY f.assessed_date DESC
            `;

            const result = await pool.query(query, queryParams);

            // Calculate totals
            const totals = {
                total_amount: 0,
                unpaid_amount: 0,
                paid_amount: 0,
                count: result.rows.length
            };

            result.rows.forEach(fine => {
                totals.total_amount += parseFloat(fine.amount);
                if (fine.status === 'paid') {
                    totals.paid_amount += parseFloat(fine.amount);
                } else if (fine.status === 'unpaid') {
                    totals.unpaid_amount += parseFloat(fine.amount);
                }
            });

            res.json({
                success: true,
                data: result.rows,
                summary: totals
            });
        } catch (error) {
            console.error('Error fetching user fines:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching fines',
                error: error.message
            });
        }
    }

    // Get all fines (Admin/Librarian only)
    async getAllFines(req, res) {
        try {
            const { 
                status = 'all',
                fine_type = 'all',
                page = 1,
                limit = 20,
                sort = 'assessed_date',
                order = 'DESC'
            } = req.query;

            const offset = (page - 1) * limit;
            let whereConditions = [];
            let queryParams = [];
            let paramIndex = 1;

            if (status !== 'all') {
                whereConditions.push(`f.status = $${paramIndex}`);
                queryParams.push(status);
                paramIndex++;
            }

            if (fine_type !== 'all') {
                whereConditions.push(`f.fine_type = $${paramIndex}`);
                queryParams.push(fine_type);
                paramIndex++;
            }

            const whereClause = whereConditions.length > 0 ? 
                `WHERE ${whereConditions.join(' AND ')}` : '';

            const allowedSortColumns = ['assessed_date', 'amount', 'due_date', 'status'];
            const sortColumn = allowedSortColumns.includes(sort) ? sort : 'assessed_date';
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            const query = `
                SELECT 
                    f.*,
                    br.book_id,
                    b.title as book_title,
                    b.author as book_author,
                    u.first_name || ' ' || u.last_name as user_name,
                    u.email as user_email,
                    waiver_user.first_name || ' ' || waiver_user.last_name as waived_by_name
                FROM fines f
                LEFT JOIN borrow_records br ON f.borrow_record_id = br.id
                LEFT JOIN books b ON br.book_id = b.id
                LEFT JOIN users u ON f.user_id = u.id
                LEFT JOIN users waiver_user ON f.waived_by = waiver_user.id
                ${whereClause}
                ORDER BY f.${sortColumn} ${sortOrder}
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            queryParams.push(limit, offset);

            const result = await pool.query(query, queryParams);

            // Get total count
            const countQuery = `
                SELECT COUNT(*) 
                FROM fines f
                LEFT JOIN borrow_records br ON f.borrow_record_id = br.id
                LEFT JOIN books b ON br.book_id = b.id
                LEFT JOIN users u ON f.user_id = u.id
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
            console.error('Error fetching all fines:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching fines',
                error: error.message
            });
        }
    }

    // Create new fine (Admin/Librarian only)
    async createFine(req, res) {
        try {
            const {
                user_id,
                borrow_record_id,
                fine_type,
                amount,
                currency = 'USD',
                description,
                due_date,
                notes
            } = req.body;

            // Validate required fields
            if (!user_id || !fine_type || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, fine type, and amount are required'
                });
            }

            // Validate user exists
            const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const query = `
                INSERT INTO fines (
                    user_id, borrow_record_id, fine_type, amount, currency,
                    description, due_date, notes, assessed_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
                RETURNING *
            `;

            const values = [
                user_id, borrow_record_id, fine_type, amount, currency,
                description, due_date, notes
            ];

            const result = await pool.query(query, values);

            // Send notification to user
            await this.sendFineNotification(result.rows[0]);

            res.status(201).json({
                success: true,
                message: 'Fine created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating fine:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating fine',
                error: error.message
            });
        }
    }

    // Update fine (Admin/Librarian only)
    async updateFine(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const allowedFields = [
                'amount', 'currency', 'description', 'due_date', 
                'status', 'notes'
            ];

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
                UPDATE fines 
                SET ${updateFields.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Fine not found'
                });
            }

            res.json({
                success: true,
                message: 'Fine updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating fine:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating fine',
                error: error.message
            });
        }
    }

    // Pay fine
    async payFine(req, res) {
        try {
            const { id } = req.params;
            const { payment_method, payment_reference, amount_paid } = req.body;
            const userId = req.user.id;

            // Get fine details
            const fineQuery = `
                SELECT * FROM fines 
                WHERE id = $1 AND user_id = $2 AND status IN ('unpaid', 'partial')
            `;
            const fineResult = await pool.query(fineQuery, [id, userId]);

            if (fineResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Fine not found or already paid'
                });
            }

            const fine = fineResult.rows[0];
            const totalAmount = parseFloat(fine.amount);
            const paymentAmount = parseFloat(amount_paid || totalAmount);

            let newStatus = 'paid';
            if (paymentAmount < totalAmount) {
                newStatus = 'partial';
            }

            // Update fine
            const updateQuery = `
                UPDATE fines 
                SET 
                    paid_date = CURRENT_DATE,
                    payment_method = $1,
                    payment_reference = $2,
                    status = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *
            `;

            const result = await pool.query(updateQuery, [
                payment_method, payment_reference, newStatus, id
            ]);

            // Create payment record if needed
            await this.recordPayment(id, paymentAmount, payment_method, payment_reference);

            res.json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    fine: result.rows[0],
                    amount_paid: paymentAmount,
                    remaining_balance: Math.max(0, totalAmount - paymentAmount)
                }
            });
        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing payment',
                error: error.message
            });
        }
    }

    // Waive fine (Admin/Librarian only)
    async waiveFine(req, res) {
        try {
            const { id } = req.params;
            const { waived_reason } = req.body;
            const waivedBy = req.user.id;

            const query = `
                UPDATE fines 
                SET 
                    status = 'waived',
                    waived_by = $1,
                    waived_reason = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *
            `;

            const result = await pool.query(query, [waivedBy, waived_reason, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Fine not found'
                });
            }

            // Send notification to user
            await this.sendWaiverNotification(result.rows[0]);

            res.json({
                success: true,
                message: 'Fine waived successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Error waiving fine:', error);
            res.status(500).json({
                success: false,
                message: 'Error waiving fine',
                error: error.message
            });
        }
    }

    // Get fine summary
    async getFineSummary(req, res) {
        try {
            const userId = req.user.role === 'student' ? req.user.id : null;
            
            let whereClause = '';
            let queryParams = [];

            if (userId) {
                whereClause = 'WHERE user_id = $1';
                queryParams.push(userId);
            }

            const query = `
                SELECT 
                    COUNT(*) as total_fines,
                    SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as unpaid_amount,
                    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
                    SUM(CASE WHEN status = 'waived' THEN amount ELSE 0 END) as waived_amount,
                    COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaid_count,
                    COUNT(CASE WHEN status = 'overdue' AND due_date < CURRENT_DATE THEN 1 END) as overdue_count,
                    AVG(amount) as average_fine_amount
                FROM fines
                ${whereClause}
            `;

            const result = await pool.query(query, queryParams);
            const summary = result.rows[0];

            // Get breakdown by fine type
            const typeBreakdownQuery = `
                SELECT 
                    fine_type,
                    COUNT(*) as count,
                    SUM(amount) as total_amount,
                    AVG(amount) as average_amount
                FROM fines
                ${whereClause}
                GROUP BY fine_type
                ORDER BY total_amount DESC
            `;

            const typeResult = await pool.query(typeBreakdownQuery, queryParams);

            res.json({
                success: true,
                data: {
                    summary: {
                        ...summary,
                        unpaid_amount: parseFloat(summary.unpaid_amount || 0),
                        paid_amount: parseFloat(summary.paid_amount || 0),
                        waived_amount: parseFloat(summary.waived_amount || 0),
                        average_fine_amount: parseFloat(summary.average_fine_amount || 0)
                    },
                    by_type: typeResult.rows.map(row => ({
                        ...row,
                        total_amount: parseFloat(row.total_amount),
                        average_amount: parseFloat(row.average_amount)
                    }))
                }
            });
        } catch (error) {
            console.error('Error fetching fine summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching fine summary',
                error: error.message
            });
        }
    }

    // Helper methods
    async sendFineNotification(fine) {
        try {
            // Get user details
            const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [fine.user_id]);
            
            if (userResult.rows.length === 0) return;
            
            const user = userResult.rows[0];

            // Queue notification
            const notificationQuery = `
                INSERT INTO notification_queue (
                    user_id, notification_type, message_title, message_body,
                    delivery_method, delivery_address, related_resource_id
                ) VALUES ($1, 'fine_notice', $2, $3, 'email', $4, $5)
            `;

            const title = `Fine Assessment Notice - $${fine.amount}`;
            const body = `Dear ${user.first_name}, you have been assessed a ${fine.fine_type} fine of $${fine.amount}. ${fine.description || ''}`;

            await pool.query(notificationQuery, [
                fine.user_id, title, body, user.email, fine.id
            ]);
        } catch (error) {
            console.error('Error sending fine notification:', error);
        }
    }

    async sendWaiverNotification(fine) {
        try {
            // Get user details
            const userQuery = 'SELECT email, first_name FROM users WHERE id = $1';
            const userResult = await pool.query(userQuery, [fine.user_id]);
            
            if (userResult.rows.length === 0) return;
            
            const user = userResult.rows[0];

            // Queue notification
            const notificationQuery = `
                INSERT INTO notification_queue (
                    user_id, notification_type, message_title, message_body,
                    delivery_method, delivery_address, related_resource_id
                ) VALUES ($1, 'fine_notice', $2, $3, 'email', $4, $5)
            `;

            const title = `Fine Waived - $${fine.amount}`;
            const body = `Dear ${user.first_name}, your fine of $${fine.amount} has been waived. Reason: ${fine.waived_reason || 'Administrative decision'}`;

            await pool.query(notificationQuery, [
                fine.user_id, title, body, user.email, fine.id
            ]);
        } catch (error) {
            console.error('Error sending waiver notification:', error);
        }
    }

    async recordPayment(fineId, amount, method, reference) {
        // This could create a separate payment record table if needed
        // For now, we store payment info in the fine record itself
        console.log(`Payment recorded: Fine ${fineId}, Amount: $${amount}, Method: ${method}`);
    }
}

module.exports = new FineController();