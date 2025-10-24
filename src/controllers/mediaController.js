const Media = require('../models/Media');
const logger = require('../utils/logger');

class MediaController {
  // Get all media with search and filtering
  static async getMedia(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type,
        format,
        available_only,
        sort_by,
        sort_order
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        type,
        format,
        available_only: available_only === 'true',
        sort_by,
        sort_order
      };

      const result = await Media.search(options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Get media error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve media'
      });
    }
  }

  // Get media by ID
  static async getMediaById(req, res) {
    try {
      const { id } = req.params;

      const media = await Media.findById(parseInt(id));
      if (!media) {
        return res.status(404).json({
          status: 'error',
          message: 'Media not found'
        });
      }

      // Check if user has access to digital media
      let hasAccess = true;
      if (['digital', 'ebook', 'audiobook'].includes(media.type)) {
        hasAccess = await media.hasUserAccess(req.user?.id);
      }

      const mediaData = {
        ...media,
        has_access: hasAccess
      };

      // Add file info for digital media if user has access
      if (hasAccess && ['digital', 'ebook', 'audiobook'].includes(media.type)) {
        mediaData.file_info = media.getFileInfo();
      }

      res.json({
        status: 'success',
        data: {
          media: mediaData
        }
      });
    } catch (error) {
      logger.error('Get media by ID error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve media'
      });
    }
  }

  // Create new media (librarian/admin only)
  static async createMedia(req, res) {
    try {
      const {
        title,
        type,
        format,
        duration,
        file_size,
        description,
        total_copies,
        available_copies,
        location,
        access_url
      } = req.body;

      const media = await Media.create({
        title,
        type,
        format,
        duration,
        file_size,
        description,
        total_copies,
        available_copies,
        location,
        access_url
      });

      logger.info('New media created:', { 
        mediaId: media.id, 
        createdBy: req.user.id, 
        title: media.title,
        type: media.type
      });

      res.status(201).json({
        status: 'success',
        message: 'Media created successfully',
        data: {
          media
        }
      });
    } catch (error) {
      logger.error('Create media error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create media',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Update media (librarian/admin only)
  static async updateMedia(req, res) {
    try {
      const { id } = req.params;
      const mediaId = parseInt(id);

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          status: 'error',
          message: 'Media not found'
        });
      }

      const updatedMedia = await media.update(req.body);

      logger.info('Media updated:', { 
        mediaId: mediaId, 
        updatedBy: req.user.id, 
        updates: Object.keys(req.body) 
      });

      res.json({
        status: 'success',
        message: 'Media updated successfully',
        data: {
          media: updatedMedia
        }
      });
    } catch (error) {
      logger.error('Update media error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update media'
      });
    }
  }

  // Delete media (soft delete - librarian/admin only)
  static async deleteMedia(req, res) {
    try {
      const { id } = req.params;
      const mediaId = parseInt(id);

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          status: 'error',
          message: 'Media not found'
        });
      }

      await media.delete();

      logger.info('Media deleted:', { 
        mediaId: mediaId, 
        deletedBy: req.user.id 
      });

      res.json({
        status: 'success',
        message: 'Media deleted successfully'
      });
    } catch (error) {
      logger.error('Delete media error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete media'
      });
    }
  }

  // Restore deleted media (librarian/admin only)
  static async restoreMedia(req, res) {
    try {
      const { id } = req.params;
      const mediaId = parseInt(id);

      // Need to query directly to get soft-deleted media
      const { query } = require('../config/database');
      const result = await query('SELECT * FROM media WHERE id = $1', [mediaId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Media not found'
        });
      }

      const media = new Media(result.rows[0]);
      
      if (media.is_active) {
        return res.status(400).json({
          status: 'error',
          message: 'Media is already active'
        });
      }

      await media.restore();

      logger.info('Media restored:', { 
        mediaId: mediaId, 
        restoredBy: req.user.id 
      });

      res.json({
        status: 'success',
        message: 'Media restored successfully'
      });
    } catch (error) {
      logger.error('Restore media error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to restore media'
      });
    }
  }

  // Get media by type
  static async getMediaByType(req, res) {
    try {
      const { type } = req.params;
      const {
        page = 1,
        limit = 10,
        search,
        format,
        available_only,
        sort_by,
        sort_order
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        format,
        available_only: available_only === 'true',
        sort_by,
        sort_order
      };

      const result = await Media.findByType(type, options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Get media by type error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve media by type'
      });
    }
  }

  // Get popular media
  static async getPopularMedia(req, res) {
    try {
      const { limit = 10 } = req.query;

      const media = await Media.getPopular(parseInt(limit));

      res.json({
        status: 'success',
        data: {
          media
        }
      });
    } catch (error) {
      logger.error('Get popular media error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve popular media'
      });
    }
  }

  // Get recently added media
  static async getRecentMedia(req, res) {
    try {
      const { limit = 10 } = req.query;

      const media = await Media.getRecentlyAdded(parseInt(limit));

      res.json({
        status: 'success',
        data: {
          media
        }
      });
    } catch (error) {
      logger.error('Get recent media error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve recent media'
      });
    }
  }

  // Check media availability
  static async checkAvailability(req, res) {
    try {
      const { id } = req.params;
      const mediaId = parseInt(id);

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          status: 'error',
          message: 'Media not found'
        });
      }

      const isAvailable = await media.isAvailable();

      res.json({
        status: 'success',
        data: {
          media_id: media.id,
          title: media.title,
          type: media.type,
          total_copies: media.total_copies,
          available_copies: media.available_copies,
          is_available: isAvailable
        }
      });
    } catch (error) {
      logger.error('Check media availability error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check media availability'
      });
    }
  }

  // Access digital media
  static async accessMedia(req, res) {
    try {
      const { id } = req.params;
      const mediaId = parseInt(id);
      const userId = req.user.id;

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          status: 'error',
          message: 'Media not found'
        });
      }

      // Check if it's digital media
      if (!['digital', 'ebook', 'audiobook'].includes(media.type)) {
        return res.status(400).json({
          status: 'error',
          message: 'This media type does not support direct access'
        });
      }

      // Check if user has access
      const hasAccess = await media.hasUserAccess(userId);
      if (!hasAccess) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied to this media'
        });
      }

      // Log access
      await media.logAccess(userId);

      logger.info('Media accessed:', { 
        mediaId: mediaId,
        userId: userId,
        type: media.type
      });

      res.json({
        status: 'success',
        message: 'Media access granted',
        data: {
          media: {
            id: media.id,
            title: media.title,
            type: media.type,
            ...media.getFileInfo()
          }
        }
      });
    } catch (error) {
      logger.error('Access media error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to access media'
      });
    }
  }

  // Get media statistics (admin/librarian only)
  static async getMediaStats(req, res) {
    try {
      const statsByType = await Media.getStatsByType();

      res.json({
        status: 'success',
        data: {
          statistics_by_type: statsByType
        }
      });
    } catch (error) {
      logger.error('Get media stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve media statistics'
      });
    }
  }

  // Get access statistics for specific media (admin/librarian only)
  static async getAccessStats(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;
      const mediaId = parseInt(id);

      const media = await Media.findById(mediaId);
      if (!media) {
        return res.status(404).json({
          status: 'error',
          message: 'Media not found'
        });
      }

      if (!['digital', 'ebook', 'audiobook'].includes(media.type)) {
        return res.status(400).json({
          status: 'error',
          message: 'Access statistics only available for digital media'
        });
      }

      const options = {};
      if (start_date) options.start_date = start_date;
      if (end_date) options.end_date = end_date;

      const accessStats = await media.getAccessStats(options);

      res.json({
        status: 'success',
        data: {
          media: {
            id: media.id,
            title: media.title,
            type: media.type
          },
          access_statistics: accessStats
        }
      });
    } catch (error) {
      logger.error('Get access stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve access statistics'
      });
    }
  }

  // Update media copies (librarian/admin only)
  static async updateCopies(req, res) {
    try {
      const { id } = req.params;
      const { total_copies } = req.body;

      if (!total_copies || total_copies < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid total_copies value is required'
        });
      }

      const mediaId = parseInt(id);
      const media = await Media.findById(mediaId);
      
      if (!media) {
        return res.status(404).json({
          status: 'error',
          message: 'Media not found'
        });
      }

      const updatedMedia = await media.update({ total_copies });

      logger.info('Media copies updated:', { 
        mediaId: mediaId, 
        updatedBy: req.user.id,
        oldCopies: media.total_copies,
        newCopies: total_copies
      });

      res.json({
        status: 'success',
        message: 'Media copies updated successfully',
        data: {
          media: updatedMedia
        }
      });
    } catch (error) {
      logger.error('Update media copies error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update media copies'
      });
    }
  }
}

module.exports = MediaController;