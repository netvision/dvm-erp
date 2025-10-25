const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const setupRoutes = require('./routes/setup');

// Import enhanced library routes
const enhancedLibraryRoutes = require('./routes/enhancedLibrary');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "data:", "blob:", "https:"], // Allow media from HTTPS sources too
      connectSrc: ["'self'", "https:"], // Allow connections to HTTPS APIs
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "https:", "data:"], // Allow iframes from HTTPS sources
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin requests for media
}));
// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads with media-friendly headers
app.use('/uploads', (req, res, next) => {
  // Set headers to support video playback and downloads
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', authenticateToken, borrowRoutes);
app.use('/api/bookmarks', authenticateToken, bookmarkRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/resources', authenticateToken, require('./routes/resourceRoutes'));
app.use('/api/setup', setupRoutes);

// Enhanced library management routes
app.use('/api/library', enhancedLibraryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = app;