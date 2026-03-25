# 🚀 Deployment Guide VPS anfalhidayat.web.id

Deployment guide untuk **SPBU Management System** pada VPS dengan domain `anfalhidayat.web.id` dan IP `43.157.213.54`

## 📋 Prasyarat

### VPS Requirements
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Minimal 2GB (recommend 4GB)
- **Storage**: 20GB+
- **CPU**: 2 Core+ (recommend)

### Local Requirements
- Git installed
- SSH client

## 🎯 Pilihan Deployment Method

### Method 1: Automated Script (Recommended) ⭐
Cocok untuk deployment cepat tanpa konfigurasi manual

### Method 2: Docker
Cocok untuk containerization dan portability

### Method 3: Manual PM2 + Nginx
Cocok untuk kontrol penuh dan optimasi

---

## 📝 Langkah 1: Persiapan DNS

Sebelum deployment, konfigurasi DNS di provider domain Anda:

### DNS Records

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

### Verifikasi DNS
```bash
# Test DNS propagation
ping anfalhidayat.web.id
nslookup anfalhidayat.web.id
```

---

## 🤖 Method 1: Automated Deployment (Recommended)

### Langkah 1: SSH ke VPS
```bash
ssh root@43.157.213.54
```

### Langkah 2: Jalankan Deployment Script

```bash
# Download dan jalankan script dalam satu command
curl -o- https://raw.githubusercontent.com/anfalblank/spbu-management-system/main/deploy.sh | bash
```

Script akan otomatis:
- ✅ Update system
- ✅ Install Node.js 20, PM2, Nginx
- ✅ Clone repository
- ✅ Install dependencies & build
- ✅ Setup PM2 process manager
- ✅ Configure Nginx reverse proxy
- ✅ Setup firewall (UFW)
- ✅ Install SSL certificate (Let's Encrypt)

### Langkah 3: Verifikasi Deployment

Buka browser dan akses:
- **HTTP**: http://anfalhidayat.web.id
- **HTTPS**: https://anfalhidayat.web.id (setelah SSL)

### Monitoring
```bash
# Cek status aplikasi
pm2 status

# Cek logs
pm2 logs spbu-management-system

# Cek Nginx status
systemctl status nginx
```

---

## 🐳 Method 2: Docker Deployment

### Langkah 1: SSH ke VPS
```bash
ssh root@43.157.213.54
```

### Langkah 2: Install Docker & Docker Compose

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Langkah 3: Clone Repository

```bash
cd /var/www
git clone https://github.com/anfalblank/spbu-management-system.git
cd spbu-management-system
```

### Langkah 4: Create Environment File

```bash
cat > .env << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://anfalhidayat.web.id/api
NEXT_PUBLIC_APP_URL=https://anfalhidayat.web.id
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRY_IN=7d
EOF
```

### Langkah 5: Build & Run with Docker Compose

```bash
# Build image
docker-compose build

# Start container
docker-compose up -d

# Check status
docker-compose ps
```

### Langkah 6: Setup Nginx Reverse Proxy

```bash
# Install Nginx
apt install -y nginx

# Create Nginx config
cat > /etc/nginx/sites-available/spbu-docker << 'EOF'
server {
    listen 80;
    server_name anfalhidayat.web.id;

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
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/spbu-docker /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Langkah 7: Setup SSL

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d anfalhidayat.web.id --redirect
```

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Restart container
docker-compose restart

# Stop container
docker-compose down

# Update application
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 🔧 Method 3: Manual PM2 + Nginx

Lihat panduan lengkap di [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🌐 Access URL

Setelah deployment selesai:

- **Production**: https://anfalhidayat.web.id
- **HTTP**: http://anfalhidayat.web.id

## 🔑 Login Credentials

| Role  | Email           | Password |
|-------|-----------------|----------|
| Admin | admin@spbu.id   | admin123 |
| Operator | operator@spbu.id | operator123 |
| Owner | owner@spbu.id   | owner123 |

---

## 📊 Monitoring & Maintenance

### Check Application Status

**PM2 Method:**
```bash
pm2 status
pm2 logs spbu-management-system
pm2 monit
```

**Docker Method:**
```bash
docker-compose logs -f
docker stats
```

### Restart Application

**PM2 Method:**
```bash
pm2 restart spbu-management-system
# or zero-downtime reload
pm2 reload spbu-management-system
```

**Docker Method:**
```bash
docker-compose restart
```

### View Nginx Logs
```bash
tail -f /var/log/nginx/spbu-app-access.log
tail -f /var/log/nginx/spbu-app-error.log
```

---

## 🔄 Update Application

### PM2 Method
```bash
cd /var/www/spbu-management-system
git pull origin main
npm install
npm run build
pm2 restart spbu-management-system
```

### Docker Method
```bash
cd /var/www/spbu-management-system
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 🔒 Security Best Practices

### 1. Setup Firewall
```bash
# UFW sudah dikonfigurasi oleh deployment script
ufw status

# Allow additional ports if needed
ufw allow [PORT]
```

### 2. SSH Key Authentication
```bash
# Di local machine
ssh-keygen -t rsa -b 4096
ssh-copy-id root@43.157.213.54

# Di VPS, disable password login
nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
systemctl restart sshd
```

### 3. Keep System Updated
```bash
# Auto security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### 4. Regular Backup
```bash
# Backup application
tar -czf /backup/spbu-$(date +%Y%m%d).tar.gz /var/www/spbu-management-system

# Backup ke remote (optional)
rsync -avz /var/www/spbu-management-system user@backup-server:/backup/
```

---

## 🐛 Troubleshooting

### Application Not Accessible

1. **Check PM2/Docker status:**
```bash
# PM2
pm2 status

# Docker
docker-compose ps
```

2. **Check logs:**
```bash
# PM2
pm2 logs spbu-management-system --lines 50

# Docker
docker-compose logs --tail 50
```

3. **Check Nginx:**
```bash
systemctl status nginx
nginx -t
systemctl restart nginx
```

### 502 Bad Gateway

Application tidak running. Restart:
```bash
# PM2
pm2 restart spbu-management-system

# Docker
docker-compose restart
```

### SSL Certificate Error

```bash
# Renew certificate
certbot renew --force-renewal

# Reload Nginx
systemctl reload nginx
```

### Out of Memory

Add swap:
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 📞 Support & Resources

- **GitHub Repository**: https://github.com/anfalblank/spbu-management-system
- **Issues**: https://github.com/anfalblank/spbu-management-system/issues
- **Documentation**: [README.md](./README.md), [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## ✅ Deployment Checklist

- [ ] DNS sudah dikonfigurasi (A record)
- [ ] Bisa SSH ke VPS (43.157.213.54)
- [ ] Node.js terinstall
- [ ] PM2 / Docker terinstall
- [ ] Nginx terinstall dan terkonfigurasi
- [ ] Application berhasil di-build
- [ ] Application running (PM2/Docker)
- [ ] Nginx reverse proxy working
- [ ] SSL certificate terinstall
- [ ] Firewall terkonfigurasi
- [ ] Application accessible dari internet
- [ ] HTTPS working
- [ ] Login test berhasil

---

**Server Information**:
- VPS IP: 43.157.213.54
- Domain: anfalhidayat.web.id
- Region: Indonesia
- Deployment: Production

**Tech Stack**:
- Node.js 20 LTS
- Next.js 16 (Standalone/PM2)
- PM2 Process Manager
- Nginx Reverse Proxy
- Let's Encrypt SSL
- Docker (optional)

Good luck with your deployment! 🚀
