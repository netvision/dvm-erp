const { query } = require('../config/database');

class BorrowRecord {
  constructor(recordData) {
    this.id = recordData.id;
    this.user_id = recordData.user_id;
    this.book_id = recordData.book_id;
    this.borrow_date = recordData.borrow_date;
    this.due_date = recordData.due_date;
    this.return_date = recordData.return_date;
    this.status = recordData.status;
    this.condition_notes = recordData.condition_notes;
    this.fine_amount = recordData.fine_amount;
    this.created_at = recordData.created_at;
    this.updated_at = recordData.updated_at;

    // Additional fields from joins
    this.book_title = recordData.book_title;
    this.book_author = recordData.book_author;
    this.user_name = recordData.user_name;
    this.user_email = recordData.user_email;
  }

  // Create new borrow record
  static async create(userId, bookId, dueDate = null) {
    // Default due date is 14 days from now
    if (!dueDate) {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      dueDate = defaultDueDate;
    }

    const result = await query(`
      INSERT INTO borrow_records (user_id, book_id, due_date, status)
      VALUES ($1, $2, $3, 'borrowed')
      RETURNING *
    `, [userId, bookId, dueDate]);

    return new BorrowRecord(result.rows[0]);
  }

  // Find record by ID
  static async findById(id) {
    const result = await query(`
      SELECT br.*, b.title as book_title, b.author as book_author,
             u.first_name || ' ' || u.last_name as user_name, u.email as user_email
      FROM borrow_records br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.user_id = u.id
      WHERE br.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new BorrowRecord(result.rows[0]);
  }

  // Find active borrow record for user and book
  static async findActiveBorrow(userId, bookId) {
    const result = await query(`
      SELECT * FROM borrow_records 
      WHERE user_id = $1 AND book_id = $2 AND status = 'borrowed'
    `, [userId, bookId]);

    if (result.rows.length === 0) {
      return null;
    }

    return new BorrowRecord(result.rows[0]);
  }

  // Get all borrow records with filters and pagination
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      user_id,
      book_id,
      status,
      overdue_only = false,
      search
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      whereClause += ` AND br.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (book_id) {
      paramCount++;
      whereClause += ` AND br.book_id = $${paramCount}`;
      params.push(book_id);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND br.status = $${paramCount}`;
      params.push(status);
    }

    if (overdue_only) {
      whereClause += ` AND br.status = 'borrowed' AND br.due_date < CURRENT_DATE`;
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (b.title ILIKE $${paramCount} OR b.author ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM borrow_records br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.user_id = u.id
      ${whereClause}
    `, params);
    const total = parseInt(countResult.rows[0].total);

    // Get records
    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT br.*, b.title as book_title, b.author as book_author,
             u.first_name || ' ' || u.last_name as user_name, u.email as user_email
      FROM borrow_records br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.user_id = u.id
      ${whereClause}
      ORDER BY br.created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    return {
      records: result.rows.map(row => new BorrowRecord(row)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Return book
  async returnBook(conditionNotes = null) {
    // Calculate fine if overdue
    let fineAmount = 0;
    const today = new Date();
    const dueDate = new Date(this.due_date);

    if (today > dueDate) {
      const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysOverdue * parseFloat(process.env.FINE_PER_DAY || '0.50');
    }

    const result = await query(`
      UPDATE borrow_records 
      SET return_date = CURRENT_TIMESTAMP, 
          status = 'returned',
          condition_notes = $2,
          fine_amount = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [this.id, conditionNotes, fineAmount]);

    return new BorrowRecord(result.rows[0]);
  }

  // Mark as lost
  async markAsLost() {
    const result = await query(`
      UPDATE borrow_records 
      SET status = 'lost', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [this.id]);

    return new BorrowRecord(result.rows[0]);
  }

  // Renew borrow (extend due date)
  async renew(additionalDays = 14) {
    const newDueDate = new Date(this.due_date);
    newDueDate.setDate(newDueDate.getDate() + additionalDays);

    const result = await query(`
      UPDATE borrow_records 
      SET due_date = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'borrowed'
      RETURNING *
    `, [this.id, newDueDate]);

    if (result.rows.length === 0) {
      throw new Error('Cannot renew this borrow record');
    }

    return new BorrowRecord(result.rows[0]);
  }

  // Check if overdue
  isOverdue() {
    const today = new Date();
    const dueDate = new Date(this.due_date);
    return this.status === 'borrowed' && today > dueDate;
  }

  // Get days until due
  getDaysUntilDue() {
    const today = new Date();
    const dueDate = new Date(this.due_date);
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get overdue records
  static async getOverdueRecords() {
    const result = await query(`
      SELECT br.*, b.title as book_title, b.author as book_author,
             u.first_name || ' ' || u.last_name as user_name, u.email as user_email
      FROM borrow_records br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.user_id = u.id
      WHERE br.status = 'borrowed' AND br.due_date < CURRENT_DATE
      ORDER BY br.due_date ASC
    `);

    return result.rows.map(row => new BorrowRecord(row));
  }

  // Update overdue records status
  static async updateOverdueStatuses() {
    const result = await query(`
      UPDATE borrow_records 
      SET status = 'overdue', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'borrowed' AND due_date < CURRENT_DATE
      RETURNING id
    `);

    return result.rows.length;
  }

  // Get borrowing statistics
  static async getStats(options = {}) {
    const { start_date, end_date, user_id } = options;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (start_date) {
      paramCount++;
      whereClause += ` AND borrow_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereClause += ` AND borrow_date <= $${paramCount}`;
      params.push(end_date);
    }

    if (user_id) {
      paramCount++;
      whereClause += ` AND user_id = $${paramCount}`;
      params.push(user_id);
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_borrows,
        COUNT(CASE WHEN status = 'borrowed' THEN 1 END) as current_borrows,
        COUNT(CASE WHEN status = 'returned' THEN 1 END) as total_returns,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
        COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost_count,
        COALESCE(SUM(fine_amount), 0) as total_fines
      FROM borrow_records 
      ${whereClause}
    `, params);

    return result.rows[0];
  }

  // Get user's current borrows
  static async getUserCurrentBorrows(userId) {
    const result = await query(`
      SELECT br.*, b.title as book_title, b.author as book_author
      FROM borrow_records br
      JOIN books b ON br.book_id = b.id
      WHERE br.user_id = $1 AND br.status = 'borrowed'
      ORDER BY br.due_date ASC
    `, [userId]);

    return result.rows.map(row => new BorrowRecord(row));
  }

  // Check if user can borrow more books
  static async canUserBorrow(userId, maxBooksPerUser = 5) {
    const result = await query(`
      SELECT COUNT(*) as current_borrows
      FROM borrow_records
      WHERE user_id = $1 AND status = 'borrowed'
    `, [userId]);

    const currentBorrows = parseInt(result.rows[0].current_borrows);
    return currentBorrows < maxBooksPerUser;
  }
}

module.exports = BorrowRecord;