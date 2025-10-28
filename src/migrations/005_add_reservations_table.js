/**
 * Migration: Add reservations table
 * Purpose: Allow students to reserve books when not available
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function up() {
  console.log('Creating reservations table...');
  
  await query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expiry_date TIMESTAMP,
      fulfilled_date TIMESTAMP,
      cancelled_date TIMESTAMP,
      cancellation_reason TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_status CHECK (status IN ('pending', 'fulfilled', 'cancelled', 'expired'))
    );
  `);

  // Create indexes for better query performance
  await query(`
    CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_book_id ON reservations(book_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
    CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON reservations(reservation_date);
  `);

  // Create trigger to update updated_at timestamp
  await query(`
    CREATE OR REPLACE FUNCTION update_reservations_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trigger_update_reservations_updated_at ON reservations;
    
    CREATE TRIGGER trigger_update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_reservations_updated_at();
  `);

  console.log('Reservations table created successfully');
}

async function down() {
  console.log('Dropping reservations table...');
  
  await query('DROP TRIGGER IF EXISTS trigger_update_reservations_updated_at ON reservations;');
  await query('DROP FUNCTION IF EXISTS update_reservations_updated_at();');
  await query('DROP TABLE IF EXISTS reservations CASCADE;');
  
  console.log('Reservations table dropped successfully');
}

// Run migration if called directly
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { up, down };
