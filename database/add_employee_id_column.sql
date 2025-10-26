-- Migration: Add employee_id column to users table if it doesn't exist
-- Run this on production database

DO $$ 
BEGIN
    -- Check if employee_id column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'employee_id'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN employee_id VARCHAR(50) UNIQUE;
        
        -- Create index if needed
        CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
        
        RAISE NOTICE 'Column employee_id added successfully';
    ELSE
        RAISE NOTICE 'Column employee_id already exists';
    END IF;
END $$;
