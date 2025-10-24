const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { query } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token is required'
      });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        logger.warn('Invalid token attempt:', { error: err.message, ip: req.ip });
        return res.status(403).json({
          status: 'error',
          message: 'Invalid or expired token'
        });
      }

      try {
        // Verify user still exists and is active
        const result = await query(
          'SELECT id, email, role, is_active FROM users WHERE id = $1',
          [decoded.userId]
        );

        if (result.rows.length === 0) {
          return res.status(403).json({
            status: 'error',
            message: 'User not found'
          });
        }

        const user = result.rows[0];
        
        if (!user.is_active) {
          return res.status(403).json({
            status: 'error',
            message: 'Account is deactivated'
          });
        }

        req.user = user;
        next();
      } catch (dbError) {
        logger.error('Database error in auth middleware:', dbError);
        return res.status(500).json({
          status: 'error',
          message: 'Internal server error'
        });
      }
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user can access resource (self or admin)
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  const targetUserId = parseInt(req.params.userId || req.params.id);
  const isAdmin = req.user.role === 'admin' || req.user.role === 'librarian';
  const isSelf = req.user.id === targetUserId;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied'
    });
  }

  next();
};

module.exports = {
  generateToken,
  authenticateToken,
  requireRole,
  requireSelfOrAdmin
};