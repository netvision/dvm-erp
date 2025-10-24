const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'school_library',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');
    
    // Read the enhanced schema file
    const schemaPath = path.join(__dirname, 'database', 'enhanced_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    console.log('✅ Enhanced schema applied successfully');
    
    // Add equipment table if it doesn't exist
    const equipmentTable = `
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        model VARCHAR(100),
        serial_number VARCHAR(100) UNIQUE,
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'maintenance', 'damaged', 'retired')),
        condition VARCHAR(20) DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
        location VARCHAR(100),
        purchase_date DATE,
        warranty_until DATE,
        purchase_price DECIMAL(10,2),
        current_value DECIMAL(10,2),
        description TEXT,
        specifications JSONB DEFAULT '{}',
        maintenance_schedule JSONB DEFAULT '{}',
        qr_code VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
      CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
      CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number);
    `;
    
    await pool.query(equipmentTable);
    console.log('✅ Equipment table created successfully');
    
    // Update books table to add missing columns
    const updateBooksTable = `
      ALTER TABLE books ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
      ALTER TABLE books ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';
      ALTER TABLE books ADD COLUMN IF NOT EXISTS condition VARCHAR(20) DEFAULT 'good';
      ALTER TABLE books ADD COLUMN IF NOT EXISTS copies_total INTEGER DEFAULT 1;
      ALTER TABLE books ADD COLUMN IF NOT EXISTS copies_available INTEGER DEFAULT 1;
      ALTER TABLE books ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT 'Main Library';
    `;
    
    await pool.query(updateBooksTable);
    console.log('✅ Books table updated successfully');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    pool.end();
  }
}

setupDatabase();