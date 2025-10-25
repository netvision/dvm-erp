const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Database configuration from environment
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    log('✅ Database connection successful', 'green');
    log(`Connected at: ${result.rows[0].now}`, 'cyan');
    return true;
  } catch (error) {
    log('❌ Database connection failed:', 'red');
    log(error.message, 'red');
    return false;
  }
}

async function createExtensions() {
  log('\n📦 Creating required extensions...', 'blue');
  
  const extensions = [
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    'CREATE EXTENSION IF NOT EXISTS "pg_trgm";', // For fuzzy text search
    'CREATE EXTENSION IF NOT EXISTS "unaccent";' // For accent-insensitive search
  ];

  try {
    for (const extension of extensions) {
      await pool.query(extension);
    }
    log('✅ Extensions created successfully', 'green');
  } catch (error) {
    log('❌ Error creating extensions:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function createBaseTables() {
  log('\n🏗️  Creating base tables...', 'blue');

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'librarian', 'admin')),
      phone VARCHAR(20),
      address TEXT,
      grade_level VARCHAR(20),
      department VARCHAR(100),
      student_id VARCHAR(50) UNIQUE,
      faculty_id VARCHAR(50) UNIQUE,
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      verification_token VARCHAR(255),
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP WITH TIME ZONE,
      profile_picture_url TEXT,
      preferences JSONB DEFAULT '{}',
      reading_preferences JSONB DEFAULT '{}',
      notification_preferences JSONB DEFAULT '{
        "email": true,
        "sms": false,
        "push": true,
        "reminder_days": [1, 3, 7]
      }',
      accessibility_settings JSONB DEFAULT '{
        "text_size": "medium",
        "theme": "light",
        "text_to_speech": false,
        "screen_reader": false
      }',
      last_login TIMESTAMP WITH TIME ZONE,
      login_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
    CREATE INDEX IF NOT EXISTS idx_users_faculty_id ON users(faculty_id);
  `;

  const createBooksTable = `
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      isbn VARCHAR(20) UNIQUE,
      publisher VARCHAR(255),
      publication_year INTEGER,
      edition VARCHAR(50),
      pages INTEGER,
      weight_grams INTEGER,
      dimensions VARCHAR(50),
      language VARCHAR(50) DEFAULT 'English',
      genre VARCHAR(100),
      description TEXT,
      summary TEXT,
      table_of_contents TEXT,
      cover_image_url TEXT,
      thumbnail_url TEXT,
      total_copies INTEGER DEFAULT 1,
      available_copies INTEGER DEFAULT 1,
      location VARCHAR(100) DEFAULT 'Main Library',
      condition_status VARCHAR(20) DEFAULT 'excellent' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor')),
      barcode VARCHAR(50) UNIQUE,
      rfid_tag VARCHAR(50) UNIQUE,
      dewey_decimal VARCHAR(20),
      subjects TEXT[],
      keywords TEXT[],
      reading_level VARCHAR(20),
      content_rating VARCHAR(10),
      metadata JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_books_title_gin ON books USING gin(title gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_books_author_gin ON books USING gin(author gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
    CREATE INDEX IF NOT EXISTS idx_books_barcode ON books(barcode);
    CREATE INDEX IF NOT EXISTS idx_books_keywords_gin ON books USING gin(keywords);
    CREATE INDEX IF NOT EXISTS idx_books_subjects_gin ON books USING gin(subjects);
  `;

  const createBorrowRecordsTable = `
    CREATE TABLE IF NOT EXISTS borrow_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
      due_date DATE NOT NULL,
      return_date DATE,
      returned BOOLEAN DEFAULT false,
      condition_on_borrow VARCHAR(20) DEFAULT 'excellent',
      condition_on_return VARCHAR(20),
      return_condition_notes TEXT,
      barcode_scanned_out BOOLEAN DEFAULT false,
      barcode_scanned_in BOOLEAN DEFAULT false,
      auto_renewal_count INTEGER DEFAULT 0,
      max_renewals INTEGER DEFAULT 3,
      reminder_sent_count INTEGER DEFAULT 0,
      last_reminder_sent TIMESTAMP WITH TIME ZONE,
      checkout_method VARCHAR(20) DEFAULT 'manual' CHECK (checkout_method IN ('manual', 'barcode', 'rfid', 'self_service')),
      return_method VARCHAR(20) CHECK (return_method IN ('manual', 'barcode', 'rfid', 'self_service', 'book_drop')),
      staff_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_borrow_records_user_id ON borrow_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_borrow_records_book_id ON borrow_records(book_id);
    CREATE INDEX IF NOT EXISTS idx_borrow_records_due_date ON borrow_records(due_date);
    CREATE INDEX IF NOT EXISTS idx_borrow_records_return_date ON borrow_records(return_date);
  `;

  const createBookmarksTable = `
    CREATE TABLE IF NOT EXISTS bookmarks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media')),
      resource_id INTEGER NOT NULL,
      bookmark_type VARCHAR(20) DEFAULT 'bookmark' CHECK (bookmark_type IN ('bookmark', 'highlight', 'note', 'favorite')),
      page_number INTEGER,
      position_data JSONB,
      content_excerpt TEXT,
      user_annotation TEXT,
      color_code VARCHAR(7),
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_resource ON bookmarks(user_id, resource_type, resource_id);
  `;

  try {
    await pool.query(createUsersTable);
    log('✅ Users table created', 'green');
    
    await pool.query(createBooksTable);
    log('✅ Books table created', 'green');
    
    await pool.query(createBorrowRecordsTable);
    log('✅ Borrow records table created', 'green');
    
    await pool.query(createBookmarksTable);
    log('✅ Bookmarks table created', 'green');
  } catch (error) {
    log('❌ Error creating base tables:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function createDigitalResourcesTables() {
  log('\n📚 Creating digital resources tables...', 'blue');

  const createDigitalResourcesTable = `
    CREATE TABLE IF NOT EXISTS digital_resources (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255),
      type VARCHAR(50) NOT NULL CHECK (type IN ('ebook', 'pdf', 'journal', 'article', 'research_paper', 'thesis')),
      format VARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'epub', 'mobi', 'docx', 'html')),
      file_path TEXT,
      external_url TEXT,
      file_size_bytes BIGINT,
      file_hash VARCHAR(64),
      isbn VARCHAR(20),
      doi VARCHAR(100),
      publisher VARCHAR(255),
      publication_date DATE,
      language VARCHAR(50) DEFAULT 'English',
      genre VARCHAR(100),
      subjects TEXT[],
      keywords TEXT[],
      description TEXT,
      abstract TEXT,
      content_rating VARCHAR(10),
      reading_level VARCHAR(20),
      download_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      is_drm_protected BOOLEAN DEFAULT false,
      drm_settings JSONB DEFAULT '{}',
      access_level VARCHAR(20) DEFAULT 'public' CHECK (access_level IN ('public', 'restricted', 'premium', 'faculty_only')),
      thumbnail_url TEXT,
      cover_image_url TEXT,
      metadata JSONB DEFAULT '{}',
      full_text_content TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_digital_resources_title_gin ON digital_resources USING gin(title gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_digital_resources_author_gin ON digital_resources USING gin(author gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_digital_resources_keywords_gin ON digital_resources USING gin(keywords);
    CREATE INDEX IF NOT EXISTS idx_digital_resources_subjects_gin ON digital_resources USING gin(subjects);
    CREATE INDEX IF NOT EXISTS idx_digital_resources_type ON digital_resources(type);
  `;

  try {
    await pool.query(createDigitalResourcesTable);
    log('✅ Digital resources table created', 'green');
  } catch (error) {
    log('❌ Error creating digital resources table:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function createMediaResourcesTables() {
  log('\n🎵 Creating media resources tables...', 'blue');

  const createMediaResourcesTable = `
    CREATE TABLE IF NOT EXISTS media_resources (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL CHECK (type IN ('audio', 'video', 'podcast', 'lecture', 'audiobook', 'documentary', 'tutorial')),
      format VARCHAR(20) NOT NULL CHECK (format IN ('mp3', 'wav', 'mp4', 'avi', 'mkv', 'webm', 'm4a', 'flac')),
      file_path TEXT,
      external_url TEXT,
      file_size_bytes BIGINT,
      duration_seconds INTEGER,
      quality VARCHAR(20),
      bitrate INTEGER,
      language VARCHAR(50) DEFAULT 'English',
      subtitles_available BOOLEAN DEFAULT false,
      subtitle_languages TEXT[],
      transcript_available BOOLEAN DEFAULT false,
      transcript_path TEXT,
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
      access_level VARCHAR(20) DEFAULT 'public' CHECK (access_level IN ('public', 'restricted', 'premium', 'faculty_only')),
      thumbnail_url TEXT,
      preview_url TEXT,
      chapters JSONB DEFAULT '[]',
      metadata JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_media_resources_title_gin ON media_resources USING gin(title gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_media_resources_type ON media_resources(type);
    CREATE INDEX IF NOT EXISTS idx_media_resources_keywords_gin ON media_resources USING gin(keywords);
  `;

  try {
    await pool.query(createMediaResourcesTable);
    log('✅ Media resources table created', 'green');
  } catch (error) {
    log('❌ Error creating media resources table:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function createEquipmentTable() {
  log('\n🖥️  Creating equipment table...', 'blue');

  const createEquipmentTable = `
    CREATE TABLE IF NOT EXISTS equipment (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL CHECK (category IN ('projector', 'laptop', 'tablet', 'camera', 'microphone', 'speaker', 'monitor', 'printer', 'scanner', 'other')),
      brand VARCHAR(100),
      model VARCHAR(100),
      serial_number VARCHAR(100) UNIQUE,
      asset_tag VARCHAR(50) UNIQUE,
      status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'maintenance', 'damaged', 'retired')),
      condition VARCHAR(20) DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
      location VARCHAR(100) DEFAULT 'Main Library',
      purchase_date DATE,
      warranty_until DATE,
      purchase_price DECIMAL(10,2),
      current_value DECIMAL(10,2),
      description TEXT,
      specifications JSONB DEFAULT '{}',
      maintenance_schedule JSONB DEFAULT '{}',
      accessories TEXT[],
      manuals TEXT[],
      qr_code VARCHAR(255),
      barcode VARCHAR(255),
      checkout_duration_hours INTEGER DEFAULT 24,
      max_checkout_duration_hours INTEGER DEFAULT 168, -- 1 week
      requires_approval BOOLEAN DEFAULT false,
      metadata JSONB DEFAULT '{}',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
    CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
    CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number);
    CREATE INDEX IF NOT EXISTS idx_equipment_asset_tag ON equipment(asset_tag);
  `;

  const createEquipmentCheckoutTable = `
    CREATE TABLE IF NOT EXISTS equipment_checkouts (
      id SERIAL PRIMARY KEY,
      equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      checked_out_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      due_back_at TIMESTAMP WITH TIME ZONE NOT NULL,
      checked_in_at TIMESTAMP WITH TIME ZONE,
      condition_on_checkout VARCHAR(20) DEFAULT 'excellent',
      condition_on_return VARCHAR(20),
      checkout_notes TEXT,
      return_notes TEXT,
      approved_by INTEGER REFERENCES users(id),
      approved_at TIMESTAMP WITH TIME ZONE,
      late_fees DECIMAL(10,2) DEFAULT 0.00,
      damage_fees DECIMAL(10,2) DEFAULT 0.00,
      is_returned BOOLEAN DEFAULT false,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_equipment ON equipment_checkouts(equipment_id);
    CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_user ON equipment_checkouts(user_id);
    CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_due ON equipment_checkouts(due_back_at);
  `;

  try {
    await pool.query(createEquipmentTable);
    log('✅ Equipment table created', 'green');
    
    await pool.query(createEquipmentCheckoutTable);
    log('✅ Equipment checkouts table created', 'green');
  } catch (error) {
    log('❌ Error creating equipment tables:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function createAnalyticsTables() {
  log('\n📊 Creating analytics tables...', 'blue');

  const createSearchAnalyticsTable = `
    CREATE TABLE IF NOT EXISTS search_analytics (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      search_query TEXT NOT NULL,
      search_type VARCHAR(20) NOT NULL CHECK (search_type IN ('basic', 'advanced', 'filter', 'barcode')),
      resource_type VARCHAR(20) CHECK (resource_type IN ('book', 'digital', 'media', 'equipment', 'all')),
      filters_applied JSONB DEFAULT '{}',
      results_count INTEGER DEFAULT 0,
      clicked_result_id INTEGER,
      clicked_result_type VARCHAR(20),
      search_duration_ms INTEGER,
      result_clicked BOOLEAN DEFAULT false,
      session_id UUID,
      ip_address INET,
      user_agent TEXT,
      searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_search_analytics_query_gin ON search_analytics USING gin(search_query gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_search_analytics_user_time ON search_analytics(user_id, searched_at);
  `;

  const createAccessLogsTable = `
    CREATE TABLE IF NOT EXISTS resource_access_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media', 'equipment')),
      resource_id INTEGER NOT NULL,
      access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('view', 'download', 'borrow', 'checkout', 'bookmark', 'review')),
      device_info JSONB DEFAULT '{}',
      ip_address INET,
      user_agent TEXT,
      session_duration INTEGER,
      metadata JSONB DEFAULT '{}',
      accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_access_logs_user_resource ON resource_access_logs(user_id, resource_type, resource_id);
    CREATE INDEX IF NOT EXISTS idx_access_logs_time ON resource_access_logs(accessed_at);
  `;

  try {
    await pool.query(createSearchAnalyticsTable);
    log('✅ Search analytics table created', 'green');
    
    await pool.query(createAccessLogsTable);
    log('✅ Access logs table created', 'green');
  } catch (error) {
    log('❌ Error creating analytics tables:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function createNotificationTables() {
  log('\n🔔 Creating notification tables...', 'blue');

  const createNotificationQueueTable = `
    CREATE TABLE IF NOT EXISTS notification_queue (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('overdue_reminder', 'due_soon', 'available', 'reservation_expiring', 'fine_notice', 'system_message')),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push', 'in_app')),
      delivery_address VARCHAR(255),
      priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
      scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      sent_at TIMESTAMP WITH TIME ZONE,
      delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      related_resource_type VARCHAR(20),
      related_resource_id INTEGER,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notification_queue(user_id, delivery_status);
    CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notification_queue(scheduled_for);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notification_queue(notification_type);
  `;

  try {
    await pool.query(createNotificationQueueTable);
    log('✅ Notification queue table created', 'green');
  } catch (error) {
    log('❌ Error creating notification tables:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function createFullTextSearchIndexes() {
  log('\n🔍 Creating full-text search indexes...', 'blue');

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_books_search 
     ON books USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(author,'') || ' ' || coalesce(description,'')));`,
     
    `CREATE INDEX IF NOT EXISTS idx_digital_search 
     ON digital_resources USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(author,'') || ' ' || coalesce(description,'')));`,
     
    `CREATE INDEX IF NOT EXISTS idx_media_search 
     ON media_resources USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(author,'')));`,
     
    `CREATE INDEX IF NOT EXISTS idx_equipment_search 
     ON equipment USING gin(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(model,'')));`
  ];

  try {
    for (const index of indexes) {
      await pool.query(index);
    }
    log('✅ Full-text search indexes created', 'green');
  } catch (error) {
    log('❌ Error creating search indexes:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function createDefaultAdmin() {
  log('\n👑 Creating default admin user...', 'blue');

  const bcrypt = require('bcrypt');
  const saltRounds = 12;
  const defaultPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  const createAdminQuery = `
    INSERT INTO users (
      first_name, last_name, email, password_hash, role, 
      is_active, email_verified
    ) VALUES (
      'System', 'Administrator', 'admin@school.edu', $1, 'admin', 
      true, true
    ) 
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      role = 'admin',
      updated_at = CURRENT_TIMESTAMP;
  `;

  try {
    await pool.query(createAdminQuery, [hashedPassword]);
    log('✅ Default admin user created/updated', 'green');
    log('📧 Email: admin@school.edu', 'cyan');
    log('🔑 Password: admin123', 'cyan');
    log('⚠️  Please change the password after first login!', 'yellow');
  } catch (error) {
    log('❌ Error creating admin user:', 'red');
    log(error.message, 'red');
    throw error;
  }
}

async function insertSampleData() {
  log('\n📚 Inserting sample data...', 'blue');

  const sampleBooks = `
    INSERT INTO books (title, author, isbn, publisher, publication_year, genre, description, total_copies, available_copies, location)
    VALUES 
      ('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Scribner', 1925, 'Classic Literature', 'A classic American novel set in the Jazz Age.', 3, 3, 'Fiction Section'),
      ('To Kill a Mockingbird', 'Harper Lee', '9780446310789', 'Harper Perennial', 1960, 'Classic Literature', 'A gripping tale of racial injustice and childhood innocence.', 2, 2, 'Fiction Section'),
      ('1984', 'George Orwell', '9780451524935', 'Signet Classic', 1949, 'Dystopian Fiction', 'A dystopian social science fiction novel and cautionary tale.', 4, 4, 'Science Fiction Section'),
      ('Pride and Prejudice', 'Jane Austen', '9780141439518', 'Penguin Classics', 1813, 'Romance', 'A romantic novel of manners set in Georgian England.', 2, 2, 'Romance Section'),
      ('The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 'Little Brown', 1951, 'Coming of Age', 'A controversial novel about teenage rebellion and alienation.', 3, 3, 'Fiction Section')
    ON CONFLICT (isbn) DO NOTHING;
  `;

  const sampleDigitalResources = `
    INSERT INTO digital_resources (title, author, type, format, external_url, publisher, publication_date, description, access_level)
    VALUES
      ('Introduction to Computer Science', 'John Smith', 'ebook', 'pdf', 'https://example.com/cs101.pdf', 'Tech Publications', '2023-01-01', 'Comprehensive guide to computer science fundamentals.', 'public'),
      ('Advanced Mathematics', 'Jane Doe', 'ebook', 'epub', 'https://example.com/math-advanced.epub', 'Academic Press', '2022-09-15', 'Advanced mathematical concepts for higher education.', 'faculty_only'),
      ('History of Art', 'Robert Johnson', 'pdf', 'pdf', 'https://example.com/art-history.pdf', 'Cultural Studies Press', '2023-03-20', 'Comprehensive overview of art through the ages.', 'public')
    ON CONFLICT DO NOTHING;
  `;

  const sampleMediaResources = `
    INSERT INTO media_resources (title, type, format, external_url, description, language, duration_seconds, access_level)
    VALUES
      ('Introduction to Physics Lecture 1', 'lecture', 'mp4', 'https://youtube.com/watch?v=example1', 'First lecture in introductory physics series.', 'English', 3600, 'public'),
      ('Shakespeare Audiobook Collection', 'audiobook', 'mp3', 'https://example.com/shakespeare.mp3', 'Complete collection of Shakespeare works in audio format.', 'English', 36000, 'public'),
      ('Documentary: Climate Change', 'documentary', 'mp4', 'https://vimeo.com/example', 'Educational documentary about climate change impacts.', 'English', 5400, 'public')
    ON CONFLICT DO NOTHING;
  `;

  const sampleEquipment = `
    INSERT INTO equipment (name, category, brand, model, serial_number, status, condition, location, description)
    VALUES
      ('Portable Projector #1', 'projector', 'Epson', 'EB-X41', 'EP001234567', 'available', 'excellent', 'Media Center', 'High-resolution portable projector for presentations'),
      ('Student Laptop #1', 'laptop', 'Dell', 'Latitude 3420', 'DL001234567', 'available', 'good', 'IT Equipment Room', 'Standard laptop for student use'),
      ('iPad Pro #1', 'tablet', 'Apple', 'iPad Pro 12.9"', 'AP001234567', 'available', 'excellent', 'Media Center', 'Professional tablet for digital media projects'),
      ('DSLR Camera #1', 'camera', 'Canon', 'EOS Rebel T8i', 'CN001234567', 'available', 'excellent', 'Photography Lab', 'Digital SLR camera for photography courses')
    ON CONFLICT (serial_number) DO NOTHING;
  `;

  try {
    await pool.query(sampleBooks);
    log('✅ Sample books inserted', 'green');
    
    await pool.query(sampleDigitalResources);
    log('✅ Sample digital resources inserted', 'green');
    
    await pool.query(sampleMediaResources);
    log('✅ Sample media resources inserted', 'green');
    
    await pool.query(sampleEquipment);
    log('✅ Sample equipment inserted', 'green');
  } catch (error) {
    log('❌ Error inserting sample data:', 'red');
    log(error.message, 'red');
    // Don't throw error for sample data - it's not critical
  }
}

async function runMigration() {
  log('🚀 DVM-ERP Database Migration Starting...', 'bright');
  log('=====================================', 'bright');

  try {
    // Check database connection
    const connected = await checkConnection();
    if (!connected) {
      process.exit(1);
    }

    // Run migrations in order
    await createExtensions();
    await createBaseTables();
    await createDigitalResourcesTables();
    await createMediaResourcesTables();
    await createEquipmentTable();
    await createAnalyticsTables();
    await createNotificationTables();
    await createFullTextSearchIndexes();
    await createDefaultAdmin();
    await insertSampleData();

    log('\n🎉 Database migration completed successfully!', 'green');
    log('=====================================', 'bright');
    log('Your DVM-ERP database is ready to use.', 'cyan');
    log('\n📋 What was created:', 'blue');
    log('• Base tables (users, books, borrow_records, bookmarks)', 'cyan');
    log('• Digital resources management', 'cyan');
    log('• Media resources management', 'cyan');
    log('• Equipment tracking system', 'cyan');
    log('• Analytics and logging', 'cyan');
    log('• Notification system', 'cyan');
    log('• Full-text search indexes', 'cyan');
    log('• Sample data for testing', 'cyan');
    log('\n🔐 Default admin credentials:', 'yellow');
    log('Email: admin@school.edu', 'yellow');
    log('Password: admin123', 'yellow');
    log('⚠️  Please change the password after first login!', 'red');

  } catch (error) {
    log('❌ Migration failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };