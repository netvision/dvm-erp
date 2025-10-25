#!/bin/bash

# Production Database Setup for Existing PostgreSQL Instance
# This script safely adds DVM-ERP database to an existing PostgreSQL server

set -e  # Exit on error

echo "🗄️  DVM-ERP Database Setup for Existing PostgreSQL Instance"
echo "============================================================"

# Configuration - EDIT THESE VALUES
DB_NAME="${DB_NAME:-dvm_erp_prod}"
DB_USER="${DB_USER:-dvm_user}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32)}"  # Generate secure password
POSTGRES_ADMIN_USER="${POSTGRES_ADMIN_USER:-postgres}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Configuration:${NC}"
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo "Generated Password: $DB_PASSWORD"
echo "PostgreSQL Admin: $POSTGRES_ADMIN_USER"
echo ""

# Function to run SQL as postgres admin
run_sql_as_admin() {
    sudo -u $POSTGRES_ADMIN_USER psql -c "$1"
}

# Function to run SQL on specific database
run_sql_on_db() {
    sudo -u $POSTGRES_ADMIN_USER psql -d "$1" -c "$2"
}

echo -e "${YELLOW}⚠️  IMPORTANT: Save these credentials!${NC}"
echo "You'll need them in your .env file:"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"  
echo "DB_PASSWORD=$DB_PASSWORD"
echo ""

read -p "Press Enter to continue or Ctrl+C to abort..."

# Check if database already exists
echo -e "${BLUE}🔍 Checking if database exists...${NC}"
if sudo -u $POSTGRES_ADMIN_USER psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists!${NC}"
    read -p "Do you want to continue? This will update the schema. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
else
    echo -e "${GREEN}✅ Database '$DB_NAME' does not exist. Will create it.${NC}"
fi

# Check if user already exists
echo -e "${BLUE}🔍 Checking if user exists...${NC}"
if sudo -u $POSTGRES_ADMIN_USER psql -t -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo -e "${YELLOW}⚠️  User '$DB_USER' already exists. Will update permissions.${NC}"
    USER_EXISTS=true
else
    echo -e "${GREEN}✅ User '$DB_USER' does not exist. Will create it.${NC}"
    USER_EXISTS=false
fi

# Create user if it doesn't exist
if [ "$USER_EXISTS" = false ]; then
    echo -e "${BLUE}👤 Creating database user...${NC}"
    run_sql_as_admin "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo -e "${GREEN}✅ User created successfully${NC}"
else
    echo -e "${BLUE}👤 Updating user password...${NC}"
    run_sql_as_admin "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo -e "${GREEN}✅ User password updated${NC}"
fi

# Create database if it doesn't exist
if ! sudo -u $POSTGRES_ADMIN_USER psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${BLUE}🗄️  Creating database...${NC}"
    run_sql_as_admin "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    echo -e "${GREEN}✅ Database created successfully${NC}"
fi

# Grant privileges
echo -e "${BLUE}🔐 Setting up permissions...${NC}"
run_sql_as_admin "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Connect to the database and set schema privileges
run_sql_on_db "$DB_NAME" "GRANT ALL ON SCHEMA public TO $DB_USER;"
run_sql_on_db "$DB_NAME" "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
run_sql_on_db "$DB_NAME" "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
run_sql_on_db "$DB_NAME" "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
run_sql_on_db "$DB_NAME" "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"

echo -e "${GREEN}✅ Permissions configured successfully${NC}"

# Create .env file with credentials
echo -e "${BLUE}📝 Creating .env file...${NC}"
cat > .env << EOF
# Production Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT Configuration - CHANGE THIS IN PRODUCTION!
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration - UPDATE WITH YOUR NETLIFY URL
FRONTEND_URL=https://your-app.netlify.app
ALLOWED_ORIGINS=https://your-app.netlify.app

# Security
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
EOF

echo -e "${GREEN}✅ .env file created${NC}"

echo ""
echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Review and update the .env file with your production settings"
echo "2. Run database migrations: node scripts/migrate-database.js"
echo "3. Deploy your application: ./scripts/deploy.sh"
echo ""
echo -e "${BLUE}📋 Database Connection Details:${NC}"
echo "Host: localhost"
echo "Port: 5432"
echo "Database: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASSWORD"