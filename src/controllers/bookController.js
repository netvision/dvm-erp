const Book = require('../models/Book');
const logger = require('../utils/logger');

class BookController {
  // Get all books with search and filtering
  static async getBooks(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        genre,
        author,
        language,
        available_only,
        sort_by,
        sort_order
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        genre,
        author,
        language,
        available_only: available_only === 'true',
        sort_by,
        sort_order
      };

      const result = await Book.search(options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Get books error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve books'
      });
    }
  }

  // Get book by ID
  static async getBookById(req, res) {
    try {
      const { id } = req.params;

      const book = await Book.findById(parseInt(id));
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      // Get borrowing statistics if user is admin/librarian
      let borrowingStats = null;
      if (req.user && ['admin', 'librarian'].includes(req.user.role)) {
        borrowingStats = await book.getBorrowingStats();
      }

      res.json({
        status: 'success',
        data: {
          book,
          ...(borrowingStats && { borrowing_stats: borrowingStats })
        }
      });
    } catch (error) {
      logger.error('Get book by ID error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve book'
      });
    }
  }

  // Create new book (librarian/admin only)
  static async createBook(req, res) {
    try {
      const {
        title,
        author,
        isbn,
        publisher,
        publication_year,
        genre,
        description,
        total_copies,
        available_copies,
        location,
        language
      } = req.body;

      // Check if book with same ISBN already exists
      if (isbn) {
        const existingBook = await Book.findByIsbn(isbn);
        if (existingBook) {
          return res.status(400).json({
            status: 'error',
            message: 'Book with this ISBN already exists'
          });
        }
      }

      const book = await Book.create({
        title,
        author,
        isbn,
        publisher,
        publication_year,
        genre,
        description,
        total_copies,
        available_copies,
        location,
        language
      });

      logger.info('New book created:', { 
        bookId: book.id, 
        createdBy: req.user.id, 
        title: book.title 
      });

      res.status(201).json({
        status: 'success',
        message: 'Book created successfully',
        data: {
          book
        }
      });
    } catch (error) {
      logger.error('Create book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create book',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update book (librarian/admin only)
  static async updateBook(req, res) {
    try {
      const { id } = req.params;
      const bookId = parseInt(id);

      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      // If ISBN is being updated, check for duplicates
      if (req.body.isbn && req.body.isbn !== book.isbn) {
        const existingBook = await Book.findByIsbn(req.body.isbn);
        if (existingBook && existingBook.id !== bookId) {
          return res.status(400).json({
            status: 'error',
            message: 'Book with this ISBN already exists'
          });
        }
      }

      const updatedBook = await book.update(req.body);

      logger.info('Book updated:', { 
        bookId: bookId, 
        updatedBy: req.user.id, 
        updates: Object.keys(req.body) 
      });

      res.json({
        status: 'success',
        message: 'Book updated successfully',
        data: {
          book: updatedBook
        }
      });
    } catch (error) {
      logger.error('Update book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update book'
      });
    }
  }

  // Delete book (soft delete - librarian/admin only)
  static async deleteBook(req, res) {
    try {
      const { id } = req.params;
      const bookId = parseInt(id);

      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      await book.delete();

      logger.info('Book deleted:', { 
        bookId: bookId, 
        deletedBy: req.user.id 
      });

      res.json({
        status: 'success',
        message: 'Book deleted successfully'
      });
    } catch (error) {
      logger.error('Delete book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete book'
      });
    }
  }

  // Restore deleted book (librarian/admin only)
  static async restoreBook(req, res) {
    try {
      const { id } = req.params;
      const bookId = parseInt(id);

      // Need to query directly to get soft-deleted books
      const { query } = require('../config/database');
      const result = await query('SELECT * FROM books WHERE id = $1', [bookId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      const book = new Book(result.rows[0]);
      
      if (book.is_active) {
        return res.status(400).json({
          status: 'error',
          message: 'Book is already active'
        });
      }

      await book.restore();

      logger.info('Book restored:', { 
        bookId: bookId, 
        restoredBy: req.user.id 
      });

      res.json({
        status: 'success',
        message: 'Book restored successfully'
      });
    } catch (error) {
      logger.error('Restore book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to restore book'
      });
    }
  }

  // Get popular books
  static async getPopularBooks(req, res) {
    try {
      const { limit = 10 } = req.query;

      const books = await Book.getPopular(parseInt(limit));

      res.json({
        status: 'success',
        data: {
          books
        }
      });
    } catch (error) {
      logger.error('Get popular books error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve popular books'
      });
    }
  }

  // Get recently added books
  static async getRecentBooks(req, res) {
    try {
      const { limit = 10 } = req.query;

      const books = await Book.getRecentlyAdded(parseInt(limit));

      res.json({
        status: 'success',
        data: {
          books
        }
      });
    } catch (error) {
      logger.error('Get recent books error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve recent books'
      });
    }
  }

  // Get book borrowing statistics (librarian/admin only)
  static async getBookStats(req, res) {
    try {
      const { id } = req.params;
      const bookId = parseInt(id);

      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      const stats = await book.getBorrowingStats();
      const currentBorrowers = await book.getCurrentBorrowers();

      res.json({
        status: 'success',
        data: {
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            total_copies: book.total_copies,
            available_copies: book.available_copies
          },
          statistics: stats,
          current_borrowers: currentBorrowers
        }
      });
    } catch (error) {
      logger.error('Get book stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve book statistics'
      });
    }
  }

  // Check book availability
  static async checkAvailability(req, res) {
    try {
      const { id } = req.params;
      const bookId = parseInt(id);

      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      const isAvailable = await book.isAvailable();

      res.json({
        status: 'success',
        data: {
          book_id: book.id,
          title: book.title,
          total_copies: book.total_copies,
          available_copies: book.available_copies,
          is_available: isAvailable
        }
      });
    } catch (error) {
      logger.error('Check availability error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check book availability'
      });
    }
  }

  // Update book copies (librarian/admin only)
  static async updateCopies(req, res) {
    try {
      const { id } = req.params;
      const { total_copies } = req.body;

      if (!total_copies || total_copies < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid total_copies value is required'
        });
      }

      const bookId = parseInt(id);
      const book = await Book.findById(bookId);
      
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      const updatedBook = await book.update({ total_copies });

      logger.info('Book copies updated:', { 
        bookId: bookId, 
        updatedBy: req.user.id,
        oldCopies: book.total_copies,
        newCopies: total_copies
      });

      res.json({
        status: 'success',
        message: 'Book copies updated successfully',
        data: {
          book: updatedBook
        }
      });
    } catch (error) {
      logger.error('Update copies error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update book copies'
      });
    }
  }
}

module.exports = BookController;