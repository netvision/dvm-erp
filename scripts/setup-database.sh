#!/bin/bash

# Production Database Setup Script
# Run this on your Linode server to set up the database

set -e

echo "🗄️  Setting up DVM-ERP Production Database..."

# Database configuration
DB_NAME="dvm_erp_prod"
DB_USER="dvm_user"
DB_PASSWORD="$(openssl rand -base64 32)"  # Generate secure password

echo "📋 Database Details:"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo "Generated Password: $DB_PASSWORD"
echo ""
echo "⚠️  SAVE THESE CREDENTIALS! You'll need them in your .env file"
echo ""

# Create database user and database
sudo -u postgres psql << EOF
-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the new database
\c $DB_NAME

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

EOF

echo "✅ Database setup completed!"
echo ""
echo "📝 Update your .env file with these credentials:"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"
echo ""
echo "🚀 Next step: Run database migrations from your app directory:"
echo "cd /var/www/dvm-erp && node setup_database.js"