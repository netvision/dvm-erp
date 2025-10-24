const express = require('express');
const BookmarkController = require('../controllers/bookmarkController');
const { requireRole } = require('../middleware/auth');
const { validate, bookmarkSchemas } = require('../middleware/validation');

const router = express.Router();

// User routes
router.post('/', validate(bookmarkSchemas.create), BookmarkController.createBookmark);
router.get('/my', BookmarkController.getUserBookmarks);
router.get('/count', BookmarkController.getUserBookmarkCount);
router.post('/toggle', BookmarkController.toggleBookmark);
router.get('/check/:book_id', BookmarkController.checkBookmark);

// Public routes
router.get('/popular', BookmarkController.getMostBookmarked);

// Individual bookmark routes
router.get('/:id', BookmarkController.getBookmarkById);
router.put('/:id', validate(bookmarkSchemas.update), BookmarkController.updateBookmark);
router.delete('/:id', BookmarkController.deleteBookmark);

// Admin/Librarian routes
router.get('/', requireRole(['admin', 'librarian']), BookmarkController.getAllBookmarks);
router.get('/recent', requireRole(['admin', 'librarian']), BookmarkController.getRecentlyBookmarked);
router.get('/stats', requireRole(['admin', 'librarian']), BookmarkController.getBookmarkStats);

module.exports = router;