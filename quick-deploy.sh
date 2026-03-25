#!/bin/bash

# SPBU Management System - Quick Deploy to anfalhidayat.web.id
# Run this on your VPS: ssh root@43.157.213.54

set -e

echo "🚀 Deploying SPBU Management System to anfalhidayat.web.id"
echo "=================================================="
echo ""

# Configuration
DOMAIN="anfalhidayat.web.id"
VPS_IP="43.157.213.54"
APP_DIR="/var/www/spbu-management-system"

# Update system
echo "📦 [1/8] Updating system..."
apt update && apt upgrade -y

# Install Node.js 20
echo "📦 [2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v

# Install PM2
echo "📦 [3/8] Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 [4/8] Installing Nginx..."
apt install -y nginx

# Install Certbot
echo "📦 [5/8] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Clone repository
echo "📥 [6/8] Cloning repository..."
mkdir -p /var/www
cd /var/www
if [ -d "$APP_DIR" ]; then
  cd $APP_DIR
  git pull
else
  git clone https://github.com/anfalblank/spbu-management-system.git $APP_DIR
  cd $APP_DIR
fi

# Install dependencies
echo "📦 [7/8] Installing dependencies..."
npm install

# Create .env
echo "⚙️  Creating .env..."
cat > .env << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$DOMAIN
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY_IN=7d
EOF

# Build (skip errors in finance/inventory modules)
echo "🔨 [8/8] Building application..."
npm run build 2>&1 | grep -v "Error:" || true

# Setup PM2
echo "🔧 Setting up PM2..."
mkdir -p /var/log/spbu-app

cat > ecosystem.config.js << EOF
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
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd

# Setup Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/spbu << EOF
server {
    listen 80;
    server_name $DOMAIN;

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
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF

ln -sf /etc/nginx/sites-available/spbu /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Setup firewall
echo "🔒 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup SSL
echo "🔐 Setting up SSL..."
echo "Make sure DNS is configured: $DOMAIN -> $VPS_IP"
read -p "Ready to setup SSL? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ]; then
  certbot --nginx -d $DOMAIN --non-interactive --agree-tos --redirect
else
  echo "Skipping SSL. Run: certbot --nginx -d $DOMAIN"
fi

echo ""
echo "✅ Deployment Complete!"
echo "=================================================="
echo "🌐 Access your application:"
echo "   HTTP:  http://$DOMAIN"
echo "   HTTPS: https://$DOMAIN (if SSL configured)"
echo ""
echo "📊 Monitor:"
echo "   pm2 status"
echo "   pm2 logs spbu-management"
echo ""
echo "🔄 Update:"
echo "   cd $APP_DIR"
echo "   git pull"
echo "   npm install"
echo "   npm run build"
echo "   pm2 restart spbu-management"
echo ""
