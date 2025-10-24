const express = require('express');
const BorrowController = require('../controllers/borrowController');
const { requireRole } = require('../middleware/auth');
const { validate, borrowSchemas } = require('../middleware/validation');

const router = express.Router();

// User routes
router.post('/', validate(borrowSchemas.borrow), BorrowController.borrowBook);
router.get('/current', BorrowController.getCurrentBorrows);
router.get('/records', BorrowController.getBorrowRecords);
router.get('/records/:id', BorrowController.getBorrowRecordById);
router.put('/return/:id', validate(borrowSchemas.return), BorrowController.returnBook);
router.put('/renew/:id', BorrowController.renewBook);

// Admin/Librarian routes
router.get('/overdue', requireRole(['admin', 'librarian']), BorrowController.getOverdueBooks);
router.put('/update-overdue', requireRole(['admin', 'librarian']), BorrowController.updateOverdueStatuses);
router.put('/lost/:id', requireRole(['admin', 'librarian']), BorrowController.markAsLost);
router.get('/stats', requireRole(['admin', 'librarian']), BorrowController.getBorrowingStats);

module.exports = router;