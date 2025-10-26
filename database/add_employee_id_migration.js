/**
 * Migration Script: Add employee_id column to users table
 * 
 * This script adds the missing employee_id column to the users table
 * if it doesn't already exist.
 * 
 * Usage:
 *   node database/add_employee_id_migration.js
 * 
 * Or with custom database connection:
 *   DB_HOST=localhost DB_USER=postgres DB_NAME=school_library DB_PASSWORD=yourpass node database/add_employee_id_migration.js
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'school_library',
  port: process.env.DB_PORT || 5432,
};

const pool = new Pool(config);

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database connection...');
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    console.log('');

    // Check if column exists
    console.log('🔍 Checking if employee_id column exists...');
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'employee_id'
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Column employee_id already exists in users table');
      console.log('   No migration needed.');
      return;
    }

    console.log('⚠️  Column employee_id not found. Adding it now...');
    console.log('');

    // Add the column
    console.log('📝 Adding employee_id column...');
    await client.query('BEGIN');
    
    const addColumnQuery = `
      ALTER TABLE users 
      ADD COLUMN employee_id VARCHAR(50) UNIQUE
    `;
    
    await client.query(addColumnQuery);
    console.log('✅ Column employee_id added successfully');

    // Create index
    console.log('📝 Creating index on employee_id...');
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_users_employee_id 
      ON users(employee_id)
    `;
    
    await client.query(createIndexQuery);
    console.log('✅ Index idx_users_employee_id created successfully');

    await client.query('COMMIT');
    
    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - Added column: employee_id VARCHAR(50) UNIQUE');
    console.log('   - Created index: idx_users_employee_id');
    console.log('');
    console.log('🎉 Your database is now up to date!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('');
    console.error('❌ Migration failed!');
    console.error('');
    console.error('Error details:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Connection refused. Please check:');
      console.error('   - PostgreSQL is running');
      console.error('   - Host and port are correct');
      console.error('   - Firewall settings');
    } else if (error.code === '28P01') {
      console.error('💡 Authentication failed. Please check:');
      console.error('   - Username is correct');
      console.error('   - Password is correct');
      console.error('   - User has proper permissions');
    } else if (error.code === '3D000') {
      console.error('💡 Database does not exist. Please check:');
      console.error('   - Database name is correct');
      console.error('   - Database has been created');
    }
    
    process.exit(1);
    
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('  Database Migration: Add employee_id Column');
console.log('═══════════════════════════════════════════════════');
console.log('');

runMigration()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
