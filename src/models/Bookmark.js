const { query } = require('../config/database');

class Bookmark {
  constructor(bookmarkData) {
    this.id = bookmarkData.id;
    this.user_id = bookmarkData.user_id;
    this.book_id = bookmarkData.book_id;
    this.notes = bookmarkData.notes;
    this.created_at = bookmarkData.created_at;
    this.updated_at = bookmarkData.updated_at;

    // Additional fields from joins
    this.book_title = bookmarkData.book_title;
    this.book_author = bookmarkData.book_author;
    this.book_isbn = bookmarkData.book_isbn;
    this.book_available_copies = bookmarkData.book_available_copies;
    this.user_name = bookmarkData.user_name;
    this.user_email = bookmarkData.user_email;
  }

  // Create new bookmark
  static async create(userId, bookId, notes = null) {
    // Check if bookmark already exists
    const existing = await Bookmark.findByUserAndBook(userId, bookId);
    if (existing) {
      throw new Error('Bookmark already exists for this book');
    }

    const result = await query(`
      INSERT INTO bookmarks (user_id, book_id, notes)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, bookId, notes]);

    return new Bookmark(result.rows[0]);
  }

  // Find bookmark by ID
  static async findById(id) {
    const result = await query(`
      SELECT bm.*, b.title as book_title, b.author as book_author, 
             b.isbn as book_isbn, b.available_copies as book_available_copies,
             u.first_name || ' ' || u.last_name as user_name, u.email as user_email
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      JOIN users u ON bm.user_id = u.id
      WHERE bm.id = $1 AND b.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Bookmark(result.rows[0]);
  }

  // Find bookmark by user and book
  static async findByUserAndBook(userId, bookId) {
    const result = await query(`
      SELECT bm.*, b.title as book_title, b.author as book_author, 
             b.isbn as book_isbn, b.available_copies as book_available_copies
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      WHERE bm.user_id = $1 AND bm.book_id = $2 AND b.is_active = true
    `, [userId, bookId]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Bookmark(result.rows[0]);
  }

  // Get user's bookmarks with pagination
  static async findByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE bm.user_id = $1 AND b.is_active = true';
    const params = [userId];
    let paramCount = 1;

    if (search) {
      paramCount++;
      whereClause += ` AND (b.title ILIKE $${paramCount} OR b.author ILIKE $${paramCount} OR bm.notes ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Validate sort fields
    const allowedSortFields = ['created_at', 'book_title', 'book_author'];
    const sortField = allowedSortFields.includes(sort_by) ? 
      (sort_by === 'book_title' ? 'b.title' : sort_by === 'book_author' ? 'b.author' : 'bm.created_at') : 
      'bm.created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      ${whereClause}
    `, params);
    const total = parseInt(countResult.rows[0].total);

    // Get bookmarks
    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT bm.*, b.title as book_title, b.author as book_author, 
             b.isbn as book_isbn, b.available_copies as book_available_copies
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    return {
      bookmarks: result.rows.map(row => new Bookmark(row)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Get all bookmarks with filters and pagination (admin/librarian)
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      user_id,
      book_id,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE b.is_active = true';
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      whereClause += ` AND bm.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (book_id) {
      paramCount++;
      whereClause += ` AND bm.book_id = $${paramCount}`;
      params.push(book_id);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (b.title ILIKE $${paramCount} OR b.author ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Validate sort fields
    const allowedSortFields = ['created_at', 'book_title', 'book_author', 'user_name'];
    const sortField = allowedSortFields.includes(sort_by) ? 
      (sort_by === 'book_title' ? 'b.title' : 
       sort_by === 'book_author' ? 'b.author' : 
       sort_by === 'user_name' ? 'u.first_name' : 'bm.created_at') : 
      'bm.created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      JOIN users u ON bm.user_id = u.id
      ${whereClause}
    `, params);
    const total = parseInt(countResult.rows[0].total);

    // Get bookmarks
    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT bm.*, b.title as book_title, b.author as book_author, 
             b.isbn as book_isbn, b.available_copies as book_available_copies,
             u.first_name || ' ' || u.last_name as user_name, u.email as user_email
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      JOIN users u ON bm.user_id = u.id
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    return {
      bookmarks: result.rows.map(row => new Bookmark(row)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Update bookmark notes
  async updateNotes(notes) {
    const result = await query(`
      UPDATE bookmarks 
      SET notes = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [this.id, notes]);

    return new Bookmark(result.rows[0]);
  }

  // Delete bookmark
  async delete() {
    await query('DELETE FROM bookmarks WHERE id = $1', [this.id]);
    return true;
  }

  // Check if user has bookmarked a specific book
  static async isBookmarked(userId, bookId) {
    const result = await query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );

    return result.rows.length > 0;
  }

  // Get most bookmarked books
  static async getMostBookmarked(limit = 10) {
    const result = await query(`
      SELECT b.*, COUNT(bm.id) as bookmark_count
      FROM books b
      LEFT JOIN bookmarks bm ON b.id = bm.book_id
      WHERE b.is_active = true
      GROUP BY b.id
      ORDER BY bookmark_count DESC, b.title ASC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => {
      const book = row;
      book.bookmark_count = parseInt(row.bookmark_count);
      return book;
    });
  }

  // Get bookmark statistics
  static async getStats(options = {}) {
    const { user_id, start_date, end_date } = options;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      whereClause += ` AND bm.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (start_date) {
      paramCount++;
      whereClause += ` AND bm.created_at >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereClause += ` AND bm.created_at <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_bookmarks,
        COUNT(DISTINCT bm.user_id) as unique_users,
        COUNT(DISTINCT bm.book_id) as unique_books
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      ${whereClause} AND b.is_active = true
    `, params);

    return result.rows[0];
  }

  // Get user's bookmark count
  static async getUserBookmarkCount(userId) {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      WHERE bm.user_id = $1 AND b.is_active = true
    `, [userId]);

    return parseInt(result.rows[0].count);
  }

  // Get recently bookmarked books
  static async getRecentlyBookmarked(limit = 10) {
    const result = await query(`
      SELECT bm.*, b.title as book_title, b.author as book_author,
             u.first_name || ' ' || u.last_name as user_name
      FROM bookmarks bm
      JOIN books b ON bm.book_id = b.id
      JOIN users u ON bm.user_id = u.id
      WHERE b.is_active = true
      ORDER BY bm.created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => new Bookmark(row));
  }

  // Check if book is available for borrowing (from bookmark perspective)
  async isBookAvailable() {
    return this.book_available_copies > 0;
  }

  // Get book details from bookmark
  async getBookDetails() {
    const result = await query(
      'SELECT * FROM books WHERE id = $1 AND is_active = true',
      [this.book_id]
    );

    return result.rows[0] || null;
  }
}

module.exports = Bookmark;