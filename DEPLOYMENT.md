# 🚀 Deployment Guide

This guide will help you deploy the DVM-ERP system to production with backend on Linode and frontend on Netlify.

## 📋 Prerequisites

- Linode server with Ubuntu/Debian
- Node.js 18+ installed on server
- PostgreSQL installed on server
- Nginx installed on server
- PM2 installed globally: `npm install -g pm2`
- Git installed on server
- Netlify account
- Domain name (optional but recommended)

## 🖥️ Backend Deployment (Linode Server)

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (if not already installed)
sudo apt install nginx -y
```

### 2. Database Setup

```bash
# Run the database setup script
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh

# Save the generated credentials!
```

### 3. Deploy Backend Application

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### 4. Configure Environment Variables

Edit `/var/www/dvm-erp/.env` with your production values:

```bash
sudo nano /var/www/dvm-erp/.env
```

Update these key values:
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (from step 2)
- `JWT_SECRET` (generate a secure random string)
- `FRONTEND_URL` (your Netlify URL)

### 5. Setup Nginx Reverse Proxy

```bash
# Copy nginx configuration
sudo cp /var/www/dvm-erp/configs/nginx-dvm-erp-api.conf /etc/nginx/sites-available/dvm-erp-api

# Edit the configuration
sudo nano /etc/nginx/sites-available/dvm-erp-api
# Update server_name with your domain or IP

# Enable the site
sudo ln -s /etc/nginx/sites-available/dvm-erp-api /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 6. Setup Database Schema

```bash
cd /var/www/dvm-erp
node setup_database.js
```

### 7. Start Application

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Follow the instructions to setup auto-start
```

## 🌐 Frontend Deployment (Netlify)

### 1. Prepare Repository

Push all changes to GitHub:

```bash
git add .
git commit -m "feat: Add production deployment configuration"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Netlify Dashboard
1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

#### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from frontend directory
cd frontend
netlify init
netlify deploy --prod
```

### 3. Configure Environment Variables

In Netlify dashboard, go to:
**Site settings** → **Environment variables**

Add these variables:
```
VITE_API_BASE_URL=https://yourdomain.com  # Your Linode server URL
VITE_APP_ENV=production
VITE_APP_NAME=DVM Library Management System
VITE_APP_VERSION=1.0.0
```

### 4. Update CORS Settings

Update your backend `.env` file to include the Netlify URL:

```bash
FRONTEND_URL=https://your-app-name.netlify.app
ALLOWED_ORIGINS=https://your-app-name.netlify.app,https://your-custom-domain.com
```

Restart your backend:
```bash
pm2 restart dvm-erp-api
```

## 🔒 SSL/HTTPS Setup (Recommended)

### Backend (Linode)

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is setup automatically
```

### Frontend (Netlify)

Netlify provides free SSL automatically. If using a custom domain:

1. Go to **Domain settings** in Netlify
2. Add your custom domain
3. SSL certificate will be provisioned automatically

## 🔧 Post-Deployment

### Monitoring

```bash
# Check application status
pm2 status

# View logs
pm2 logs dvm-erp-api

# Monitor system resources
pm2 monit
```

### Testing

1. **Backend API**: Visit `https://yourdomain.com/api/health`
2. **Frontend**: Visit your Netlify URL
3. **Test login**: Try logging in with admin credentials
4. **Test features**: Verify all sections work correctly

## 🔄 Continuous Deployment

### Auto-deploy Backend

Create a webhook in GitHub that runs:

```bash
cd /var/www/dvm-erp
git pull origin main
npm ci --only=production
pm2 restart dvm-erp-api
```

### Auto-deploy Frontend

Netlify automatically redeploys when you push to your main branch.

## 🚨 Troubleshooting

### Common Issues

1. **CORS errors**: Check `FRONTEND_URL` in backend `.env`
2. **Database connection**: Verify database credentials
3. **Port conflicts**: Ensure port 3001 is available
4. **PM2 not starting**: Check logs with `pm2 logs`
5. **Nginx errors**: Check `/var/log/nginx/error.log`

### Health Checks

- Backend: `curl https://yourdomain.com/api/health`
- Database: `pm2 logs dvm-erp-api | grep "Connected to PostgreSQL"`
- Nginx: `sudo nginx -t`

## 📝 Maintenance

### Regular Tasks

1. **Update dependencies**: `npm update` (test in staging first)
2. **Database backups**: Setup automated PostgreSQL backups
3. **Log rotation**: Configure log rotation for PM2 logs
4. **Security updates**: Keep server OS updated

### Scaling

- **Horizontal**: Add more PM2 instances in `ecosystem.config.js`
- **Vertical**: Upgrade Linode server resources
- **Database**: Consider connection pooling for high traffic

---

🎉 **Congratulations!** Your DVM-ERP system is now deployed and ready for production use!