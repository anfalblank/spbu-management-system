# Deployment Guide - SPBU Management System

Panduan deployment untuk VPS dengan domain `anfalhidayat.web.id` dan IP `43.157.213.54`

## 📋 Prasyarat

### VPS Requirements
- OS: Ubuntu 20.04+ / Debian 11+
- RAM: Minimal 2GB (recommend 4GB)
- Storage: 20GB+
- Node.js: 18+ atau 20+

### Domain Configuration
- Domain: `anfalhidayat.web.id`
- VPS IP: `43.157.213.54`

## 🚀 Langkah Deployment

### 1. Persiapan VPS

SSH ke VPS:
```bash
ssh root@43.157.213.54
```

Update system:
```bash
apt update && apt upgrade -y
```

Install dependencies:
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git
```

### 2. Setup Application

Clone repository:
```bash
cd /var/www
git clone https://github.com/anfalblank/spbu-management-system.git
cd spbu-management-system
```

Install dependencies:
```bash
npm install
```

### 3. Environment Configuration

Buat file `.env`:
```bash
nano .env
```

Isi dengan:
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://anfalhidayat.web.id/api
NEXT_PUBLIC_APP_URL=https://anfalhidayat.web.id

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY_IN=7d

# Notification Channels (Optional)
WHATSAPP_API_KEY=your-whatsapp-api-key
EMAIL_FROM=noreply@anfalhidayat.web.id
```

### 4. Build Application

```bash
npm run build
```

### 5. Setup PM2

Buat ecosystem config untuk PM2:
```bash
nano ecosystem.config.js
```

Isi dengan:
```javascript
module.exports = {
  apps: [{
    name: 'spbu-management-system',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/spbu-management-system',
    instances: 1,
    exec_mode: 'cluster',
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
```

Buat log directory:
```bash
mkdir -p /var/log/spbu-app
```

Start application dengan PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configure Nginx

Buat nginx config:
```bash
nano /etc/nginx/sites-available/spbu-management-system
```

Isi dengan:
```nginx
server {
    listen 80;
    server_name anfalhidayat.web.id;

    # Log files
    access_log /var/log/nginx/spbu-app-access.log;
    error_log /var/log/nginx/spbu-app-error.log;

    # Reverse proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

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
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/spbu-management-system /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 7. Setup SSL dengan Let's Encrypt

Install Certbot:
```bash
apt install -y certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
certbot --nginx -d anfalhidayat.web.id
```

Follow the prompts:
- Enter email address
- Agree to Terms of Service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Auto-renewal sudah otomatis di-setup.

### 8. Configure Firewall

Install UFW dan configure:
```bash
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Node.js (optional, only if direct access needed)
# ufw allow 3000/tcp

# Enable firewall
ufw enable
```

### 9. DNS Configuration

Di panel DNS provider Anda, tambahkan A record:

```
Type: A
Name: @
Value: 43.157.213.54
TTL: 3600

Type: A
Name: www
Value: 43.157.213.54
TTL: 3600
```

### 10. Test Deployment

Test di local:
```bash
curl http://localhost:3000
```

Test dari internet:
```bash
curl http://anfalhidayat.web.id
curl https://anfalhidayat.web.id
```

## 🔄 Update Application

Untuk update aplikasi dengan code terbaru:

```bash
cd /var/www/spbu-management-system

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart spbu-management-system

# Or reload zero-downtime
pm2 reload spbu-management-system
```

## 📊 Monitoring

### Cek status PM2:
```bash
pm2 status
pm2 logs spbu-management-system
pm2 monit
```

### Cek Nginx logs:
```bash
tail -f /var/log/nginx/spbu-app-access.log
tail -f /var/log/nginx/spbu-app-error.log
```

### Cek application logs:
```bash
tail -f /var/log/spbu-app/error.log
tail -f /var/log/spbu-app/out.log
```

## 🔧 Troubleshooting

### Application tidak start:
```bash
# Cek PM2 status
pm2 status

# Cek logs
pm2 logs spbu-management-system --lines 100

# Restart PM2
pm2 restart spbu-management-system
```

### Nginx 502 Bad Gateway:
```bash
# Pastikan Next.js running
pm2 status

# Cek port 3000
netstat -tlnp | grep 3000

# Restart Nginx
systemctl restart nginx
```

### SSL Certificate error:
```bash
# Renew manual
certbot renew --force-renewal

# Cek status
certbot certificates
```

### Build errors:
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 📦 Backup Strategy

### Backup Database (jika ada)
```bash
# Add ke crontab
crontab -e

# Backup harian jam 2 pagi
0 2 * * * pg_dump -U postgres spbu_db > /backup/spbu_db_$(date +\%Y\%m\%d).sql
```

### Backup Files
```bash
# Backup ke backup server
rsync -avz /var/www/spbu-management-system/ user@backup-server:/backup/spbu-$(date +\%Y\%m\%d)/
```

## 🔒 Security Best Practices

1. **Jalankan sebagai non-root user**
   ```bash
   adduser spbuapp
   usermod -aG sudo spbuapp
   ```

2. **Setup SSH key authentication**
   ```bash
   # Di local machine
   ssh-keygen -t rsa -b 4096
   ssh-copy-id spbuapp@43.157.213.54
   ```

3. **Disable password login**
   ```bash
   nano /etc/ssh/sshd_config
   # Change: PasswordAuthentication no
   systemctl restart sshd
   ```

4. **Setup firewall** (sudah di langkah 8)

5. **Keep system updated**
   ```bash
   # Auto update
   apt install -y unattended-upgrades
   dpkg-reconfigure -plow unattended-upgrades
   ```

## 📱 URL URLs

Setelah deployment selesai:

- **Production**: https://anfalhidayat.web.id
- **API**: https://anfalhidayat.web.id/api

## 💡 Tips

### Menambah Swap (jika RAM kurang)
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Auto-start setelah reboot
```bash
pm2 startup
pm2 save
```

### Monitor sistem resources
```bash
htop
# atau
nethogs
```

## ✅ Checklist

- [ ] SSH ke VPS berhasil
- [ ] Node.js terinstall
- [ ] PM2 terinstall
- [ ] Nginx terinstall dan terkonfigurasi
- [ ] Repository di-clone
- [ ] Dependencies terinstall
- [ ] Application berhasil di-build
- [ ] PM2 running
- [ ] Nginx proxy terkonfigurasi
- [ ] SSL certificate terinstall
- [ ] DNS configured
- [ ] Firewall configured
- [ ] Application accessible dari internet
- [ ] Auto-restart configured

---

**Support**: Jika ada masalah, hubungi dev team atau cek logs untuk troubleshooting.
