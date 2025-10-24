-- Enhanced School Library Management System Database Schema
-- Support for Physical Library, Digital E-Library, Media Library, and AI Tools

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- For accent-insensitive search

-- Enhanced Users table with additional preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS 
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
    login_count INTEGER DEFAULT 0;

-- Enhanced Books table with comprehensive metadata
ALTER TABLE books ADD COLUMN IF NOT EXISTS
    edition VARCHAR(50),
    pages INTEGER,
    weight_grams INTEGER,
    dimensions VARCHAR(50), -- "20x15x2 cm"
    condition_status VARCHAR(20) DEFAULT 'excellent' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor')),
    barcode VARCHAR(50) UNIQUE,
    rfid_tag VARCHAR(50) UNIQUE,
    dewey_decimal VARCHAR(20),
    subjects TEXT[], -- Array of subject tags
    keywords TEXT[], -- Array of keywords for search
    reading_level VARCHAR(20),
    content_rating VARCHAR(10), -- G, PG, PG-13, etc.
    cover_image_url TEXT,
    thumbnail_url TEXT,
    summary TEXT,
    table_of_contents TEXT,
    metadata JSONB DEFAULT '{}'; -- Flexible metadata storage

-- Digital Resources table (E-books, PDFs, Documents)
CREATE TABLE IF NOT EXISTS digital_resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('ebook', 'pdf', 'journal', 'article', 'research_paper', 'thesis')),
    format VARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'epub', 'mobi', 'docx', 'html')),
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_hash VARCHAR(64), -- SHA-256 hash for integrity
    isbn VARCHAR(20),
    doi VARCHAR(100), -- Digital Object Identifier
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
    external_url TEXT, -- For resources hosted elsewhere
    thumbnail_url TEXT,
    cover_image_url TEXT,
    metadata JSONB DEFAULT '{}',
    full_text_content TEXT, -- For search indexing
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media Resources table (Audio, Video, Multimedia)
CREATE TABLE IF NOT EXISTS media_resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('audio', 'video', 'podcast', 'lecture', 'audiobook', 'documentary', 'tutorial')),
    format VARCHAR(20) NOT NULL CHECK (format IN ('mp3', 'wav', 'mp4', 'avi', 'mkv', 'webm', 'm4a', 'flac')),
    file_path TEXT,
    external_url TEXT, -- For YouTube, Vimeo, etc.
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    quality VARCHAR(20), -- 720p, 1080p, 4K, etc.
    bitrate INTEGER,
    language VARCHAR(50) DEFAULT 'English',
    subtitles_available BOOLEAN DEFAULT false,
    subtitle_languages TEXT[],
    transcript_available BOOLEAN DEFAULT false,
    transcript_path TEXT,
    author VARCHAR(255),
    narrator VARCHAR(255), -- For audiobooks
    producer VARCHAR(255),
    publication_date DATE,
    genre VARCHAR(100),
    subjects TEXT[],
    keywords TEXT[],
    content_rating VARCHAR(10),
    age_restriction INTEGER, -- Minimum age
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    access_level VARCHAR(20) DEFAULT 'public' CHECK (access_level IN ('public', 'restricted', 'premium', 'faculty_only')),
    thumbnail_url TEXT,
    preview_url TEXT, -- Short preview/trailer
    chapters JSONB DEFAULT '[]', -- Chapter markers
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resource Collections (Playlists, Curated Lists)
CREATE TABLE IF NOT EXISTS resource_collections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('playlist', 'reading_list', 'course_materials', 'recommended', 'featured')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'restricted')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cover_image_url TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collection Items (Links collections to resources)
CREATE TABLE IF NOT EXISTS collection_items (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES resource_collections(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media')),
    resource_id INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Borrow Records with more tracking
ALTER TABLE borrow_records ADD COLUMN IF NOT EXISTS
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
    staff_notes TEXT;

-- Waitlist table for popular books
CREATE TABLE IF NOT EXISTS waitlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media')),
    resource_id INTEGER NOT NULL,
    position_in_queue INTEGER NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'fulfilled', 'expired', 'cancelled'))
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media')),
    resource_id INTEGER NOT NULL,
    reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fines and Penalties
CREATE TABLE IF NOT EXISTS fines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    borrow_record_id INTEGER REFERENCES borrow_records(id) ON DELETE SET NULL,
    fine_type VARCHAR(50) NOT NULL CHECK (fine_type IN ('overdue', 'damage', 'lost', 'late_return', 'replacement')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    assessed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_date DATE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'waived', 'disputed')),
    waived_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    waived_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Digital Access Logs
CREATE TABLE IF NOT EXISTS digital_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    digital_resource_id INTEGER NOT NULL REFERENCES digital_resources(id) ON DELETE CASCADE,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('view', 'download', 'bookmark', 'annotate')),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    session_duration INTEGER, -- in seconds
    pages_viewed INTEGER,
    download_completed BOOLEAN DEFAULT false,
    access_denied_reason TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media Access Logs
CREATE TABLE IF NOT EXISTS media_access_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_resource_id INTEGER NOT NULL REFERENCES media_resources(id) ON DELETE CASCADE,
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('play', 'pause', 'seek', 'complete', 'bookmark')),
    playback_position INTEGER, -- in seconds
    playback_duration INTEGER, -- in seconds
    quality_watched VARCHAR(20),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Reading Progress and Bookmarks
CREATE TABLE IF NOT EXISTS reading_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('digital', 'media')),
    resource_id INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    current_page INTEGER,
    current_position INTEGER, -- For media: seconds, for books: character position
    reading_time_minutes INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB DEFAULT '{}' -- Custom reading data
);

-- Bookmarks and Annotations
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media')),
    resource_id INTEGER NOT NULL,
    bookmark_type VARCHAR(20) DEFAULT 'bookmark' CHECK (bookmark_type IN ('bookmark', 'highlight', 'note', 'favorite')),
    page_number INTEGER,
    position_data JSONB, -- Flexible position storage (page, timestamp, coordinates, etc.)
    content_excerpt TEXT, -- The highlighted/bookmarked text
    user_annotation TEXT,
    color_code VARCHAR(7), -- Hex color for highlights
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Reviews and Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media')),
    resource_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    is_verified_user BOOLEAN DEFAULT false, -- Has actually borrowed/accessed the resource
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI and Analytics tables
CREATE TABLE IF NOT EXISTS search_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    search_type VARCHAR(20) NOT NULL CHECK (search_type IN ('basic', 'advanced', 'ai_assisted', 'voice')),
    filters_applied JSONB,
    results_count INTEGER,
    clicked_result_id INTEGER,
    clicked_result_type VARCHAR(20),
    search_duration_ms INTEGER,
    result_clicked BOOLEAN DEFAULT false,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('chat', 'recommendation', 'summarization', 'translation', 'query_assistance')),
    input_text TEXT,
    output_text TEXT,
    ai_model VARCHAR(100),
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_text TEXT,
    session_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media')),
    resource_id INTEGER NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('similar_content', 'user_based', 'trending', 'ai_generated', 'editorial')),
    relevance_score DECIMAL(3,2),
    reasoning TEXT,
    clicked BOOLEAN DEFAULT false,
    dismissed BOOLEAN DEFAULT false,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Inventory and Audit tables
CREATE TABLE IF NOT EXISTS inventory_audits (
    id SERIAL PRIMARY KEY,
    resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('book', 'digital', 'media')),
    resource_id INTEGER NOT NULL,
    audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN ('annual', 'spot_check', 'damage_assessment', 'missing_items')),
    audited_by INTEGER NOT NULL REFERENCES users(id),
    expected_quantity INTEGER,
    actual_quantity INTEGER,
    condition_assessment TEXT,
    discrepancy_notes TEXT,
    photos_taken BOOLEAN DEFAULT false,
    photo_urls TEXT[],
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'requires_followup')),
    audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notification queue for automated reminders
CREATE TABLE IF NOT EXISTS notification_queue (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('overdue_reminder', 'due_soon', 'waitlist_available', 'reservation_expiring', 'fine_notice')),
    message_title VARCHAR(255) NOT NULL,
    message_body TEXT NOT NULL,
    delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push', 'in_app')),
    delivery_address VARCHAR(255), -- Email, phone number, or device token
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    related_resource_type VARCHAR(20),
    related_resource_id INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- External integrations
CREATE TABLE IF NOT EXISTS external_integrations (
    id SERIAL PRIMARY KEY,
    integration_name VARCHAR(100) NOT NULL,
    integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('database', 'search_engine', 'ai_service', 'payment_gateway', 'notification_service')),
    api_endpoint TEXT,
    api_key_hash VARCHAR(255), -- Encrypted API key
    configuration JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency_hours INTEGER DEFAULT 24,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_title_gin ON books USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_gin ON books USING gin(author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_keywords_gin ON books USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_books_subjects_gin ON books USING gin(subjects);
CREATE INDEX IF NOT EXISTS idx_books_barcode ON books(barcode);
CREATE INDEX IF NOT EXISTS idx_books_rfid ON books(rfid_tag);

CREATE INDEX IF NOT EXISTS idx_digital_resources_title_gin ON digital_resources USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_digital_resources_author_gin ON digital_resources USING gin(author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_digital_resources_keywords_gin ON digital_resources USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_digital_resources_subjects_gin ON digital_resources USING gin(subjects);
CREATE INDEX IF NOT EXISTS idx_digital_resources_full_text_gin ON digital_resources USING gin(full_text_content gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_media_resources_title_gin ON media_resources USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_media_resources_keywords_gin ON media_resources USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_media_resources_subjects_gin ON media_resources USING gin(subjects);

CREATE INDEX IF NOT EXISTS idx_borrow_records_user_id ON borrow_records(user_id);
CREATE INDEX IF NOT EXISTS idx_borrow_records_book_id ON borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_records_due_date ON borrow_records(due_date);
CREATE INDEX IF NOT EXISTS idx_borrow_records_return_date ON borrow_records(return_date);

CREATE INDEX IF NOT EXISTS idx_waitlists_resource ON waitlists(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_waitlists_user_status ON waitlists(user_id, status);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user_resource ON reading_progress(user_id, resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_resource ON bookmarks(user_id, resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query_gin ON search_analytics USING gin(search_query gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user_time ON search_analytics(user_id, searched_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notification_queue(user_id, delivery_status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notification_queue(scheduled_for);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_books_search ON books USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(author,'') || ' ' || coalesce(description,'')));
CREATE INDEX IF NOT EXISTS idx_digital_search ON digital_resources USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(author,'') || ' ' || coalesce(description,'') || ' ' || coalesce(full_text_content,'')));
CREATE INDEX IF NOT EXISTS idx_media_search ON media_resources USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(author,'')));