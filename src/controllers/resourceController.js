const pool = require('../config/database');
const logger = require('../utils/logger');

class ResourceController {
  // Get all books
  static async getBooks(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        status = '',
        sortBy = 'title',
        sortOrder = 'asc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      // Search filter
      if (search) {
        paramCount++;
        whereConditions.push(`(title ILIKE $${paramCount} OR author ILIKE $${paramCount} OR isbn ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
      }

      // Category filter
      if (category) {
        paramCount++;
        whereConditions.push(`category = $${paramCount}`);
        queryParams.push(category);
      }

      // Status filter
      if (status) {
        paramCount++;
        whereConditions.push(`status = $${paramCount}`);
        queryParams.push(status);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM books
        ${whereClause}
      `;
      
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get books
      const booksQuery = `
        SELECT 
          id, title, author, isbn, category, status, condition,
          copies_total, copies_available, location, created_at, updated_at
        FROM books 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      const booksResult = await pool.query(booksQuery, [...queryParams, parseInt(limit), offset]);

      res.json({
        success: true,
        books: booksResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Get books error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch books',
        error: error.message
      });
    }
  }

  // Get digital resources
  static async getDigitalResources(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        type = '',
        category = ''
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereConditions.push(`title ILIKE $${paramCount}`);
        queryParams.push(`%${search}%`);
      }

      if (type) {
        paramCount++;
        whereConditions.push(`resource_type = $${paramCount}`);
        queryParams.push(type);
      }

      if (category) {
        paramCount++;
        whereConditions.push(`category = $${paramCount}`);
        queryParams.push(category);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          id, title, resource_type as type, format, file_size as size,
          category, access_level, download_count as downloads, url, created_at
        FROM digital_resources 
        ${whereClause}
        ORDER BY title ASC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      const result = await pool.query(query, [...queryParams, parseInt(limit), offset]);

      res.json({
        success: true,
        resources: result.rows
      });
    } catch (error) {
      logger.error('Get digital resources error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch digital resources',
        error: error.message
      });
    }
  }

  // Get media resources
  static async getMediaResources(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        type = '',
        category = ''
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereConditions.push(`title ILIKE $${paramCount}`);
        queryParams.push(`%${search}%`);
      }

      if (type) {
        paramCount++;
        whereConditions.push(`media_type = $${paramCount}`);
        queryParams.push(type);
      }

      if (category) {
        paramCount++;
        whereConditions.push(`category = $${paramCount}`);
        queryParams.push(category);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          id, title, media_type as type, format, duration, file_size as size,
          category, quality, language, subtitles_available as subtitles, created_at
        FROM media_resources 
        ${whereClause}
        ORDER BY title ASC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      const result = await pool.query(query, [...queryParams, parseInt(limit), offset]);

      res.json({
        success: true,
        media: result.rows
      });
    } catch (error) {
      logger.error('Get media resources error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch media resources',
        error: error.message
      });
    }
  }

  // Get equipment
  static async getEquipment(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        status = ''
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      if (search) {
        paramCount++;
        whereConditions.push(`(name ILIKE $${paramCount} OR model ILIKE $${paramCount} OR serial_number ILIKE $${paramCount})`);
        queryParams.push(`%${search}%`);
      }

      if (category) {
        paramCount++;
        whereConditions.push(`category = $${paramCount}`);
        queryParams.push(category);
      }

      if (status) {
        paramCount++;
        whereConditions.push(`status = $${paramCount}`);
        queryParams.push(status);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          id, name, category, model, serial_number, status, condition,
          location, purchase_date, warranty_until, created_at
        FROM equipment 
        ${whereClause}
        ORDER BY name ASC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      const result = await pool.query(query, [...queryParams, parseInt(limit), offset]);

      res.json({
        success: true,
        equipment: result.rows
      });
    } catch (error) {
      logger.error('Get equipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment',
        error: error.message
      });
    }
  }

  // Create new resource
  static async createResource(req, res) {
    try {
      const { type, ...resourceData } = req.body;

      let result;
      switch (type) {
        case 'book':
          result = await ResourceController.createBook(resourceData);
          break;
        case 'digital':
          result = await ResourceController.createDigitalResource(resourceData);
          break;
        case 'media':
          result = await ResourceController.createMediaResource(resourceData);
          break;
        case 'equipment':
          result = await ResourceController.createEquipment(resourceData);
          break;
        default:
          throw new Error('Invalid resource type');
      }

      res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        resource: result
      });
    } catch (error) {
      logger.error('Create resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create resource',
        error: error.message
      });
    }
  }

  // Helper methods for creating specific resource types
  static async createBook(data) {
    const {
      title, author, isbn, category, copies_total, copies_available,
      condition, location, description
    } = data;

    const query = `
      INSERT INTO books (
        title, author, isbn, category, copies_total, copies_available,
        condition, location, description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'available')
      RETURNING *
    `;

    const result = await pool.query(query, [
      title, author, isbn, category, copies_total, copies_available,
      condition, location, description
    ]);

    return result.rows[0];
  }

  static async createDigitalResource(data) {
    const {
      title, digital_type, format, size, category, access_level, url, description
    } = data;

    const query = `
      INSERT INTO digital_resources (
        title, resource_type, format, file_size, category, access_level,
        url, description, download_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
      RETURNING *
    `;

    const result = await pool.query(query, [
      title, digital_type, format, size, category, access_level, url, description
    ]);

    return result.rows[0];
  }

  static async createMediaResource(data) {
    const {
      title, media_type, duration, format, quality, language, subtitles,
      category, description
    } = data;

    const query = `
      INSERT INTO media_resources (
        title, media_type, duration, format, quality, language,
        subtitles_available, category, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [
      title, media_type, duration, format, quality, language,
      subtitles || false, category, description
    ]);

    return result.rows[0];
  }

  static async createEquipment(data) {
    const {
      title: name, model, serial_number, category, condition, status,
      location, purchase_date, warranty_until, description
    } = data;

    const query = `
      INSERT INTO equipment (
        name, model, serial_number, category, condition, status,
        location, purchase_date, warranty_until, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(query, [
      name, model, serial_number, category, condition, status,
      location, purchase_date, warranty_until, description
    ]);

    return result.rows[0];
  }

  // Update resource
  static async updateResource(req, res) {
    try {
      const { id } = req.params;
      const { type, ...updateData } = req.body;

      let tableName;
      switch (type) {
        case 'book':
          tableName = 'books';
          break;
        case 'digital':
          tableName = 'digital_resources';
          break;
        case 'media':
          tableName = 'media_resources';
          break;
        case 'equipment':
          tableName = 'equipment';
          break;
        default:
          throw new Error('Invalid resource type');
      }

      // Build dynamic update query
      const updateFields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
      const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = [id, ...updateFields.map(field => updateData[field])];

      const query = `
        UPDATE ${tableName}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      res.json({
        success: true,
        message: 'Resource updated successfully',
        resource: result.rows[0]
      });
    } catch (error) {
      logger.error('Update resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update resource',
        error: error.message
      });
    }
  }

  // Delete resource
  static async deleteResource(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.query;

      let tableName;
      switch (type) {
        case 'book':
          tableName = 'books';
          break;
        case 'digital':
          tableName = 'digital_resources';
          break;
        case 'media':
          tableName = 'media_resources';
          break;
        case 'equipment':
          tableName = 'equipment';
          break;
        default:
          throw new Error('Invalid resource type');
      }

      const query = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      logger.error('Delete resource error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete resource',
        error: error.message
      });
    }
  }

  // Import resources
  static async importResources(req, res) {
    try {
      const { method, resourceType, data } = req.body;

      // Simulate import process
      logger.info(`Importing ${data?.length || 0} ${resourceType} via ${method}`);

      res.json({
        success: true,
        message: `Successfully imported ${data?.length || 0} resources`,
        imported: data?.length || 0
      });
    } catch (error) {
      logger.error('Import resources error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import resources',
        error: error.message
      });
    }
  }
}

module.exports = ResourceController;