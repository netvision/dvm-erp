#!/usr/bin/env node

/**
 * Production Migration Script for Live Server
 * 
 * This script adds the external_url column to media_resources table
 * Safe to run multiple times (uses IF NOT EXISTS)
 * 
 * Usage:
 * 1. SSH to your server
 * 2. Navigate to your project directory
 * 3. Run: node database/migrate_production.js
 */

// Load environment variables for production
require('dotenv').config({ path: '.env.production' });

const { Pool } = require('pg');

// Production database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME || 'school_library',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const migrationSQL = `
-- Add missing external_url column to media_resources table
-- Safe to run multiple times
ALTER TABLE media_resources 
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN media_resources.external_url IS 'URL for uploaded media files or external media content';

-- Verify column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'media_resources' AND column_name = 'external_url';
`;

async function runProductionMigration() {
  let pool;
  
  try {
    console.log('🚀 Starting production migration...');
    console.log('📊 Environment:', process.env.NODE_ENV || 'development');
    
    // Validate required environment variables
    if (!process.env.DB_PASSWORD) {
      throw new Error('❌ DB_PASSWORD environment variable is required for production');
    }
    
    console.log('🔧 Database config:', {
      user: dbConfig.user,
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port,
      ssl: !!dbConfig.ssl,
      password: dbConfig.password ? '✅ Set' : '❌ Missing'
    });
    
    // Create connection pool
    pool = new Pool(dbConfig);
    
    console.log('🔄 Connecting to production database...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to database successfully');
    client.release();
    
    // Run migration
    console.log('📜 Executing migration SQL...');
    const result = await pool.query(migrationSQL);
    
    // Check if we got verification results
    if (result.length > 0) {
      const lastResult = result[result.length - 1];
      if (lastResult.rows && lastResult.rows.length > 0) {
        console.log('✅ Column verification:', lastResult.rows[0]);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Additional verification
    const verifyResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'media_resources' 
      AND column_name IN ('external_url', 'file_path')
      ORDER BY column_name
    `);
    
    console.log('🔍 Media resource columns verified:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === '28P01') {
      console.error('🔐 Authentication failed. Check your database credentials.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Database host not found. Check your DB_HOST setting.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection refused. Is the database server running?');
    }
    
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔚 Database connection closed');
    }
  }
}

// Confirm before running in production
if (process.env.NODE_ENV === 'production') {
  console.log('⚠️  Running migration in PRODUCTION environment!');
  console.log('🎯 Target database:', `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  
  // Add a small delay to allow reading the warning
  setTimeout(() => {
    runProductionMigration();
  }, 2000);
} else {
  runProductionMigration();
}