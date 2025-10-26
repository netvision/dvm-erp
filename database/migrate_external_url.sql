-- Production Migration: Add external_url column to media_resources
-- 
-- This migration adds the missing external_url column needed for media file uploads
-- Safe to run multiple times (uses IF NOT EXISTS)
--
-- Usage options:
-- 1. Via psql: psql -h your-host -U username -d database_name -f migrate_external_url.sql
-- 2. Via pgAdmin: Copy and paste this content into SQL editor and execute
-- 3. Via database GUI: Run these commands in your database management tool

-- Start transaction for safety
BEGIN;

-- Add the external_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_resources' AND column_name = 'external_url'
    ) THEN
        ALTER TABLE media_resources ADD COLUMN external_url TEXT;
        RAISE NOTICE 'Added external_url column to media_resources table';
    ELSE
        RAISE NOTICE 'external_url column already exists in media_resources table';
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN media_resources.external_url IS 'URL for uploaded media files or external media content (YouTube, Vimeo, etc.)';

-- Verify the column was added successfully
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'media_resources' 
AND column_name = 'external_url';

-- Show success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! The external_url column is now available.';
END $$;

-- Commit the transaction
COMMIT;