const Bookmark = require('../models/Bookmark');
const Book = require('../models/Book');
const logger = require('../utils/logger');

class BookmarkController {
  // Create bookmark
  static async createBookmark(req, res) {
    try {
      const { book_id, notes } = req.body;
      const userId = req.user.id;

      // Check if book exists
      const book = await Book.findById(book_id);
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      const bookmark = await Bookmark.create(userId, book_id, notes);

      logger.info('Bookmark created:', { 
        bookmarkId: bookmark.id,
        userId: userId,
        bookId: book_id
      });

      res.status(201).json({
        status: 'success',
        message: 'Bookmark created successfully',
        data: {
          bookmark
        }
      });
    } catch (error) {
      if (error.message === 'Bookmark already exists for this book') {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }

      logger.error('Create bookmark error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create bookmark'
      });
    }
  }

  // Get user's bookmarks
  static async getUserBookmarks(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sort_by,
        sort_order
      } = req.query;

      const userId = req.user.id;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sort_by,
        sort_order
      };

      const result = await Bookmark.findByUser(userId, options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Get user bookmarks error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve bookmarks'
      });
    }
  }

  // Get all bookmarks (admin/librarian only)
  static async getAllBookmarks(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        user_id,
        book_id,
        search,
        sort_by,
        sort_order
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sort_by,
        sort_order
      };

      if (user_id) options.user_id = parseInt(user_id);
      if (book_id) options.book_id = parseInt(book_id);

      const result = await Bookmark.findAll(options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Get all bookmarks error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve bookmarks'
      });
    }
  }

  // Get bookmark by ID
  static async getBookmarkById(req, res) {
    try {
      const { id } = req.params;

      const bookmark = await Bookmark.findById(parseInt(id));
      if (!bookmark) {
        return res.status(404).json({
          status: 'error',
          message: 'Bookmark not found'
        });
      }

      // Check permissions
      if (bookmark.user_id !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to view this bookmark'
        });
      }

      res.json({
        status: 'success',
        data: {
          bookmark
        }
      });
    } catch (error) {
      logger.error('Get bookmark by ID error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve bookmark'
      });
    }
  }

  // Update bookmark notes
  static async updateBookmark(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const bookmark = await Bookmark.findById(parseInt(id));
      if (!bookmark) {
        return res.status(404).json({
          status: 'error',
          message: 'Bookmark not found'
        });
      }

      // Check permissions
      if (bookmark.user_id !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this bookmark'
        });
      }

      const updatedBookmark = await bookmark.updateNotes(notes);

      logger.info('Bookmark updated:', { 
        bookmarkId: bookmark.id,
        userId: req.user.id
      });

      res.json({
        status: 'success',
        message: 'Bookmark updated successfully',
        data: {
          bookmark: updatedBookmark
        }
      });
    } catch (error) {
      logger.error('Update bookmark error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update bookmark'
      });
    }
  }

  // Delete bookmark
  static async deleteBookmark(req, res) {
    try {
      const { id } = req.params;

      const bookmark = await Bookmark.findById(parseInt(id));
      if (!bookmark) {
        return res.status(404).json({
          status: 'error',
          message: 'Bookmark not found'
        });
      }

      // Check permissions
      if (bookmark.user_id !== req.user.id && !['admin', 'librarian'].includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete this bookmark'
        });
      }

      await bookmark.delete();

      logger.info('Bookmark deleted:', { 
        bookmarkId: bookmark.id,
        userId: req.user.id
      });

      res.json({
        status: 'success',
        message: 'Bookmark deleted successfully'
      });
    } catch (error) {
      logger.error('Delete bookmark error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete bookmark'
      });
    }
  }

  // Check if book is bookmarked by user
  static async checkBookmark(req, res) {
    try {
      const { book_id } = req.params;
      const userId = req.user.id;

      const isBookmarked = await Bookmark.isBookmarked(userId, parseInt(book_id));

      res.json({
        status: 'success',
        data: {
          book_id: parseInt(book_id),
          user_id: userId,
          is_bookmarked: isBookmarked
        }
      });
    } catch (error) {
      logger.error('Check bookmark error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check bookmark status'
      });
    }
  }

  // Get most bookmarked books
  static async getMostBookmarked(req, res) {
    try {
      const { limit = 10 } = req.query;

      const books = await Bookmark.getMostBookmarked(parseInt(limit));

      res.json({
        status: 'success',
        data: {
          books
        }
      });
    } catch (error) {
      logger.error('Get most bookmarked error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve most bookmarked books'
      });
    }
  }

  // Get recently bookmarked books (admin/librarian only)
  static async getRecentlyBookmarked(req, res) {
    try {
      const { limit = 10 } = req.query;

      const bookmarks = await Bookmark.getRecentlyBookmarked(parseInt(limit));

      res.json({
        status: 'success',
        data: {
          recent_bookmarks: bookmarks
        }
      });
    } catch (error) {
      logger.error('Get recently bookmarked error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve recently bookmarked books'
      });
    }
  }

  // Get bookmark statistics (admin/librarian only)
  static async getBookmarkStats(req, res) {
    try {
      const { user_id, start_date, end_date } = req.query;

      const options = {};
      if (user_id) options.user_id = parseInt(user_id);
      if (start_date) options.start_date = start_date;
      if (end_date) options.end_date = end_date;

      const stats = await Bookmark.getStats(options);

      res.json({
        status: 'success',
        data: {
          statistics: stats
        }
      });
    } catch (error) {
      logger.error('Get bookmark stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve bookmark statistics'
      });
    }
  }

  // Get user's bookmark count
  static async getUserBookmarkCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await Bookmark.getUserBookmarkCount(userId);

      res.json({
        status: 'success',
        data: {
          user_id: userId,
          bookmark_count: count
        }
      });
    } catch (error) {
      logger.error('Get user bookmark count error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve bookmark count'
      });
    }
  }

  // Toggle bookmark (create if doesn't exist, delete if exists)
  static async toggleBookmark(req, res) {
    try {
      const { book_id } = req.body;
      const userId = req.user.id;

      // Check if book exists
      const book = await Book.findById(book_id);
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      // Check if bookmark already exists
      const existingBookmark = await Bookmark.findByUserAndBook(userId, book_id);
      
      if (existingBookmark) {
        // Delete existing bookmark
        await existingBookmark.delete();
        
        logger.info('Bookmark removed:', { 
          bookmarkId: existingBookmark.id,
          userId: userId,
          bookId: book_id
        });

        res.json({
          status: 'success',
          message: 'Bookmark removed successfully',
          data: {
            action: 'removed',
            book_id: book_id
          }
        });
      } else {
        // Create new bookmark
        const bookmark = await Bookmark.create(userId, book_id);
        
        logger.info('Bookmark added:', { 
          bookmarkId: bookmark.id,
          userId: userId,
          bookId: book_id
        });

        res.status(201).json({
          status: 'success',
          message: 'Bookmark added successfully',
          data: {
            action: 'added',
            bookmark
          }
        });
      }
    } catch (error) {
      logger.error('Toggle bookmark error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to toggle bookmark'
      });
    }
  }
}

module.exports = BookmarkController;