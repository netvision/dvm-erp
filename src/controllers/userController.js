const User = require('../models/User');
const logger = require('../utils/logger');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserController {
  // Get all users (admin/librarian only)
  static async getUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        is_active,
        search
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        search
      };

      const result = await User.findAll(options);

      // Transform data to include full name and proper status format
      const transformedUsers = result.users.map(user => ({
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        status: user.is_active ? 'active' : 'inactive'
      }));

      res.json({
        success: true,
        data: transformedUsers,
        pagination: result.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: transformedUsers.length
        }
      });
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users'
      });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(parseInt(id));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Transform user data to include full name
      const transformedUser = {
        ...user,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        status: user.is_active ? 'active' : 'inactive'
      };

      res.json({
        success: true,
        data: transformedUser
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user'
      });
    }
  }

  // Update user (admin/librarian or self)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Determine allowed fields based on user role
      let allowedFields = ['first_name', 'last_name', 'phone', 'address', 'grade_level', 'department'];
      
      // Admin and librarian can update more fields
      if (req.user.role === 'admin' || req.user.role === 'librarian') {
        allowedFields.push('is_active');
        
        // Only admin can change roles
        if (req.user.role === 'admin') {
          allowedFields.push('role');
        }
      }

      const updates = {};
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No valid fields to update'
        });
      }

      const updatedUser = await user.update(updates);

      logger.info('User updated:', { 
        updatedUserId: userId, 
        updatedBy: req.user.id, 
        updates: Object.keys(updates) 
      });

      res.json({
        status: 'success',
        message: 'User updated successfully',
        data: {
          user: updatedUser.toJSON()
        }
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update user'
      });
    }
  }

  // Deactivate user (admin/librarian only)
  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Prevent self-deactivation
      if (req.user.id === userId) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot deactivate your own account'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      if (!user.is_active) {
        return res.status(400).json({
          status: 'error',
          message: 'User is already deactivated'
        });
      }

      await user.deactivate();

      logger.info('User deactivated:', { 
        deactivatedUserId: userId, 
        deactivatedBy: req.user.id 
      });

      res.json({
        status: 'success',
        message: 'User deactivated successfully'
      });
    } catch (error) {
      logger.error('Deactivate user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to deactivate user'
      });
    }
  }

  // Activate user (admin/librarian only)
  static async activateUser(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      if (user.is_active) {
        return res.status(400).json({
          status: 'error',
          message: 'User is already active'
        });
      }

      await user.activate();

      logger.info('User activated:', { 
        activatedUserId: userId, 
        activatedBy: req.user.id 
      });

      res.json({
        status: 'success',
        message: 'User activated successfully'
      });
    } catch (error) {
      logger.error('Activate user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to activate user'
      });
    }
  }

  // Get user's borrow history
  static async getUserBorrowHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const userId = parseInt(id);
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      };

      const borrowHistory = await user.getBorrowHistory(options);

      res.json({
        status: 'success',
        data: {
          borrow_history: borrowHistory
        }
      });
    } catch (error) {
      logger.error('Get user borrow history error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve borrow history'
      });
    }
  }

  // Create new user (admin only)
  static async createUser(req, res) {
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
        employee_id,
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
        employee_id,
        grade_level,
        department
      });

      logger.info('New user created by admin:', { 
        createdUserId: user.id, 
        createdBy: req.user.id, 
        email: user.email, 
        role: user.role 
      });

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      logger.error('Create user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get user statistics (admin/librarian only)
  static async getUserStats(req, res) {
    try {
      const stats = await User.findAll({ limit: 1000 }); // Get all for stats calculation
      
      const userStats = {
        total_users: stats.users.length,
        active_users: stats.users.filter(u => u.is_active).length,
        inactive_users: stats.users.filter(u => !u.is_active).length,
        by_role: {}
      };

      // Count by role
      stats.users.forEach(user => {
        if (!userStats.by_role[user.role]) {
          userStats.by_role[user.role] = 0;
        }
        userStats.by_role[user.role]++;
      });

      res.json({
        status: 'success',
        data: {
          statistics: userStats
        }
      });
    } catch (error) {
      logger.error('Get user stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve user statistics'
      });
    }
  }

  // Reset user password (admin only)
  static async resetUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { new_password } = req.body;

      if (!new_password) {
        return res.status(400).json({
          status: 'error',
          message: 'New password is required'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters long'
        });
      }

      const userId = parseInt(id);
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      await user.changePassword(new_password);

      logger.info('User password reset by admin:', { 
        resetUserId: userId, 
        resetBy: req.user.id 
      });

      res.json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Reset user password error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to reset password'
      });
    }
  }

  // Get enhanced user statistics
  static async getUserStats(req, res) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'student') as total_students,
          COUNT(*) FILTER (WHERE role = 'librarian') as total_librarians,
          COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
          COUNT(*) FILTER (WHERE is_active = true) as active_users,
          COUNT(*) FILTER (WHERE is_active = false) as inactive_users,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_this_month,
          COUNT(*) FILTER (WHERE last_login >= CURRENT_DATE - INTERVAL '7 days') as active_this_week
        FROM users 
        WHERE deleted_at IS NULL
      `;

      const statsResult = await pool.query(statsQuery);

      // Get monthly registration stats
      const monthlyQuery = `
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as registrations
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
          AND deleted_at IS NULL
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `;

      const monthlyResult = await pool.query(monthlyQuery);

      // Get role distribution
      const roleQuery = `
        SELECT 
          role,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL), 2) as percentage
        FROM users 
        WHERE deleted_at IS NULL
        GROUP BY role
        ORDER BY count DESC
      `;

      const roleResult = await pool.query(roleQuery);

      res.json({
        status: 'success',
        data: {
          overview: statsResult.rows[0],
          monthly_registrations: monthlyResult.rows,
          role_distribution: roleResult.rows
        }
      });
    } catch (error) {
      logger.error('Get user stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve user statistics'
      });
    }
  }

  // Update user status
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status. Must be: active, inactive, or suspended'
        });
      }

      const isActive = status === 'active';
      const userId = parseInt(id);
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      await User.updateById(userId, { 
        is_active: isActive,
        status: status 
      });

      logger.info('User status updated:', { 
        userId, 
        newStatus: status, 
        updatedBy: req.user.id 
      });

      res.json({
        status: 'success',
        message: `User status updated to ${status}`
      });
    } catch (error) {
      logger.error('Update user status error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update user status'
      });
    }
  }

  // Bulk user operations
  static async bulkUpdateUsers(req, res) {
    try {
      const { userIds, operation, value } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'User IDs are required'
        });
      }

      let updateData = {};

      switch (operation) {
        case 'status':
          if (!['active', 'inactive', 'suspended'].includes(value)) {
            return res.status(400).json({
              status: 'error',
              message: 'Invalid status value'
            });
          }
          updateData.is_active = value === 'active';
          updateData.status = value;
          break;

        case 'role':
          if (!['student', 'librarian', 'admin'].includes(value)) {
            return res.status(400).json({
              status: 'error',
              message: 'Invalid role value'
            });
          }
          updateData.role = value;
          break;

        default:
          return res.status(400).json({
            status: 'error',
            message: 'Invalid operation'
          });
      }

      const updatedUsers = [];
      for (const userId of userIds) {
        try {
          await User.updateById(parseInt(userId), updateData);
          const user = await User.findById(parseInt(userId));
          if (user) {
            updatedUsers.push(user);
          }
        } catch (err) {
          logger.error(`Failed to update user ${userId}:`, err);
        }
      }

      logger.info('Bulk user update:', { 
        operation, 
        value, 
        updatedCount: updatedUsers.length,
        performedBy: req.user.id 
      });

      res.json({
        status: 'success',
        data: updatedUsers,
        message: `Successfully updated ${updatedUsers.length} users`
      });
    } catch (error) {
      logger.error('Bulk user update error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to perform bulk update'
      });
    }
  }

  // Export users data
  static async exportUsers(req, res) {
    try {
      const { format = 'csv', role, is_active } = req.query;

      const options = {
        role,
        is_active: is_active !== undefined ? is_active === 'true' : undefined
      };

      const users = await User.findAll({ ...options, limit: 10000 }); // Get all users for export

      if (format === 'csv') {
        // Generate CSV
        const headers = [
          'ID', 'Name', 'Email', 'Role', 'Student ID', 'Active', 
          'Phone', 'Address', 'Created At', 'Last Login'
        ];

        let csvContent = headers.join(',') + '\n';

        users.data.forEach(user => {
          const csvRow = [
            user.id,
            `"${user.name}"`,
            user.email,
            user.role,
            user.student_id || '',
            user.is_active ? 'Yes' : 'No',
            user.phone || '',
            `"${user.address || ''}"`,
            user.created_at,
            user.last_login || ''
          ];
          csvContent += csvRow.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
        res.send(csvContent);
      } else {
        // Return JSON
        res.json({
          status: 'success',
          data: users.data,
          exported_at: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Export users error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to export users'
      });
    }
  }

  // Get user activity summary
  static async getUserActivity(req, res) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Get borrowing activity
      const borrowingQuery = `
        SELECT 
          br.*,
          b.title,
          b.author,
          b.isbn
        FROM borrow_records br
        JOIN books b ON br.book_id = b.id
        WHERE br.user_id = $1
        ORDER BY br.borrowed_date DESC
        LIMIT 20
      `;

      const borrowingResult = await pool.query(borrowingQuery, [userId]);

      // Get current borrowed books count
      const currentBorrowedQuery = `
        SELECT COUNT(*) as count
        FROM borrow_records 
        WHERE user_id = $1 AND status = 'borrowed'
      `;

      const currentBorrowedResult = await pool.query(currentBorrowedQuery, [userId]);

      // Get overdue books count
      const overdueQuery = `
        SELECT COUNT(*) as count
        FROM borrow_records 
        WHERE user_id = $1 AND status = 'borrowed' AND due_date < CURRENT_DATE
      `;

      const overdueResult = await pool.query(overdueQuery, [userId]);

      res.json({
        status: 'success',
        data: {
          user: user,
          recent_borrowings: borrowingResult.rows,
          current_borrowed: parseInt(currentBorrowedResult.rows[0].count),
          overdue_count: parseInt(overdueResult.rows[0].count)
        }
      });
    } catch (error) {
      logger.error('Get user activity error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve user activity'
      });
    }
  }

  // Get online users count
  static async getOnlineUsers(req, res) {
    try {
      // Check for users who have been active in the last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
      
      // First check if last_login column exists
      const columnCheckQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_login'
      `
      
      const columnCheck = await pool.query(columnCheckQuery)
      
      if (columnCheck.rows.length === 0) {
        // Column doesn't exist, return simulated online users
        const activeUsersQuery = `
          SELECT COUNT(*) as count
          FROM users 
          WHERE is_active = true
        `
        const activeResult = await pool.query(activeUsersQuery)
        const activeCount = parseInt(activeResult.rows[0].count)
        
        // Simulate 10-25% of active users being online
        const simulatedOnlineCount = Math.max(1, Math.floor(activeCount * (0.1 + Math.random() * 0.15)))
        
        return res.json({
          success: true,
          onlineCount: simulatedOnlineCount,
          onlineUsers: [],
          simulated: true
        })
      }
      
      const query = `
        SELECT id, first_name, last_name, email, role, last_login
        FROM users 
        WHERE last_login >= $1 
        AND is_active = true
        ORDER BY last_login DESC
      `
      
      const result = await pool.query(query, [fifteenMinutesAgo])
      
      res.json({
        success: true,
        onlineCount: result.rows.length,
        onlineUsers: result.rows.map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
          last_login: user.last_login
        }))
      })
    } catch (error) {
      console.error('Error fetching online users:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch online users',
        error: error.message
      })
    }
  }
}

module.exports = UserController;