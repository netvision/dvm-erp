const pool = require('../config/database');

class EquipmentController {
  // Get all equipment
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        status = '',
        condition = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      // Search filter
      if (search) {
        paramCount++;
        whereConditions.push(`(name ILIKE $${paramCount} OR model ILIKE $${paramCount} OR serial_number ILIKE $${paramCount})`);
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

      // Condition filter
      if (condition) {
        paramCount++;
        whereConditions.push(`condition = $${paramCount}`);
        queryParams.push(condition);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM equipment
        ${whereClause}
      `;
      
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get equipment with pagination
      const equipmentQuery = `
        SELECT 
          id, name, category, model, serial_number, status, condition,
          location, purchase_date, warranty_until, created_at, updated_at
        FROM equipment 
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      queryParams.push(parseInt(limit), offset);
      
      const result = await pool.query(equipmentQuery, queryParams);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Get equipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching equipment',
        error: error.message
      });
    }
  }

  // Get single equipment item
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT * FROM equipment 
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Get equipment by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching equipment',
        error: error.message
      });
    }
  }

  // Create new equipment
  async create(req, res) {
    try {
      const {
        name,
        category,
        model,
        serial_number,
        status = 'available',
        condition = 'excellent',
        location,
        purchase_date,
        warranty_until,
        purchase_price,
        description
      } = req.body;

      const query = `
        INSERT INTO equipment (
          name, category, model, serial_number, status, condition,
          location, purchase_date, warranty_until, purchase_price, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        name, category, model, serial_number, status, condition,
        location, purchase_date, warranty_until, purchase_price, description
      ];

      const result = await pool.query(query, values);

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Equipment created successfully'
      });

    } catch (error) {
      console.error('Create equipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating equipment',
        error: error.message
      });
    }
  }

  // Update equipment
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateFields = req.body;
      
      const setClause = Object.keys(updateFields)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const query = `
        UPDATE equipment 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const values = [id, ...Object.values(updateFields)];
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Equipment updated successfully'
      });

    } catch (error) {
      console.error('Update equipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating equipment',
        error: error.message
      });
    }
  }

  // Delete equipment
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const query = 'DELETE FROM equipment WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }

      res.json({
        success: true,
        message: 'Equipment deleted successfully'
      });

    } catch (error) {
      console.error('Delete equipment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting equipment',
        error: error.message
      });
    }
  }
}

module.exports = new EquipmentController();