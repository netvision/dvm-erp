// Enhanced Library Management API Routes
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const digitalResourceController = require('../controllers/digitalResourceController');
const mediaResourceController = require('../controllers/mediaResourceController');
const equipmentController = require('../controllers/equipmentController');
const collectionController = require('../controllers/collectionController');
const aiController = require('../controllers/aiController');
const analyticsController = require('../controllers/analyticsController');
const fineController = require('../controllers/fineController');
const reservationController = require('../controllers/reservationController');
const waitlistController = require('../controllers/waitlistController');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for media files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(pdf|doc|docx|txt|epub|mobi|mp3|wav|mp4|avi|mov|jpg|jpeg|png|gif)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a supported file format.'));
    }
  }
});

// General Upload Endpoint
router.post('/upload', authenticateToken, requireRole(['admin', 'librarian']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type, title, category } = req.body;
    const file = req.file;
    
    // Generate file URL (you may want to store files in a proper file storage service)
    const fileUrl = `/uploads/${file.filename}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file_url: fileUrl,
      url: fileUrl,
      file_path: file.path,
      original_name: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Digital Resources Routes
router.get('/digital-resources', authenticateToken, digitalResourceController.getAll);
router.get('/digital-resources/search', authenticateToken, digitalResourceController.search);
router.get('/digital-resources/:id', authenticateToken, digitalResourceController.getById);
router.get('/digital-resources/:id/download', authenticateToken, digitalResourceController.download);
router.get('/digital-resources/:id/view', authenticateToken, digitalResourceController.view);
router.post('/digital-resources/:id/track-view', authenticateToken, digitalResourceController.trackView);
router.post('/digital-resources/:id/track-download', authenticateToken, digitalResourceController.trackDownload);
router.post('/digital-resources', authenticateToken, requireRole(['admin', 'librarian']), digitalResourceController.create);
router.post('/digital-resources/upload', authenticateToken, requireRole(['admin', 'librarian']), upload.single('file'), digitalResourceController.upload);
router.put('/digital-resources/:id', authenticateToken, requireRole(['admin', 'librarian']), digitalResourceController.update);
router.delete('/digital-resources/:id', authenticateToken, requireRole(['admin', 'librarian']), digitalResourceController.delete);
router.post('/digital-resources/:id/bookmark', authenticateToken, digitalResourceController.addBookmark);
router.post('/digital-resources/:id/annotate', authenticateToken, digitalResourceController.addAnnotation);
router.get('/digital-resources/:id/annotations', authenticateToken, digitalResourceController.getAnnotations);

// Media Resources Routes
router.get('/media-resources', authenticateToken, mediaResourceController.getAll);
router.get('/media-resources/search', authenticateToken, mediaResourceController.search);
router.get('/media-resources/:id', authenticateToken, mediaResourceController.getById);
router.get('/media-resources/:id/stream', authenticateToken, mediaResourceController.stream);
router.post('/media-resources', authenticateToken, requireRole(['admin', 'librarian']), mediaResourceController.create);
router.put('/media-resources/:id', authenticateToken, requireRole(['admin', 'librarian']), mediaResourceController.update);
router.delete('/media-resources/:id', authenticateToken, requireRole(['admin', 'librarian']), mediaResourceController.delete);
router.post('/media-resources/:id/progress', authenticateToken, mediaResourceController.updateProgress);
router.get('/media-resources/:id/progress', authenticateToken, mediaResourceController.getProgress);
router.post('/media-resources/:id/like', authenticateToken, mediaResourceController.toggleLike);

// Equipment Routes
router.get('/equipment', authenticateToken, equipmentController.getAll);
router.get('/equipment/:id', authenticateToken, equipmentController.getById);
router.post('/equipment', authenticateToken, requireRole(['admin', 'librarian']), equipmentController.create);
router.put('/equipment/:id', authenticateToken, requireRole(['admin', 'librarian']), equipmentController.update);
router.delete('/equipment/:id', authenticateToken, requireRole(['admin', 'librarian']), equipmentController.delete);

// Collection Management Routes
router.get('/collections', authenticateToken, collectionController.getAll);
router.get('/collections/:id', authenticateToken, collectionController.getById);
router.post('/collections', authenticateToken, collectionController.create);
router.put('/collections/:id', authenticateToken, collectionController.update);
router.delete('/collections/:id', authenticateToken, collectionController.delete);
router.post('/collections/:id/items', authenticateToken, collectionController.addItem);
router.delete('/collections/:id/items/:itemId', authenticateToken, collectionController.removeItem);
router.put('/collections/:id/items/reorder', authenticateToken, collectionController.reorderItems);

// AI-Powered Features Routes
router.post('/ai/search', authenticateToken, aiController.intelligentSearch);
router.post('/ai/recommend', authenticateToken, aiController.getRecommendations);
router.post('/ai/chat', authenticateToken, aiController.chatAssistant);
router.post('/ai/summarize', authenticateToken, aiController.summarizeContent);
router.post('/ai/translate', authenticateToken, aiController.translateContent);
router.get('/ai/trending', authenticateToken, aiController.getTrendingContent);
router.post('/ai/feedback', authenticateToken, aiController.submitFeedback);

// Advanced Search Routes
router.get('/search/unified', authenticateToken, (req, res) => {
    // Unified search across all resource types
    const { query, type, filters, sort, page = 1, limit = 20 } = req.query;
    // Implementation will search books, digital resources, and media
    res.json({ message: 'Unified search endpoint' });
});

router.get('/search/faceted', authenticateToken, (req, res) => {
    // Faceted search with filters
    res.json({ message: 'Faceted search with filters' });
});

router.get('/search/suggestions', authenticateToken, (req, res) => {
    // Auto-complete suggestions
    res.json({ message: 'Search suggestions' });
});

// Analytics and Reporting Routes
router.get('/analytics/dashboard', authenticateToken, requireRole(['admin', 'librarian']), analyticsController.getDashboard);
router.get('/analytics/usage', authenticateToken, requireRole(['admin', 'librarian']), analyticsController.getUsageStats);
router.get('/analytics/popular', authenticateToken, analyticsController.getPopularContent);
router.get('/analytics/user-activity', authenticateToken, requireRole(['admin', 'librarian']), analyticsController.getUserActivity);
router.get('/analytics/search-trends', authenticateToken, requireRole(['admin', 'librarian']), analyticsController.getSearchTrends);
router.get('/analytics/inventory', authenticateToken, requireRole(['admin', 'librarian']), analyticsController.getInventoryStats);

// Fine Management Routes
router.get('/fines', authenticateToken, fineController.getUserFines);
router.get('/fines/all', authenticateToken, requireRole(['admin', 'librarian']), fineController.getAllFines);
router.post('/fines', authenticateToken, requireRole(['admin', 'librarian']), fineController.createFine);
router.put('/fines/:id', authenticateToken, requireRole(['admin', 'librarian']), fineController.updateFine);
router.post('/fines/:id/pay', authenticateToken, fineController.payFine);
router.post('/fines/:id/waive', authenticateToken, requireRole(['admin', 'librarian']), fineController.waiveFine);
router.get('/fines/summary', authenticateToken, fineController.getFineSummary);

// Reservation Management Routes
router.get('/reservations', authenticateToken, reservationController.getUserReservations);
router.get('/reservations/all', authenticateToken, requireRole(['admin', 'librarian']), reservationController.getAllReservations);
router.post('/reservations', authenticateToken, reservationController.createReservation);
router.put('/reservations/:id', authenticateToken, reservationController.updateReservation);
router.delete('/reservations/:id', authenticateToken, reservationController.cancelReservation);
router.post('/reservations/:id/fulfill', authenticateToken, requireRole(['admin', 'librarian']), reservationController.fulfillReservation);

// Waitlist Management Routes
router.get('/waitlists', authenticateToken, waitlistController.getUserWaitlists);
router.get('/waitlists/all', authenticateToken, requireRole(['admin', 'librarian']), waitlistController.getAllWaitlists);
router.post('/waitlists', authenticateToken, waitlistController.joinWaitlist);
router.delete('/waitlists/:id', authenticateToken, waitlistController.leaveWaitlist);
router.post('/waitlists/:id/notify', authenticateToken, requireRole(['admin', 'librarian']), waitlistController.notifyNext);

// Reading Progress and Bookmarks Routes
router.get('/reading-progress', authenticateToken, (req, res) => {
    res.json({ message: 'Get user reading progress' });
});

router.put('/reading-progress/:resourceType/:resourceId', authenticateToken, (req, res) => {
    res.json({ message: 'Update reading progress' });
});

router.get('/bookmarks', authenticateToken, (req, res) => {
    res.json({ message: 'Get user bookmarks' });
});

router.post('/bookmarks', authenticateToken, (req, res) => {
    res.json({ message: 'Create bookmark' });
});

router.delete('/bookmarks/:id', authenticateToken, (req, res) => {
    res.json({ message: 'Delete bookmark' });
});

// Reviews and Ratings Routes
router.get('/reviews/:resourceType/:resourceId', authenticateToken, (req, res) => {
    res.json({ message: 'Get resource reviews' });
});

router.post('/reviews', authenticateToken, (req, res) => {
    res.json({ message: 'Create review' });
});

router.put('/reviews/:id', authenticateToken, (req, res) => {
    res.json({ message: 'Update review' });
});

router.delete('/reviews/:id', authenticateToken, (req, res) => {
    res.json({ message: 'Delete review' });
});

router.post('/reviews/:id/helpful', authenticateToken, (req, res) => {
    res.json({ message: 'Mark review as helpful' });
});

// Notification Management Routes
router.get('/notifications', authenticateToken, (req, res) => {
    res.json({ message: 'Get user notifications' });
});

router.put('/notifications/:id/read', authenticateToken, (req, res) => {
    res.json({ message: 'Mark notification as read' });
});

router.put('/notifications/preferences', authenticateToken, (req, res) => {
    res.json({ message: 'Update notification preferences' });
});

// Inventory and Audit Routes
router.get('/inventory/audit', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'Get inventory audit data' });
});

router.post('/inventory/audit', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'Create inventory audit' });
});

router.put('/inventory/audit/:id', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'Update inventory audit' });
});

// Advanced Features Routes
router.get('/reports/circulation', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'Circulation reports' });
});

router.get('/reports/overdue', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'Overdue items report' });
});

router.get('/reports/popular-items', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'Popular items report' });
});

router.get('/reports/user-statistics', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'User statistics report' });
});

// RFID and Barcode Routes
router.post('/scan/barcode', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'Process barcode scan' });
});

router.post('/scan/rfid', authenticateToken, requireRole(['admin', 'librarian']), (req, res) => {
    res.json({ message: 'Process RFID scan' });
});

router.post('/checkout/self-service', authenticateToken, (req, res) => {
    res.json({ message: 'Self-service checkout' });
});

router.post('/return/self-service', authenticateToken, (req, res) => {
    res.json({ message: 'Self-service return' });
});

module.exports = router;