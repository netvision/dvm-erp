const express = require('express');
const BookController = require('../controllers/bookController');
const { requireRole, authenticateToken } = require('../middleware/auth');
const { validate, bookSchemas } = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required for browsing books)
router.get('/', BookController.getBooks);
router.get('/popular', BookController.getPopularBooks);
router.get('/recent', BookController.getRecentBooks);

// Routes that require authentication
router.get('/:id', authenticateToken, BookController.getBookById);
router.get('/:id/availability', authenticateToken, BookController.checkAvailability);

// Routes that require librarian/admin privileges
router.post('/', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  validate(bookSchemas.create), 
  BookController.createBook
);

router.put('/:id', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  validate(bookSchemas.update), 
  BookController.updateBook
);

router.delete('/:id', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  BookController.deleteBook
);

router.put('/:id/restore', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  BookController.restoreBook
);

router.get('/:id/stats', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  BookController.getBookStats
);

router.put('/:id/copies', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  BookController.updateCopies
);

module.exports = router;