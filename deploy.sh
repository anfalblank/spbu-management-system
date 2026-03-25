#!/bin/bash

# SPBU Management System - Deployment Script
# Run this script on your VPS as root or with sudo

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="anfalhidayat.web.id"
VPS_IP="43.157.213.54"
APP_DIR="/var/www/spbu-management-system"
REPO_URL="https://github.com/anfalblank/spbu-management-system.git"
NODE_VERSION="20"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SPBU Management System Deployment  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Domain: $DOMAIN"
echo "VPS IP: $VPS_IP"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Step 1: Update System
echo -e "\n${YELLOW}[1/10] Updating system...${NC}"
apt update && apt upgrade -y

# Step 2: Install Dependencies
echo -e "\n${YELLOW}[2/10] Installing dependencies...${NC}"

# Install Node.js
echo "Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Verify Node.js installation
NODE_VERSION_CHECK=$(node -v)
echo "Node.js installed: $NODE_VERSION_CHECK"

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
apt install -y nginx

# Install Git
echo "Installing Git..."
apt install -y git

# Install Certbot for SSL
echo "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Install UFW firewall
echo "Installing UFW..."
apt install -y ufw

# Step 3: Setup Application Directory
echo -e "\n${YELLOW}[3/10] Setting up application directory...${NC}"
mkdir -p /var/www
cd /var/www

# Step 4: Clone Repository
echo -e "\n${YELLOW}[4/10] Cloning repository...${NC}"
if [ -d "$APP_DIR" ]; then
  echo "Directory exists, pulling latest changes..."
  cd $APP_DIR
  git pull origin main
else
  echo "Cloning repository..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Step 5: Install Dependencies
echo -e "\n${YELLOW}[5/10] Installing Node dependencies...${NC}"
npm install

# Step 6: Create Environment File
echo -e "\n${YELLOW}[6/10] Creating environment configuration...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
  cat > $APP_DIR/.env << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$DOMAIN

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY_IN=7d

# Notification Channels (Optional)
# WHATSAPP_API_KEY=your-whatsapp-api-key
# EMAIL_FROM=noreply@$DOMAIN
EOF
  echo ".env file created"
else
  echo ".env file already exists, skipping..."
fi

# Step 7: Build Application
echo -e "\n${YELLOW}[7/10] Building application...${NC}"
npm run build

# Step 8: Setup PM2
echo -e "\n${YELLOW}[8/10] Setting up PM2...${NC}"

# Create ecosystem config
cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'spbu-management-system',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/spbu-management-system',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/spbu-app/error.log',
    out_file: '/var/log/spbu-app/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# Create log directory
mkdir -p /var/log/spbu-app

# Start application with PM2
pm2 start $APP_DIR/ecosystem.config.js
pm2 save
pm2 startup systemd

# Step 9: Configure Nginx
echo -e "\n${YELLOW}[9/10] Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/spbu-management-system << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Log files
    access_log /var/log/nginx/spbu-app-access.log;
    error_log /var/log/nginx/spbu-app-error.log;

    # Reverse proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/spbu-management-system /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Step 10: Configure Firewall
echo -e "\n${YELLOW}[10/10] Configuring firewall...${NC}"

# Reset UFW to default
ufw --force reset

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Configure SSL with Let's Encrypt
echo -e "\n${GREEN}Setting up SSL certificate...${NC}"
echo "Note: Make sure DNS is already configured before running certbot"
echo "DNS A record: $DOMAIN -> $VPS_IP"
echo ""
read -p "Do you want to setup SSL now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@${DOMAIN} --redirect
  echo -e "${GREEN}SSL configured successfully!${NC}"
else
  echo -e "${YELLOW}Skipping SSL setup. You can run it later:${NC}"
  echo "certbot --nginx -d $DOMAIN"
fi

# Final message
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🎉              ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application is now running at:"
echo "  HTTP:  http://$DOMAIN"
echo "  HTTPS: https://$DOMAIN (if SSL was configured)"
echo ""
echo "Useful commands:"
echo "  PM2 status:    pm2 status"
echo "  PM2 logs:      pm2 logs spbu-management-system"
echo "  Nginx reload:  systemctl reload nginx"
echo "  View logs:     tail -f /var/log/spbu-app/out.log"
echo ""
echo "To update the application:"
echo "  cd $APP_DIR"
echo "  git pull origin main"
echo "  npm install"
echo "  npm run build"
echo "  pm2 restart spbu-management-system"
echo ""
