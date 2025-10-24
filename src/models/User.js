const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.email = userData.email;
    this.role = userData.role;
    this.phone = userData.phone;
    this.address = userData.address;
    this.student_id = userData.student_id;
    this.employee_id = userData.employee_id;
    this.grade_level = userData.grade_level;
    this.department = userData.department;
    this.is_active = userData.is_active;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Create new user
  static async create(userData) {
    const {
      first_name,
      last_name,
      email,
      password,
      role = 'student',
      phone,
      address,
      student_id,
      employee_id,
      grade_level,
      department
    } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(`
      INSERT INTO users (
        first_name, last_name, email, password_hash, role, phone, address,
        student_id, employee_id, grade_level, department
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, first_name, last_name, email, role, phone, address,
                student_id, employee_id, grade_level, department, is_active,
                created_at, updated_at
    `, [
      first_name, last_name, email, hashedPassword, role, phone, address,
      student_id, employee_id, grade_level, department
    ]);

    return new User(result.rows[0]);
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  // Find user by ID
  static async findById(id) {
    const result = await query(
      `SELECT id, first_name, last_name, email, role, phone, address,
              student_id, employee_id, grade_level, department, is_active,
              created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);
  }

  // Get all users with pagination
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      role,
      is_active,
      search
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (typeof is_active === 'boolean') {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(is_active);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get users
    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    const result = await query(`
      SELECT id, first_name, last_name, email, role, phone, address,
             student_id, employee_id, grade_level, department, is_active,
             created_at, updated_at
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `, params);

    return {
      users: result.rows.map(row => new User(row)),
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  // Update user
  async update(updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'address',
      'grade_level', 'department', 'is_active'
    ];

    const fieldsToUpdate = Object.keys(updateData)
      .filter(key => allowedFields.includes(key));

    if (fieldsToUpdate.length === 0) {
      return this;
    }

    const setClause = fieldsToUpdate
      .map((field, index) => `${field} = $${index + 2}`)
      .join(', ');

    const values = [this.id, ...fieldsToUpdate.map(field => updateData[field])];

    const result = await query(`
      UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, first_name, last_name, email, role, phone, address,
                student_id, employee_id, grade_level, department, is_active,
                created_at, updated_at
    `, values);

    return new User(result.rows[0]);
  }

  // Verify password
  async verifyPassword(password) {
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [this.id]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return await bcrypt.compare(password, result.rows[0].password_hash);
  }

  // Change password
  async changePassword(newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, this.id]
    );

    return true;
  }

  // Deactivate user
  async deactivate() {
    await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [this.id]
    );

    this.is_active = false;
    return this;
  }

  // Activate user
  async activate() {
    await query(
      'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [this.id]
    );

    this.is_active = true;
    return this;
  }

  // Get user's borrow history
  async getBorrowHistory(options = {}) {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE br.user_id = $1';
    const params = [this.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND br.status = $${paramCount}`;
      params.push(status);
    }

    const result = await query(`
      SELECT br.*, b.title, b.author, b.isbn
      FROM borrow_records br
      JOIN books b ON br.book_id = b.id
      ${whereClause}
      ORDER BY br.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);

    return result.rows;
  }

  // Update last login timestamp and increment login count
  async updateLastLogin() {
    try {
      // Check if last_login column exists first
      const columnCheckQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_login'
      `;
      
      const columnCheck = await query(columnCheckQuery);
      
      if (columnCheck.rows.length === 0) {
        console.log('last_login column does not exist yet, skipping update');
        return this;
      }

      const result = await query(`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP,
            login_count = COALESCE(login_count, 0) + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING last_login, login_count
      `, [this.id]);

      if (result.rows.length > 0) {
        this.last_login = result.rows[0].last_login;
        this.login_count = result.rows[0].login_count;
      }
      
      return this;
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error, just log it and continue
      return this;
    }
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { password_hash, ...userData } = this;
    return userData;
  }
}

module.exports = User;