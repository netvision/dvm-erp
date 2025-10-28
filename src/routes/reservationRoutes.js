const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservationController');
const { authenticate } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');

// All routes require authentication
router.use(authenticate);

// Student routes - can create, view own, and cancel own reservations
router.post('/', ReservationController.createReservation);
router.get('/my-reservations', ReservationController.getUserReservations);
router.get('/:id', ReservationController.getReservationById);
router.delete('/:id/cancel', ReservationController.cancelReservation);

// Admin/Librarian routes - manage all reservations
router.get(
  '/all',
  authorizeRoles('admin', 'librarian'),
  ReservationController.getAllReservations
);

router.get(
  '/book/:bookId/queue',
  authorizeRoles('admin', 'librarian'),
  ReservationController.getBookReservationQueue
);

router.patch(
  '/:id/fulfill',
  authorizeRoles('admin', 'librarian'),
  ReservationController.fulfillReservation
);

router.get(
  '/stats/overview',
  authorizeRoles('admin', 'librarian'),
  ReservationController.getStats
);

router.post(
  '/expire-old',
  authorizeRoles('admin', 'librarian'),
  ReservationController.expireOldReservations
);

module.exports = router;
