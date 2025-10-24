const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const User = require('../models/User');
const logger = require('../utils/logger');

class BorrowController {
  // Borrow a book
  static async borrowBook(req, res) {
    try {
      const { book_id, due_date } = req.body;
      const userId = req.user.id;

      // Check if user can borrow more books
      const canBorrow = await BorrowRecord.canUserBorrow(userId);
      if (!canBorrow) {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum number of books already borrowed'
        });
      }

      // Check if book exists and is available
      const book = await Book.findById(book_id);
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      const isAvailable = await book.isAvailable();
      if (!isAvailable) {
        return res.status(400).json({
          status: 'error',
          message: 'Book is not available for borrowing'
        });
      }

      // Check if user has already borrowed this book
      const existingBorrow = await BorrowRecord.findActiveBorrow(userId, book_id);
      if (existingBorrow) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already borrowed this book'
        });
      }

      // Create borrow record
      const borrowRecord = await BorrowRecord.create(userId, book_id, due_date);

      // Decrease available copies
      await book.decreaseAvailableCopies(1);

      logger.info('Book borrowed:', { 
        borrowId: borrowRecord.id,
        userId: userId,
        bookId: book_id,
        dueDate: borrowRecord.due_date
      });

      res.status(201).json({
        status: 'success',
        message: 'Book borrowed successfully',
        data: {
          borrow_record: borrowRecord
        }
      });
    } catch (error) {
      logger.error('Borrow book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to borrow book',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Return a book
  static async returnBook(req, res) {
    try {
      const { id } = req.params;
      const { condition_notes } = req.body;
      const userId = req.user.id;

      const borrowRecord = await BorrowRecord.findById(parseInt(id));
      if (!borrowRecord) {
        return res.status(404).json({
          status: 'error',
          message: 'Borrow record not found'
        });
      }

      // Check if the user is the borrower or has admin/librarian privileges
      if (borrowRecord.user_id !== userId && !['admin', 'librarian'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to return this book'
        });
      }

      // Check if book is already returned
      if (borrowRecord.status !== 'borrowed') {
        return res.status(400).json({
          status: 'error',
          message: 'Book is already returned or has different status'
        });
      }

      // Return the book
      const returnedRecord = await borrowRecord.returnBook(condition_notes);

      // Increase available copies
      const book = await Book.findById(borrowRecord.book_id);
      await book.increaseAvailableCopies(1);

      logger.info('Book returned:', { 
        borrowId: returnedRecord.id,
        userId: borrowRecord.user_id,
        bookId: borrowRecord.book_id,
        fineAmount: returnedRecord.fine_amount,
        returnedBy: userId
      });

      res.json({
        status: 'success',
        message: 'Book returned successfully',
        data: {
          borrow_record: returnedRecord,
          fine_amount: returnedRecord.fine_amount
        }
      });
    } catch (error) {
      logger.error('Return book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to return book'
      });
    }
  }

  // Get all borrow records (admin/librarian) or user's own records
  static async getBorrowRecords(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        user_id,
        book_id,
        status,
        overdue_only,
        search
      } = req.query;

      let options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        overdue_only: overdue_only === 'true',
        search
      };

      // Non-admin users can only see their own records
      if (!['admin', 'librarian'].includes(req.user.role)) {
        options.user_id = req.user.id;
      } else if (user_id) {
        options.user_id = parseInt(user_id);
      }

      if (book_id) {
        options.book_id = parseInt(book_id);
      }

      const result = await BorrowRecord.findAll(options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Get borrow records error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve borrow records'
      });
    }
  }

  // Get borrow record by ID
  static async getBorrowRecordById(req, res) {
    try {
      const { id } = req.params;

      const borrowRecord = await BorrowRecord.findById(parseInt(id));
      if (!borrowRecord) {
        return res.status(404).json({
          status: 'error',
          message: 'Borrow record not found'
        });
      }

      // Check permissions
      if (borrowRecord.user_id !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to view this record'
        });
      }

      res.json({
        status: 'success',
        data: {
          borrow_record: borrowRecord
        }
      });
    } catch (error) {
      logger.error('Get borrow record by ID error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve borrow record'
      });
    }
  }

  // Renew a book (extend due date)
  static async renewBook(req, res) {
    try {
      const { id } = req.params;
      const { additional_days = 14 } = req.body;
      const userId = req.user.id;

      const borrowRecord = await BorrowRecord.findById(parseInt(id));
      if (!borrowRecord) {
        return res.status(404).json({
          status: 'error',
          message: 'Borrow record not found'
        });
      }

      // Check if the user is the borrower or has admin/librarian privileges
      if (borrowRecord.user_id !== userId && !['admin', 'librarian'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to renew this book'
        });
      }

      // Check if book can be renewed
      if (borrowRecord.status !== 'borrowed') {
        return res.status(400).json({
          status: 'error',
          message: 'Book cannot be renewed'
        });
      }

      const renewedRecord = await borrowRecord.renew(parseInt(additional_days));

      logger.info('Book renewed:', { 
        borrowId: renewedRecord.id,
        userId: borrowRecord.user_id,
        newDueDate: renewedRecord.due_date,
        renewedBy: userId
      });

      res.json({
        status: 'success',
        message: 'Book renewed successfully',
        data: {
          borrow_record: renewedRecord
        }
      });
    } catch (error) {
      logger.error('Renew book error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to renew book'
      });
    }
  }

  // Mark book as lost (admin/librarian only)
  static async markAsLost(req, res) {
    try {
      const { id } = req.params;

      const borrowRecord = await BorrowRecord.findById(parseInt(id));
      if (!borrowRecord) {
        return res.status(404).json({
          status: 'error',
          message: 'Borrow record not found'
        });
      }

      if (borrowRecord.status !== 'borrowed') {
        return res.status(400).json({
          status: 'error',
          message: 'Book is not currently borrowed'
        });
      }

      const lostRecord = await borrowRecord.markAsLost();

      logger.info('Book marked as lost:', { 
        borrowId: lostRecord.id,
        userId: borrowRecord.user_id,
        bookId: borrowRecord.book_id,
        markedBy: req.user.id
      });

      res.json({
        status: 'success',
        message: 'Book marked as lost',
        data: {
          borrow_record: lostRecord
        }
      });
    } catch (error) {
      logger.error('Mark as lost error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark book as lost'
      });
    }
  }

  // Get overdue books (admin/librarian only)
  static async getOverdueBooks(req, res) {
    try {
      const overdueRecords = await BorrowRecord.getOverdueRecords();

      res.json({
        status: 'success',
        data: {
          overdue_records: overdueRecords,
          count: overdueRecords.length
        }
      });
    } catch (error) {
      logger.error('Get overdue books error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve overdue books'
      });
    }
  }

  // Update overdue statuses (admin/librarian only)
  static async updateOverdueStatuses(req, res) {
    try {
      const updatedCount = await BorrowRecord.updateOverdueStatuses();

      logger.info('Overdue statuses updated:', { 
        updatedCount: updatedCount,
        updatedBy: req.user.id
      });

      res.json({
        status: 'success',
        message: `Updated ${updatedCount} overdue records`,
        data: {
          updated_count: updatedCount
        }
      });
    } catch (error) {
      logger.error('Update overdue statuses error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update overdue statuses'
      });
    }
  }

  // Get borrowing statistics (admin/librarian only)
  static async getBorrowingStats(req, res) {
    try {
      const { start_date, end_date, user_id } = req.query;

      const options = {};
      if (start_date) options.start_date = start_date;
      if (end_date) options.end_date = end_date;
      if (user_id) options.user_id = parseInt(user_id);

      const stats = await BorrowRecord.getStats(options);

      res.json({
        status: 'success',
        data: {
          statistics: stats
        }
      });
    } catch (error) {
      logger.error('Get borrowing stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve borrowing statistics'
      });
    }
  }

  // Get user's current borrows
  static async getCurrentBorrows(req, res) {
    try {
      const userId = req.user.id;
      const currentBorrows = await BorrowRecord.getUserCurrentBorrows(userId);

      res.json({
        status: 'success',
        data: {
          current_borrows: currentBorrows,
          count: currentBorrows.length
        }
      });
    } catch (error) {
      logger.error('Get current borrows error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve current borrows'
      });
    }
  }
}

module.exports = BorrowController;