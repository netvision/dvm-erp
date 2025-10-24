const express = require('express');
const MediaController = require('../controllers/mediaController');
const { requireRole, authenticateToken } = require('../middleware/auth');
const { validate, mediaSchemas } = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required for browsing media)
router.get('/', MediaController.getMedia);
router.get('/popular', MediaController.getPopularMedia);
router.get('/recent', MediaController.getRecentMedia);

// Routes that require authentication
router.get('/:id', authenticateToken, MediaController.getMediaById);
router.get('/:id/availability', authenticateToken, MediaController.checkAvailability);
router.post('/:id/access', authenticateToken, MediaController.accessMedia);

// Get media by type
router.get('/type/:type', MediaController.getMediaByType);

// Routes that require librarian/admin privileges
router.post('/', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  validate(mediaSchemas.create), 
  MediaController.createMedia
);

router.put('/:id', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  validate(mediaSchemas.update), 
  MediaController.updateMedia
);

router.delete('/:id', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  MediaController.deleteMedia
);

router.put('/:id/restore', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  MediaController.restoreMedia
);

router.get('/:id/stats', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  MediaController.getAccessStats
);

router.put('/:id/copies', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  MediaController.updateCopies
);

router.get('/stats/overview', 
  authenticateToken, 
  requireRole(['librarian', 'admin']), 
  MediaController.getMediaStats
);

module.exports = router;