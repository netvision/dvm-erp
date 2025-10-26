// Load environment variables
require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration - use same config as main app
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'school_library',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

console.log('🔧 Database config:', {
  user: dbConfig.user,
  host: dbConfig.host,
  database: dbConfig.database,
  port: dbConfig.port,
  password: dbConfig.password ? '***' : 'not set'
});

async function runMigration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔄 Connecting to database...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'add_external_url_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📜 Running migration: add_external_url_column.sql');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the column was added
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'media_resources' AND column_name = 'external_url'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Column verified:', result.rows[0]);
    } else {
      console.log('❌ Column not found after migration');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔚 Database connection closed');
  }
}

// Run the migration
runMigration();