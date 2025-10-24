const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const router = express.Router();

// Setup database endpoint
router.post('/setup', async (req, res) => {
  try {
    console.log('Setting up database schema...');
    
    // Add equipment table
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
    
    // Enhanced schema for digital resources
    const digitalResourcesTable = `
      CREATE TABLE IF NOT EXISTS digital_resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        type VARCHAR(50) NOT NULL, -- e-book, pdf, document, video, audio
        format VARCHAR(20) NOT NULL, -- PDF, EPUB, MP4, MP3, etc.
        file_path VARCHAR(500),
        file_size BIGINT,
        publisher VARCHAR(255),
        publication_date DATE,
        language VARCHAR(50) DEFAULT 'English',
        genre VARCHAR(100),
        subjects TEXT[],
        keywords TEXT[],
        description TEXT,
        content_rating VARCHAR(10),
        reading_level VARCHAR(20),
        download_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        access_level VARCHAR(20) DEFAULT 'student' CHECK (access_level IN ('public', 'student', 'faculty', 'admin')),
        thumbnail_url TEXT,
        cover_image_url TEXT,
        file_size_bytes BIGINT,
        is_drm_protected BOOLEAN DEFAULT FALSE,
        metadata JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_digital_resources_type ON digital_resources(type);
      CREATE INDEX IF NOT EXISTS idx_digital_resources_language ON digital_resources(language);
      CREATE INDEX IF NOT EXISTS idx_digital_resources_access_level ON digital_resources(access_level);
      CREATE INDEX IF NOT EXISTS idx_digital_resources_active ON digital_resources(is_active);
    `;
    
    await pool.query(digitalResourcesTable);
    console.log('✅ Digital resources table created successfully');
    
    // Enhanced media resources table
    const mediaResourcesTable = `
      CREATE TABLE IF NOT EXISTS media_resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL, -- video, audio, documentary, series
        format VARCHAR(20) NOT NULL, -- MP4, AVI, MP3, WAV, etc.
        duration_seconds INTEGER,
        quality VARCHAR(20), -- 1080p, 720p, 480p, etc.
        language VARCHAR(50) DEFAULT 'English',
        author VARCHAR(255),
        narrator VARCHAR(255),
        producer VARCHAR(255),
        publication_date DATE,
        genre VARCHAR(100),
        subjects TEXT[],
        keywords TEXT[],
        content_rating VARCHAR(10),
        age_restriction INTEGER,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        access_level VARCHAR(20) DEFAULT 'student' CHECK (access_level IN ('public', 'student', 'faculty', 'admin')),
        thumbnail_url TEXT,
        preview_url TEXT,
        file_path VARCHAR(500),
        chapters JSONB DEFAULT '[]',
        subtitles_available BOOLEAN DEFAULT FALSE,
        subtitle_languages TEXT[],
        transcript_available BOOLEAN DEFAULT FALSE,
        file_size_bytes BIGINT,
        metadata JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_media_resources_type ON media_resources(type);
      CREATE INDEX IF NOT EXISTS idx_media_resources_language ON media_resources(language);
      CREATE INDEX IF NOT EXISTS idx_media_resources_access_level ON media_resources(access_level);
      CREATE INDEX IF NOT EXISTS idx_media_resources_active ON media_resources(is_active);
    `;
    
    await pool.query(mediaResourcesTable);
    console.log('✅ Media resources table created successfully');
    
    res.json({
      success: true,
      message: 'Database setup completed successfully',
      tables_created: ['equipment', 'digital_resources', 'media_resources'],
      tables_updated: ['books']
    });
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting up database',
      error: error.message
    });
  }
});

module.exports = router;