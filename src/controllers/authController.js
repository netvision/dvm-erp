const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        role,
        phone,
        address,
        student_id,
        faculty_id,
        grade_level,
        department
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        role,
        phone,
        address,
        student_id,
        faculty_id,
        grade_level,
        department
      });

      // Generate JWT token
      const token = generateToken({ userId: user.id, role: user.role });

      logger.info('New user registered:', { userId: user.id, email: user.email, role: user.role });

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        logger.warn('Login attempt with non-existent email:', { email, ip: req.ip });
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        logger.warn('Login attempt with deactivated account:', { email, ip: req.ip });
        return res.status(401).json({
          status: 'error',
          message: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        logger.warn('Invalid password attempt:', { email, ip: req.ip });
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = generateToken({ userId: user.id, role: user.role });

      // TODO: Update last login timestamp when database column is available
      // await user.updateLastLogin();

      logger.info('User logged in:', { userId: user.id, email: user.email, ip: req.ip });

      res.json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve profile'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const allowedUpdates = ['first_name', 'last_name', 'phone', 'address', 'grade_level', 'department'];
      const updates = {};

      // Filter allowed updates
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No valid fields to update'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      const updatedUser = await user.update(updates);

      logger.info('User profile updated:', { userId: user.id, updates: Object.keys(updates) });

      res.json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.toJSON()
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update profile'
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password and new password are required'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'New password must be at least 6 characters long'
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.verifyPassword(current_password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }

      // Change password
      await user.changePassword(new_password);

      logger.info('User password changed:', { userId: user.id, ip: req.ip });

      res.json({
        status: 'success',
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to change password'
      });
    }
  }

  // Logout (client-side token removal, server logs the action)
  static async logout(req, res) {
    try {
      logger.info('User logged out:', { userId: req.user.id, ip: req.ip });

      res.json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Logout failed'
      });
    }
  }

  // Deactivate account
  static async deactivateAccount(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      await user.deactivate();

      logger.info('User account deactivated:', { userId: user.id, ip: req.ip });

      res.json({
        status: 'success',
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      logger.error('Deactivate account error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to deactivate account'
      });
    }
  }
}

module.exports = AuthController;