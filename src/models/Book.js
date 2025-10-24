const { query } = require('../config/database');

class Book {
  constructor(bookData) {
    this.id = bookData.id;
    this.title = bookData.title;
    this.author = bookData.author;
    this.isbn = bookData.isbn;
    this.publisher = bookData.publisher;
    this.publication_year = bookData.publication_year;
    this.genre = bookData.genre;
    this.description = bookData.description;
    this.total_copies = bookData.total_copies;
    this.available_copies = bookData.available_copies;
    this.location = bookData.location;
    this.language = bookData.language;
    this.is_active = bookData.is_active;
    this.created_at = bookData.created_at;
    this.updated_at = bookData.updated_at;
  }

  // Create new book
  static async create(bookData) {
    const {
      title,
      author,
      isbn,
      publisher,
      publication_year,
      genre,
      description,
      total_copies,
      location,
      language = 'English'
    } = bookData;

    const available_copies = bookData.available_copies || total_copies;

    const result = await query(`
      INSERT INTO books (
        title, author, isbn, publisher, publication_year, genre, description,
        total_copies, available_copies, location, language
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      title, author, isbn, publisher, publication_year, genre, description,
      total_copies, available_copies, location, language
    ]);

    return new Book(result.rows[0]);
  }

  // Find book by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM books WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new Book(result.rows[0]);
  }

  // Find book by ISBN
  static async findByIsbn(isbn) {
    const result = await query(
      'SELECT * FROM books WHERE isbn = $1 AND is_active = true',
      [isbn]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new Book(result.rows[0]);
  }

  // Search books with filters and pagination
  static async search(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      genre,
      author,
      language,
      available_only = false,
      sort_by = 'title',
      sort_order = 'ASC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE is_active = true';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (title ILIKE $${paramCount} OR author ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (genre) {
      paramCount++;
      whereClause += ` AND genre ILIKE $${paramCount}`;
      params.push(`%${genre}%`);
    }

    if (author) {
      paramCount++;
      whereClause += ` AND author ILIKE $${paramCount}`;
      params.push(`%${author}%`);
    }

    if (language) {
      paramCount++;
      whereClause += ` AND language = $${paramCount}`;
      params.push(language);
    }

    if (available_only) {
      whereClause += ' AND available_copies > 0';
    }

    // Validate sort fields
    const allowedSortFields = ['title', 'author', 'publication_year', 'created_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'title';
    const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM books ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get books
    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT * FROM books ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    return {
      books: result.rows.map(row => new Book(row)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Get all books with pagination
  static async findAll(options = {}) {
    return await Book.search(options);
  }

  // Update book
  async update(updateData) {
    const allowedFields = [
      'title', 'author', 'isbn', 'publisher', 'publication_year',
      'genre', 'description', 'total_copies', 'available_copies',
      'location', 'language'
    ];

    const fieldsToUpdate = Object.keys(updateData)
      .filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
      return this;
    }

    // If total_copies is being updated, adjust available_copies accordingly
    if (updateData.total_copies && !updateData.available_copies) {
      const difference = updateData.total_copies - this.total_copies;
      updateData.available_copies = this.available_copies + difference;
    }

    const setClause = fieldsToUpdate
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const values = [this.id, ...fieldsToUpdate.map(field => updateData[field])];

    const result = await query(`
      UPDATE books SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, values);

    return new Book(result.rows[0]);
  }

  // Check if book is available for borrowing
  async isAvailable() {
    const result = await query(
      'SELECT available_copies FROM books WHERE id = $1',
      [this.id]
    );

    return result.rows[0]?.available_copies > 0;
  }

  // Decrease available copies (when borrowed)
  async decreaseAvailableCopies(count = 1) {
    const result = await query(`
      UPDATE books 
      SET available_copies = available_copies - $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND available_copies >= $2
      RETURNING available_copies
    `, [this.id, count]);

    if (result.rows.length === 0) {
      throw new Error('Not enough copies available');
    }

    this.available_copies = result.rows[0].available_copies;
    return this;
  }

  // Increase available copies (when returned)
  async increaseAvailableCopies(count = 1) {
    const result = await query(`
      UPDATE books 
      SET available_copies = LEAST(available_copies + $2, total_copies), 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING available_copies
    `, [this.id, count]);

    this.available_copies = result.rows[0].available_copies;
    return this;
  }

  // Get borrowing statistics
  async getBorrowingStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_borrows,
        COUNT(CASE WHEN status = 'borrowed' THEN 1 END) as current_borrows,
        COUNT(CASE WHEN status = 'returned' THEN 1 END) as total_returns,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM borrow_records 
      WHERE book_id = $1
    `, [this.id]);

    return result.rows[0];
  }

  // Get current borrowers
  async getCurrentBorrowers() {
    const result = await query(`
      SELECT br.*, u.first_name, u.last_name, u.email
      FROM borrow_records br
      JOIN users u ON br.user_id = u.id
      WHERE br.book_id = $1 AND br.status = 'borrowed'
      ORDER BY br.created_at DESC
    `, [this.id]);

    return result.rows;
  }

  // Soft delete book
  async delete() {
    await query(
      'UPDATE books SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [this.id]
    );

    this.is_active = false;
    return this;
  }

  // Restore deleted book
  async restore() {
    await query(
      'UPDATE books SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [this.id]
    );

    this.is_active = true;
    return this;
  }

  // Get popular books (most borrowed)
  static async getPopular(limit = 10) {
    const result = await query(`
      SELECT b.*, COUNT(br.id) as borrow_count
      FROM books b
      LEFT JOIN borrow_records br ON b.id = br.book_id
      WHERE b.is_active = true
      GROUP BY b.id
      ORDER BY borrow_count DESC, b.title ASC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => {
      const book = new Book(row);
      book.borrow_count = parseInt(row.borrow_count);
      return book;
    });
  }

  // Get recently added books
  static async getRecentlyAdded(limit = 10) {
    const result = await query(`
      SELECT * FROM books
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => new Book(row));
  }
}

module.exports = Book;