#!/bin/bash

# SPBU Management System - Quick Deploy for OpenCloud OS
# Compatible with RHEL/CentOS/Fedora/OpenCloud OS
# Run: ssh root@43.157.213.54 'bash -s' < deploy-opencloud-v2.sh

set -e

echo "🚀 Deploying SPBU Management System to anfalhidayat.web.id"
echo "=================================================="
echo ""

DOMAIN="anfalhidayat.web.id"
APP_DIR="/var/www/spbu-management-system"

# Update system (skip EPEL if not available)
echo "📦 [1/8] Updating system..."
dnf update -y || yum update -y

# Install Node.js 20 (direct from NodeSource)
echo "📦 [2/8] Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs || yum install -y nodejs
node -v
npm -v

# Install PM2
echo "📦 [3/8] Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 [4/8] Installing Nginx..."
dnf install -y nginx || yum install -y nginx
systemctl enable nginx
systemctl start nginx

# Install Git
echo "📦 [5/8] Installing Git..."
dnf install -y git || yum install -y git

# Install Python & Certbot
echo "📦 [6/8] Installing Certbot..."
dnf install -y certbot python3-certbot-nginx || yum install -y certbot python3-certbot-nginx || true

# Install development tools
echo "📦 Installing build tools..."
dnf install -y python3 make gcc-c++ || yum install -y python3 make gcc-c++ || true

# Clone repository
echo "📥 [7/8] Cloning repository..."
mkdir -p /var/www
cd /var/www

if [ -d "$APP_DIR" ]; then
  echo "Directory exists, updating..."
  cd $APP_DIR
  git fetch
  git reset --hard origin/main
else
  echo "Cloning fresh..."
  git clone https://github.com/anfalblank/spbu-management-system.git $APP_DIR
  cd $APP_DIR
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps || npm install

# Create .env
echo "⚙️  Creating .env..."
cat > .env << ENVEOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$DOMAIN
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY_IN=7d
ENVEOF

# Build
echo "🔨 Building..."
npm run build 2>&1 | tail -20 || true

# Setup PM2
echo "🔧 [8/8] Setting up PM2..."
mkdir -p /var/log/spbu-app

cat > ecosystem.config.js << PMSEOF
module.exports = {
  apps: [{
    name: 'spbu-management',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production', PORT: 3000 },
    error_file: '/var/log/spbu-app/error.log',
    out_file: '/var/log/spbu-app/out.log',
    autorestart: true,
    max_restarts: 10
  }]
}
PMSEOF

# Start PM2
pm2 start ecosystem.config.js || pm2 start npm --name "spbu-management" -- start
pm2 save
pm2 startup systemd || true

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/conf.d/spbu.conf << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
NGINXEOF

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Configure firewall
if command -v firewall-cmd &> /dev/null; then
    echo "🔒 Configuring firewall..."
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --reload
fi

# Configure SELinux
if [ -x /usr/sbin/setenforce ]; then
    echo "🔐 Configuring SELinux..."
    setenforce 0 || true
    setsebool -P httpd_can_network_connect 1 || true
fi

echo ""
echo "✅ Deployment Complete!"
echo "==================================="
echo "🌐 Access: http://$DOMAIN"
echo "📊 Monitor: pm2 status"
echo "📝 Logs: pm2 logs spbu-management"
echo ""
echo "🔧 Restart: pm2 restart spbu-management"
echo ""
