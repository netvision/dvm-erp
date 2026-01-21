#!/bin/bash

# Backend Deployment Script for DVM ERP
# Run this on the production server

echo "🚀 Starting backend deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/root/dvm-erp"  # Update this path if different
DB_NAME="library_db"
DB_USER="library_user"

echo -e "${YELLOW}Step 1: Navigating to backend directory...${NC}"
cd "$BACKEND_DIR" || exit 1

echo -e "${YELLOW}Step 2: Pulling latest code from GitHub...${NC}"
git pull origin main

echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}Step 4: Running database migrations...${NC}"
if [ -f "src/migrations/005_add_reservations_table.js" ]; then
    node src/migrations/005_add_reservations_table.js
    echo -e "${GREEN}✓ Migration completed${NC}"
else
    echo -e "${RED}✗ Migration file not found${NC}"
fi

echo -e "${YELLOW}Step 5: Restarting backend service...${NC}"
# Check if PM2 is being used
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo -e "${GREEN}✓ PM2 restarted${NC}"
    pm2 status
    echo ""
    echo -e "${YELLOW}Checking PM2 logs...${NC}"
    pm2 logs --lines 20 --nostream
elif systemctl is-active --quiet dvm-erp; then
    sudo systemctl restart dvm-erp
    sudo systemctl status dvm-erp
    echo -e "${GREEN}✓ Systemd service restarted${NC}"
else
    echo -e "${YELLOW}Manual restart required - no PM2 or systemd service found${NC}"
fi

echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Verifying deployment:${NC}"
echo "1. Check if backend is running: curl http://localhost:3000/api/health"
echo "2. Check database: psql -U $DB_USER -d $DB_NAME -c '\dt'"
echo "3. Check PM2 logs: pm2 logs"
