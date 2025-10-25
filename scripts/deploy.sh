#!/bin/bash

# DVM-ERP Backend Deployment Script
# This script deploys the backend API to your Linode server

set -e  # Exit on error

echo "🚀 Starting DVM-ERP Backend Deployment..."

# Configuration
APP_NAME="dvm-erp-api"
APP_DIR="/var/www/dvm-erp"
REPO_URL="https://github.com/netvision/dvm-erp.git"
NODE_USER="www-data"  # or your preferred user
PORT=3001

echo "📁 Setting up application directory..."
sudo mkdir -p $APP_DIR
cd $APP_DIR

echo "📦 Cloning repository..."
if [ -d ".git" ]; then
    echo "Repository exists, pulling latest changes..."
    sudo git pull origin main
else
    echo "Cloning repository..."
    sudo git clone $REPO_URL .
fi

echo "📦 Installing dependencies..."
sudo npm ci --only=production

echo "📁 Creating logs directory..."
sudo mkdir -p logs
sudo chown -R $NODE_USER:$NODE_USER logs

echo "🔧 Setting up environment..."
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from template..."
    sudo cp .env.production .env
    echo "⚠️  Please edit .env file with your production settings!"
fi

echo "🗄️  Setting up database..."
# Run database migrations
if [ -f ".env" ]; then
    echo "Running database migrations..."
    node scripts/migrate-database.js
else
    echo "⚠️  .env file not found! Please run setup-production-database.sh first"
    echo "Then run: node scripts/migrate-database.js"
fi

echo "🏗️  Building application (if needed)..."
# Add any build steps here if required

echo "🔄 Managing PM2 processes..."
# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Stop existing process if running
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Start the application
echo "🚀 Starting application..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 startup script (run once)
echo "Setting up PM2 startup script..."
pm2 startup systemd -u $NODE_USER --hp /home/$NODE_USER

echo "🔒 Setting up file permissions..."
sudo chown -R $NODE_USER:$NODE_USER $APP_DIR
sudo chmod +x $APP_DIR/scripts/deploy.sh

echo "✅ Deployment completed!"
echo "🌐 API should be running on port $PORT"
echo "📊 Check status with: pm2 status"
echo "📋 View logs with: pm2 logs $APP_NAME"
echo ""
echo "⚠️  Next steps:"
echo "1. Configure your .env file with production settings"
echo "2. Set up nginx reverse proxy for port $PORT"
echo "3. Configure SSL certificates if needed"
echo "4. Set up database and run migrations"