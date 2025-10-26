-- Add missing external_url column to media_resources table
-- This column is needed for storing URLs of uploaded media files

ALTER TABLE media_resources 
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN media_resources.external_url IS 'URL for uploaded media files or external media content (YouTube, Vimeo, etc.)';

-- Update existing records to handle NULL values gracefully
UPDATE media_resources 
SET external_url = NULL 
WHERE external_url IS NULL;