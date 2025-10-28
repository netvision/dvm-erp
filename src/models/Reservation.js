const { query } = require('../config/database');

class Reservation {
  constructor(reservationData) {
    this.id = reservationData.id;
    this.user_id = reservationData.user_id;
    this.book_id = reservationData.book_id;
    this.status = reservationData.status;
    this.reservation_date = reservationData.reservation_date;
    this.expiry_date = reservationData.expiry_date;
    this.fulfilled_date = reservationData.fulfilled_date;
    this.cancelled_date = reservationData.cancelled_date;
    this.cancellation_reason = reservationData.cancellation_reason;
    this.notes = reservationData.notes;
    this.created_at = reservationData.created_at;
    this.updated_at = reservationData.updated_at;

    // Additional fields from joins
    this.book_title = reservationData.book_title;
    this.book_author = reservationData.book_author;
    this.book_isbn = reservationData.book_isbn;
    this.user_name = reservationData.user_name;
    this.user_email = reservationData.user_email;
    this.user_student_id = reservationData.user_student_id;
  }

  // Create new reservation
  static async create(userId, bookId, notes = null) {
    // Check if user already has an active reservation for this book
    const existingReservation = await query(`
      SELECT * FROM reservations 
      WHERE user_id = $1 AND book_id = $2 AND status = 'pending'
    `, [userId, bookId]);

    if (existingReservation.rows.length > 0) {
      throw new Error('You already have an active reservation for this book');
    }

    // Set expiry date to 7 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const result = await query(`
      INSERT INTO reservations (user_id, book_id, expiry_date, notes, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `, [userId, bookId, expiryDate, notes]);

    return new Reservation(result.rows[0]);
  }

  // Find reservation by ID with joined data
  static async findById(id) {
    const result = await query(`
      SELECT r.*, 
             b.title as book_title, b.author as book_author, b.isbn as book_isbn,
             u.first_name || ' ' || u.last_name as user_name, 
             u.email as user_email,
             u.student_id as user_student_id
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Reservation(result.rows[0]);
  }

  // Get all reservations with filters and pagination
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      user_id,
      book_id,
      status,
      sort_by = 'reservation_date',
      sort_order = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      whereClause += ` AND r.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (book_id) {
      paramCount++;
      whereClause += ` AND r.book_id = $${paramCount}`;
      params.push(book_id);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND r.status = $${paramCount}`;
      params.push(status);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM reservations r ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results with joined data
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const result = await query(`
      SELECT r.*, 
             b.title as book_title, b.author as book_author, b.isbn as book_isbn,
             b.available_copies,
             u.first_name || ' ' || u.last_name as user_name, 
             u.email as user_email,
             u.student_id as user_student_id,
             u.phone as user_phone
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `, [...params, limit, offset]);

    const reservations = result.rows.map(row => new Reservation(row));

    return {
      reservations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get user's active reservations
  static async getUserActiveReservations(userId) {
    const result = await query(`
      SELECT r.*, 
             b.title as book_title, b.author as book_author, b.isbn as book_isbn,
             b.available_copies
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = $1 AND r.status = 'pending'
      ORDER BY r.reservation_date DESC
    `, [userId]);

    return result.rows.map(row => new Reservation(row));
  }

  // Get pending reservations for a book (queue)
  static async getBookReservationQueue(bookId) {
    const result = await query(`
      SELECT r.*, 
             u.first_name || ' ' || u.last_name as user_name,
             u.email as user_email,
             u.student_id as user_student_id,
             u.phone as user_phone
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = $1 AND r.status = 'pending'
      ORDER BY r.reservation_date ASC
    `, [bookId]);

    return result.rows.map(row => new Reservation(row));
  }

  // Fulfill a reservation (when book becomes available)
  static async fulfill(reservationId) {
    const result = await query(`
      UPDATE reservations 
      SET status = 'fulfilled', fulfilled_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [reservationId]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Reservation(result.rows[0]);
  }

  // Cancel a reservation
  static async cancel(reservationId, reason = null) {
    const result = await query(`
      UPDATE reservations 
      SET status = 'cancelled', 
          cancelled_date = CURRENT_TIMESTAMP,
          cancellation_reason = $2
      WHERE id = $1
      RETURNING *
    `, [reservationId, reason]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Reservation(result.rows[0]);
  }

  // Expire old pending reservations
  static async expireOldReservations() {
    const result = await query(`
      UPDATE reservations 
      SET status = 'expired'
      WHERE status = 'pending' AND expiry_date < CURRENT_TIMESTAMP
      RETURNING *
    `);

    return result.rows.map(row => new Reservation(row));
  }

  // Get reservation statistics
  static async getStats() {
    const result = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
        COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
        COUNT(*) as total_count
      FROM reservations
    `);

    return result.rows[0];
  }

  // Check if user can make a reservation
  static async canUserReserve(userId) {
    const result = await query(`
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE user_id = $1 AND status = 'pending'
    `, [userId]);

    const activeReservations = parseInt(result.rows[0].count);
    const MAX_ACTIVE_RESERVATIONS = 5; // Configurable limit

    return activeReservations < MAX_ACTIVE_RESERVATIONS;
  }

  // Get next reservation in queue for a book
  static async getNextInQueue(bookId) {
    const result = await query(`
      SELECT r.*, 
             u.first_name || ' ' || u.last_name as user_name,
             u.email as user_email,
             u.student_id as user_student_id,
             u.phone as user_phone
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = $1 AND r.status = 'pending'
      ORDER BY r.reservation_date ASC
      LIMIT 1
    `, [bookId]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Reservation(result.rows[0]);
  }
}

module.exports = Reservation;
