const { query } = require('../config/database');

class Media {
  constructor(mediaData) {
    this.id = mediaData.id;
    this.title = mediaData.title;
    this.type = mediaData.type; // dvd, cd, digital, audiobook, ebook
    this.format = mediaData.format;
    this.duration = mediaData.duration; // in minutes for audio/video
    this.file_size = mediaData.file_size; // in MB for digital files
    this.description = mediaData.description;
    this.total_copies = mediaData.total_copies;
    this.available_copies = mediaData.available_copies;
    this.location = mediaData.location;
    this.access_url = mediaData.access_url; // for digital media
    this.is_active = mediaData.is_active;
    this.created_at = mediaData.created_at;
    this.updated_at = mediaData.updated_at;
  }

  // Create new media
  static async create(mediaData) {
    const {
      title,
      type,
      format,
      duration,
      file_size,
      description,
      total_copies,
      location,
      access_url
    } = mediaData;

    const available_copies = mediaData.available_copies || total_copies;

    const result = await query(`
      INSERT INTO media (
        title, type, format, duration, file_size, description,
        total_copies, available_copies, location, access_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      title, type, format, duration, file_size, description,
      total_copies, available_copies, location, access_url
    ]);

    return new Media(result.rows[0]);
  }

  // Find media by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM media WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new Media(result.rows[0]);
  }

  // Search media with filters and pagination
  static async search(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      format,
      available_only = false,
      sort_by = 'title',
      sort_order = 'ASC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE is_active = true';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (format) {
      paramCount++;
      whereClause += ` AND format ILIKE $${paramCount}`;
      params.push(`%${format}%`);
    }

    if (available_only) {
      whereClause += ' AND available_copies > 0';
    }

    // Validate sort fields
    const allowedSortFields = ['title', 'type', 'created_at', 'duration'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'title';
    const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM media ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get media
    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT * FROM media ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    return {
      media: result.rows.map(row => new Media(row)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Get all media with pagination
  static async findAll(options = {}) {
    return await Media.search(options);
  }

  // Get media by type
  static async findByType(type, options = {}) {
    return await Media.search({ ...options, type });
  }

  // Update media
  async update(updateData) {
    const allowedFields = [
      'title', 'type', 'format', 'duration', 'file_size', 'description',
      'total_copies', 'available_copies', 'location', 'access_url'
    ];

    const fieldsToUpdate = Object.keys(updateData)
      .filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
      return this;
    }

    // If total_copies is being updated, adjust available_copies accordingly
    if (updateData.total_copies && !updateData.available_copies) {
      const difference = updateData.total_copies - this.total_copies;
      updateData.available_copies = this.available_copies + difference;
    }

    const setClause = fieldsToUpdate
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const values = [this.id, ...fieldsToUpdate.map(field => updateData[field])];

    const result = await query(`
      UPDATE media SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, values);

    return new Media(result.rows[0]);
  }

  // Check if media is available
  async isAvailable() {
    const result = await query(
      'SELECT available_copies FROM media WHERE id = $1',
      [this.id]
    );

    return result.rows[0]?.available_copies > 0;
  }

  // Decrease available copies (when borrowed)
  async decreaseAvailableCopies(count = 1) {
    const result = await query(`
      UPDATE media 
      SET available_copies = available_copies - $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND available_copies >= $2
      RETURNING available_copies
    `, [this.id, count]);

    if (result.rows.length === 0) {
      throw new Error('Not enough copies available');
    }

    this.available_copies = result.rows[0].available_copies;
    return this;
  }

  // Increase available copies (when returned)
  async increaseAvailableCopies(count = 1) {
    const result = await query(`
      UPDATE media 
      SET available_copies = LEAST(available_copies + $2, total_copies), 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING available_copies
    `, [this.id, count]);

    this.available_copies = result.rows[0].available_copies;
    return this;
  }

  // Soft delete media
  async delete() {
    await query(
      'UPDATE media SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [this.id]
    );

    this.is_active = false;
    return this;
  }

  // Restore deleted media
  async restore() {
    await query(
      'UPDATE media SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [this.id]
    );

    this.is_active = true;
    return this;
  }

  // Get media statistics by type
  static async getStatsByType() {
    const result = await query(`
      SELECT 
        type,
        COUNT(*) as total_items,
        SUM(total_copies) as total_copies,
        SUM(available_copies) as available_copies,
        AVG(CASE WHEN duration IS NOT NULL THEN duration END) as avg_duration
      FROM media
      WHERE is_active = true
      GROUP BY type
      ORDER BY total_items DESC
    `);

    return result.rows;
  }

  // Get popular media (most accessed for digital, most borrowed for physical)
  static async getPopular(limit = 10) {
    const result = await query(`
      SELECT m.*, 
             CASE 
               WHEN m.type IN ('digital', 'ebook', 'audiobook') 
               THEN COALESCE(ma.access_count, 0)
               ELSE COALESCE(br.borrow_count, 0)
             END as popularity_score
      FROM media m
      LEFT JOIN (
        SELECT media_id, COUNT(*) as access_count
        FROM media_access_logs
        WHERE access_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY media_id
      ) ma ON m.id = ma.media_id
      LEFT JOIN (
        SELECT media_id, COUNT(*) as borrow_count
        FROM media_borrow_records
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY media_id
      ) br ON m.id = br.media_id
      WHERE m.is_active = true
      ORDER BY popularity_score DESC, m.title ASC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => {
      const media = new Media(row);
      media.popularity_score = parseInt(row.popularity_score) || 0;
      return media;
    });
  }

  // Get recently added media
  static async getRecentlyAdded(limit = 10) {
    const result = await query(`
      SELECT * FROM media
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => new Media(row));
  }

  // Log access for digital media
  async logAccess(userId) {
    if (!['digital', 'ebook', 'audiobook'].includes(this.type)) {
      throw new Error('Access logging is only for digital media');
    }

    await query(`
      INSERT INTO media_access_logs (media_id, user_id, access_date)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `, [this.id, userId]);

    return true;
  }

  // Get access statistics for digital media
  async getAccessStats(options = {}) {
    const { start_date, end_date } = options;

    let whereClause = 'WHERE media_id = $1';
    const params = [this.id];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      whereClause += ` AND access_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereClause += ` AND access_date <= $${paramCount}`;
      params.push(end_date);
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_accesses,
        COUNT(DISTINCT user_id) as unique_users,
        DATE_TRUNC('day', access_date) as access_day,
        COUNT(*) as daily_accesses
      FROM media_access_logs
      ${whereClause}
      GROUP BY access_day
      ORDER BY access_day DESC
    `, params);

    return result.rows;
  }

  // Check if user has access to digital media
  async hasUserAccess(userId) {
    if (!['digital', 'ebook', 'audiobook'].includes(this.type)) {
      return this.available_copies > 0;
    }

    // For digital media, check if user has an active subscription or access
    // This would typically check against a user permissions or subscription table
    return true; // Simplified - implement based on your access control requirements
  }

  // Get file information for digital media
  getFileInfo() {
    if (!['digital', 'ebook', 'audiobook'].includes(this.type)) {
      return null;
    }

    return {
      access_url: this.access_url,
      file_size: this.file_size,
      format: this.format,
      duration: this.duration
    };
  }

  // Convert duration to human readable format
  getFormattedDuration() {
    if (!this.duration) return null;

    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Convert file size to human readable format
  getFormattedFileSize() {
    if (!this.file_size) return null;

    if (this.file_size >= 1024) {
      return `${(this.file_size / 1024).toFixed(2)} GB`;
    }
    return `${this.file_size} MB`;
  }
}

module.exports = Media;