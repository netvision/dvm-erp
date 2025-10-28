const logger = require('../utils/logger');

/**
 * Authorization middleware to check if user has required roles
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'librarian')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      logger.warn('Authorization attempt without authentication');
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt:', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this resource'
      });
    }

    // User has required role, proceed
    next();
  };
};

/**
 * Check if user can access their own resource or is admin/librarian
 */
const authorizeSelfOrStaff = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const targetUserId = parseInt(req.params[userIdParam] || req.body[userIdParam]);
    const isOwnResource = req.user.id === targetUserId;
    const isStaff = ['admin', 'librarian'].includes(req.user.role);

    if (!isOwnResource && !isStaff) {
      logger.warn('Unauthorized resource access attempt:', {
        userId: req.user.id,
        targetUserId,
        path: req.path
      });
      
      return res.status(403).json({
        status: 'error',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

/**
 * Check if user is admin only
 */
const authorizeAdmin = authorizeRoles('admin');

/**
 * Check if user is admin or librarian
 */
const authorizeStaff = authorizeRoles('admin', 'librarian');

module.exports = {
  authorizeRoles,
  authorizeSelfOrStaff,
  authorizeAdmin,
  authorizeStaff
};
