# Quick Deployment Guide

Deploy SPBU Management System to VPS in 5 minutes!

## 🚀 Quick Start (One Command Deployment)

### 1. SSH ke VPS Anda
```bash
ssh root@43.157.213.54
```

### 2. Jalankan deployment script

Copy paste script ini ke terminal VPS Anda:

```bash
curl -o- https://raw.githubusercontent.com/anfalblank/spbu-management-system/main/deploy.sh | bash
```

Atau jika script belum tersedia di GitHub:

```bash
# Download script
wget https://raw.githubusercontent.com/anfalblank/spbu-management-system/main/deploy.sh

# Make executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Script akan otomatis:
- ✅ Install Node.js, PM2, Nginx
- ✅ Clone repository
- ✅ Install dependencies
- ✅ Build application
- ✅ Configure Nginx reverse proxy
- ✅ Setup PM2 process manager
- ✅ Configure firewall
- ✅ Setup SSL certificate

## 📋 Manual Deployment (Step-by-Step)

Jika ingin lebih control, ikuti langkah manual di [DEPLOYMENT.md](./DEPLOYMENT.md)

## ⚙️ Konfigurasi DNS

Sebelum deployment, pastikan DNS sudah dikonfigurasi:

### Di Panel DNS Anda (Cloudflare/Niagahoster/etc)

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

## 🌐 Access URLs

Setelah deployment selesai:

- **Production**: https://anfalhidayat.web.id
- **HTTP (temporary)**: http://anfalhidayat.web.id

## 🔑 Default Login

| Role  | Email           | Password |
|-------|-----------------|----------|
| Admin | admin@spbu.id   | admin123 |
| Operator | operator@spbu.id | operator123 |
| Owner | owner@spbu.id   | owner123 |

## 📊 Monitoring

### Check application status:
```bash
pm2 status
pm2 logs spbu-management-system
```

### Check Nginx status:
```bash
systemctl status nginx
tail -f /var/log/nginx/spbu-app-access.log
```

### Restart application:
```bash
pm2 restart spbu-management-system
```

### Reload Nginx:
```bash
systemctl reload nginx
```

## 🔄 Update Application

```bash
cd /var/www/spbu-management-system
git pull origin main
npm install
npm run build
pm2 restart spbu-management-system
```

## 🐛 Troubleshooting

### Application tidak bisa diakses?

1. Cek PM2 status:
```bash
pm2 status
```

2. Cek logs:
```bash
pm2 logs spbu-management-system --lines 50
```

3. Cek Nginx:
```bash
systemctl status nginx
nginx -t
systemctl restart nginx
```

4. Cek firewall:
```bash
ufw status
```

### SSL Certificate Error?

```bash
# Renew SSL
certbot renew --force-renewal

# Reload Nginx
systemctl reload nginx
```

### Build Error?

```bash
cd /var/www/spbu-management-system
rm -rf .next node_modules
npm install
npm run build
pm2 restart spbu-management-system
```

## 📞 Support

Jika ada masalah:
1. Cek logs: `pm2 logs spbu-management-system`
2. Cek dokumentasi lengkap: [DEPLOYMENT.md](./DEPLOYMENT.md)
3. GitHub Issues: https://github.com/anfalblank/spbu-management-system/issues

---

**Server Info**:
- VPS IP: 43.157.213.54
- Domain: anfalhidayat.web.id
- Region: Indonesia (assumed based on .id domain)

**Tech Stack**:
- Node.js 20
- Next.js 16 (Production mode)
- PM2 (Process Manager)
- Nginx (Reverse Proxy)
- Let's Encrypt (SSL)
