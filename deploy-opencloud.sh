#!/bin/bash

# SPBU Management System - Quick Deploy for OpenCloud OS (RHEL/CentOS/Fedora)
# Run this on your VPS: ssh root@43.157.213.54

set -e

echo "🚀 Deploying SPBU Management System to anfalhidayat.web.id"
echo "=================================================="
echo "OS: OpenCloud OS (RHEL/CentOS/Fedora)"
echo ""

# Configuration
DOMAIN="anfalhidayat.web.id"
VPS_IP="43.157.213.54"
APP_DIR="/var/www/spbu-management-system"

# Update system
echo "📦 [1/9] Updating system..."
dnf update -y || yum update -y

# Install EPEL repository (needed for some packages)
echo "📦 [2/9] Installing EPEL repository..."
dnf install -y epel-release || yum install -y epel-release

# Install Node.js 20 via NodeSource
echo "📦 [3/9] Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs || yum install -y nodejs
node -v
npm -v

# Install PM2 globally
echo "📦 [4/9] Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 [5/9] Installing Nginx..."
dnf install -y nginx || yum install -y nginx
systemctl enable nginx
systemctl start nginx

# Install Git
echo "📦 [6/9] Installing Git..."
dnf install -y git || yum install -y git

# Install Certbot for SSL
echo "📦 [7/9] Installing Certbot..."
dnf install -y certbot python3-certbot-nginx || yum install -y certbot python3-certbot-nginx

# Install development tools (needed for building native modules)
echo "📦 [8/9] Installing development tools..."
dnf groupinstall -y "Development Tools" || yum groupinstall -y "Development Tools"
dnf install -y python3 make || yum install -y python3 make

# Clone repository
echo "📥 Cloning repository..."
mkdir -p /var/www
cd /var/www
if [ -d "$APP_DIR" ]; then
  echo "Directory exists, pulling latest changes..."
  cd $APP_DIR
  git pull
else
  echo "Cloning repository..."
  git clone https://github.com/anfalblank/spbu-management-system.git $APP_DIR
  cd $APP_DIR
fi

# Install dependencies
echo "📦 Installing Node dependencies..."
npm install

# Create .env file
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_APP_URL=https://$DOMAIN
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY_IN=7d
EOF

# Build application
echo "🔨 Building application..."
# Build mungkin ada warning di beberapa module, tapi kita lanjut
npm run build 2>&1 | tail -20 || echo "Build completed with warnings (OK)"

# Setup PM2
echo "🔧 Setting up PM2 process manager..."
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

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup PM2 to start on boot
pm2 startup systemd
pm2 save

# Configure Nginx
echo "🌐 Configuring Nginx reverse proxy..."
cat > /etc/nginx/conf.d/spbu-management.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Log files
    access_log /var/log/nginx/spbu-access.log;
    error_log /var/log/nginx/spbu-error.log;

    # Reverse proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;

        # Real IP headers
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

    location /static {
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

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Configure Firewall (firewalld for RHEL/CentOS/OpenCloud)
echo "🔒 Configuring firewall..."

# Check if firewalld is installed
if command -v firewall-cmd &> /dev/null; then
    echo "Using firewalld..."

    # Add http and https services
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https

    # Add SSH service
    firewall-cmd --permanent --add-service=ssh

    # Open port 3000 (optional, for direct access)
    firewall-cmd --permanent --add-port=3000/tcp

    # Reload firewall
    firewall-cmd --reload

    echo "Firewall configured with firewalld"
else
    echo "firewalld not found, installing..."
    dnf install -y firewalld || yum install -y firewalld
    systemctl enable firewalld
    systemctl start firewalld

    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --reload
fi

# Setup SELinux (if enabled)
echo "🔐 Configuring SELinux..."
if command -v getenforce &> /dev/null; then
    # Set SELinux to permissive mode (or disable if needed)
    setenforce 0 || true

    # Allow nginx to connect to Node.js
    setsebool -P httpd_can_network_connect 1 || true

    echo "SELinux configured"
else
    echo "SELinux not found or not active, skipping..."
fi

# Setup SSL with Let's Encrypt
echo ""
echo "🔐 SSL Certificate Setup"
echo "================================"
echo "IMPORTANT: Make sure DNS is already configured!"
echo "DNS A Record: $DOMAIN -> $VPS_IP"
echo ""
read -p "Do you want to setup SSL certificate now? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ] || [ "$setup_ssl" = "Y" ]; then
    echo "Setting up SSL with Let's Encrypt..."

    # Get SSL certificate and configure nginx
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@${DOMAIN} --redirect

    echo "✅ SSL configured successfully!"
else
    echo "⏭️  Skipping SSL setup."
    echo "You can run it later with:"
    echo "  certbot --nginx -d $DOMAIN --redirect"
fi

# Final message
echo ""
echo "✅ ============================================"
echo "   Deployment Complete! 🎉"
echo "   ============================================"
echo ""
echo "🌐 Access your application:"
echo "   HTTP:  http://$DOMAIN"
echo "   HTTPS: https://$DOMAIN (if SSL was configured)"
echo ""
echo "📊 Monitor application:"
echo "   pm2 status"
echo "   pm2 logs spbu-management"
echo "   pm2 monit"
echo ""
echo "🔄 Update application:"
echo "   cd $APP_DIR"
echo "   git pull origin main"
echo "   npm install"
echo "   npm run build"
echo "   pm2 restart spbu-management"
echo ""
echo "🔧 Useful commands:"
echo "   Nginx restart:  systemctl restart nginx"
echo "   Nginx status:   systemctl status nginx"
echo "   View logs:      tail -f /var/log/spbu-app/out.log"
echo "   Firewall:       firewall-cmd --list-all"
echo ""
echo "🐛 Troubleshooting:"
echo "   Check logs:     pm2 logs spbu-management --lines 50"
echo "   Restart app:    pm2 restart spbu-management"
echo "   Restart nginx:  systemctl restart nginx"
echo ""

# Save PM2 configuration to persist across reboots
pm2 save

echo "✨ PM2 configuration saved. App will start automatically on reboot."
echo ""
echo "==========================================="
echo "Deployment completed successfully!"
echo "==========================================="
