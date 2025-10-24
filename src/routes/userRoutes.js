const express = require('express');
const UserController = require('../controllers/userController');
const { requireRole, requireSelfOrAdmin } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

const router = express.Router();

// Get all users (admin/librarian only)
router.get('/', requireRole(['admin', 'librarian']), UserController.getUsers);

// Create new user (admin only)
router.post('/', requireRole(['admin']), validate(userSchemas.register), UserController.createUser);

// Get user statistics (admin/librarian only)
router.get('/stats', requireRole(['admin', 'librarian']), UserController.getUserStats);

// Get online users count (admin/librarian only)
router.get('/online', requireRole(['admin', 'librarian']), UserController.getOnlineUsers);

// Export users (admin/librarian only)
router.get('/export', requireRole(['admin', 'librarian']), UserController.exportUsers);

// Bulk update users (admin only)
router.put('/bulk-update', requireRole(['admin']), UserController.bulkUpdateUsers);

// Get user by ID (admin/librarian or self)
router.get('/:id', requireSelfOrAdmin, UserController.getUserById);

// Update user (admin/librarian or self)
router.put('/:id', requireSelfOrAdmin, validate(userSchemas.update), UserController.updateUser);

// Update user status (admin/librarian only)
router.put('/:id/status', requireRole(['admin', 'librarian']), UserController.updateUserStatus);

// Deactivate user (admin/librarian only, not self)
router.put('/:id/deactivate', requireRole(['admin', 'librarian']), UserController.deactivateUser);

// Activate user (admin/librarian only)
router.put('/:id/activate', requireRole(['admin', 'librarian']), UserController.activateUser);

// Reset user password (admin only)
router.put('/:id/reset-password', requireRole(['admin']), UserController.resetUserPassword);

// Get user activity (admin/librarian or self)
router.get('/:id/activity', requireSelfOrAdmin, UserController.getUserActivity);

// Get user's borrow history (admin/librarian or self)
router.get('/:id/borrow-history', requireSelfOrAdmin, UserController.getUserBorrowHistory);

module.exports = router;