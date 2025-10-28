const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const User = require('../models/User');
const logger = require('../utils/logger');

class ReservationController {
  // Create a new reservation
  static async createReservation(req, res) {
    try {
      const { book_id, notes } = req.body;
      const userId = req.user.id;

      // Check if user can make more reservations
      const canReserve = await Reservation.canUserReserve(userId);
      if (!canReserve) {
        return res.status(400).json({
          status: 'error',
          message: 'Maximum number of active reservations reached'
        });
      }

      // Check if book exists
      const book = await Book.findById(book_id);
      if (!book) {
        return res.status(404).json({
          status: 'error',
          message: 'Book not found'
        });
      }

      // Check if book is currently available (if so, suggest borrowing directly)
      if (book.available_copies > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'This book is currently available. Please borrow it directly instead of making a reservation.'
        });
      }

      // Create reservation
      const reservation = await Reservation.create(userId, book_id, notes);

      logger.info('Reservation created:', { 
        reservationId: reservation.id,
        userId: userId,
        bookId: book_id
      });

      res.status(201).json({
        status: 'success',
        message: 'Book reserved successfully. You will be notified when it becomes available.',
        data: {
          reservation
        }
      });
    } catch (error) {
      logger.error('Create reservation error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to create reservation'
      });
    }
  }

  // Get all reservations (admin/librarian only)
  static async getAllReservations(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        user_id,
        book_id,
        status,
        sort_by,
        sort_order
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        user_id: user_id ? parseInt(user_id) : undefined,
        book_id: book_id ? parseInt(book_id) : undefined,
        status,
        sort_by,
        sort_order
      };

      const result = await Reservation.findAll(options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Get all reservations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve reservations'
      });
    }
  }

  // Get user's own reservations
  static async getUserReservations(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        user_id: userId,
        status
      };

      const result = await Reservation.findAll(options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Get user reservations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve your reservations'
      });
    }
  }

  // Get reservation by ID
  static async getReservationById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await Reservation.findById(parseInt(id));

      if (!reservation) {
        return res.status(404).json({
          status: 'error',
          message: 'Reservation not found'
        });
      }

      // Check authorization: user can only view their own reservations unless admin/librarian
      if (
        req.user.id !== reservation.user_id &&
        !['admin', 'librarian'].includes(req.user.role)
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to view this reservation'
        });
      }

      res.json({
        status: 'success',
        data: {
          reservation
        }
      });
    } catch (error) {
      logger.error('Get reservation by ID error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve reservation'
      });
    }
  }

  // Get reservation queue for a book (admin/librarian only)
  static async getBookReservationQueue(req, res) {
    try {
      const { bookId } = req.params;
      const queue = await Reservation.getBookReservationQueue(parseInt(bookId));

      res.json({
        status: 'success',
        data: {
          queue,
          count: queue.length
        }
      });
    } catch (error) {
      logger.error('Get book reservation queue error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve reservation queue'
      });
    }
  }

  // Fulfill a reservation (admin/librarian only)
  static async fulfillReservation(req, res) {
    try {
      const { id } = req.params;
      
      const reservation = await Reservation.findById(parseInt(id));
      if (!reservation) {
        return res.status(404).json({
          status: 'error',
          message: 'Reservation not found'
        });
      }

      if (reservation.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Only pending reservations can be fulfilled'
        });
      }

      // Check if book is available
      const book = await Book.findById(reservation.book_id);
      if (!book || book.available_copies < 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Book is not currently available'
        });
      }

      // Fulfill the reservation
      const fulfilledReservation = await Reservation.fulfill(parseInt(id));

      logger.info('Reservation fulfilled:', { 
        reservationId: id,
        userId: reservation.user_id,
        bookId: reservation.book_id
      });

      res.json({
        status: 'success',
        message: 'Reservation fulfilled successfully',
        data: {
          reservation: fulfilledReservation
        }
      });
    } catch (error) {
      logger.error('Fulfill reservation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fulfill reservation'
      });
    }
  }

  // Cancel a reservation
  static async cancelReservation(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const reservation = await Reservation.findById(parseInt(id));
      if (!reservation) {
        return res.status(404).json({
          status: 'error',
          message: 'Reservation not found'
        });
      }

      // Check authorization: user can only cancel their own reservations unless admin/librarian
      if (
        req.user.id !== reservation.user_id &&
        !['admin', 'librarian'].includes(req.user.role)
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You are not authorized to cancel this reservation'
        });
      }

      if (reservation.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'Only pending reservations can be cancelled'
        });
      }

      // Cancel the reservation
      const cancelledReservation = await Reservation.cancel(parseInt(id), reason);

      logger.info('Reservation cancelled:', { 
        reservationId: id,
        userId: req.user.id,
        reason: reason || 'No reason provided'
      });

      res.json({
        status: 'success',
        message: 'Reservation cancelled successfully',
        data: {
          reservation: cancelledReservation
        }
      });
    } catch (error) {
      logger.error('Cancel reservation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to cancel reservation'
      });
    }
  }

  // Get reservation statistics (admin/librarian only)
  static async getStats(req, res) {
    try {
      const stats = await Reservation.getStats();

      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error('Get reservation stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve reservation statistics'
      });
    }
  }

  // Expire old reservations (can be called by cron job)
  static async expireOldReservations(req, res) {
    try {
      const expiredReservations = await Reservation.expireOldReservations();

      logger.info('Old reservations expired:', { 
        count: expiredReservations.length 
      });

      res.json({
        status: 'success',
        message: `${expiredReservations.length} reservations expired`,
        data: {
          count: expiredReservations.length
        }
      });
    } catch (error) {
      logger.error('Expire old reservations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to expire old reservations'
      });
    }
  }
}

module.exports = ReservationController;
