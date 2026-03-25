# SPBU Management System

Sistem manajemen SPBU (Stasiun Pengisian Bahan Bakar Umum) modern dengan fitur lengkap untuk mengelola operasional SPBU, LPG, OLI, dan SnB (Store & Business).

## 🚀 Fitur Utama

### 1. **Dashboard Monitoring Real-time**
- AI-powered insights dan predictions
- Monitoring stok dengan prediksi kehabisan
- Deteksi anomali dan fraud
- Grafik tren penjualan harian/mingguan/bulanan

### 2. **Sistem POS (Point of Sale)**
- Multi-module: SPBU, LPG, OLI, SnB
- Berbagai metode pembayaran: Cash, QRIS, Transfer, Voucher
- Proteksi transaksi dengan transaction lock
- Struk transaksi dengan cetak dan download

### 3. **Manajemen SPBU**
- Manajemen dispenser dan nozzle
- Shift settlement dengan perhitungan otomatis
- Deteksi selisih (fuel loss/gain)
- Monitoring tangki BBM

### 4. **Manajemen LPG**
- Sales Agreement (SA) untuk pelanggan subsidi
- Tracking kuota dan realisasi
- Prediksi kebutuhan stok
- Analytics performa penjualan

### 5. **Auto Order System** ⭐ NEW
- Alert stok otomatis berdasarkan prediksi AI
- Generate draft order otomatis
- Workflow approval (Draft → Pending → Approved → Ordered → Delivered)
- Notifikasi multi-channel (In-app, WhatsApp, Email)

### 6. **Smart Control** ⭐ NEW
- Deteksi kecurangan (fraud detection)
- High selisih detection
- Unusual transaction pattern detection
- Performance monitoring per shift
- Rekomendasi AI untuk optimisasi

### 7. **Multi-User dengan Role-Based Access**
- **Admin**: Akses penuh
- **Operator**: Akses POS dan operasional
- **Owner**: Akses laporan dan analitik

## 🛠️ Teknologi

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **State Management**: Zustand ( dengan Immer & DevTools)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: JWT with auto-logout

## 📦 Instalasi

```bash
# Clone repository
git clone https://github.com/username/spbu-management-system.git
cd spbu-management-system

# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build

# Start production server
npm start
```

## 📁 Struktur Proyek

```
spbu-management-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login)
│   ├── dashboard/                # Main dashboard
│   ├── pos/                      # POS system
│   ├── spbu/                     # SPBU module pages
│   ├── lpg/                      # LPG module pages
│   ├── oli/                      # OLI module pages
│   ├── snb/                      # SnB module pages
│   ├── inventory/                # Inventory management
│   └── finance/                  # Finance & accounting
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components
│   ├── dashboard/                # Dashboard components
│   ├── orders/                   # Order management components
│   ├── notifications/            # Notification components
│   ├── pos/                      # POS components
│   └── auth/                     # Auth components
│
├── store/                        # Zustand stores
│   ├── useAuthStore.ts           # Authentication state
│   ├── usePOSStore.ts            # POS & cart state
│   ├── useSPBUStore.ts           # SPBU operations state
│   ├── useLPGStore.ts            # LPG operations state
│   ├── useAutoOrderStore.ts      # Auto order & alerts state
│   └── types.ts                  # Shared TypeScript types
│
├── lib/
│   ├── api/                      # API client & services
│   ├── auth/                     # Authentication utilities
│   ├── pos/                      # POS logic & validation
│   ├── ai/                       # AI predictions & monitoring
│   ├── smart-control/            # Fraud detection & analytics
│   ├── notifications/            # Notification service
│   └── utils/                    # Utility functions
│
└── public/                       # Static assets
```

## 🔐 Authentication & Authorization

### Login Credentials (Mock)

| Role  | Email           | Password |
|-------|-----------------|----------|
| Admin | admin@spbu.id   | admin123 |
| Operator | operator@spbu.id | operator123 |
| Owner | owner@spbu.id   | owner123 |

### Permissions Matrix

| Feature             | Admin | Operator | Owner |
|---------------------|-------|----------|-------|
| Dashboard           | ✅    | ✅       | ✅    |
| POS Transaction     | ✅    | ✅       | ❌    |
| SPBU Operations     | ✅    | ✅       | 👁️   |
| LPG Management      | ✅    | ✅       | 👁️   |
| Inventory Management | ✅   | ❌       | ✅    |
| Finance Reports     | ✅    | ❌       | ✅    |
| User Management     | ✅    | ❌       | ❌    |
| Smart Control       | ✅    | ❌       | ✅    |

## 📊 Modul Penjelasan

### Auto Order System

Sistem Auto Order secara otomatis:

1. **Monitoring Stok**: Menggunakan AI untuk memprediksi kapan stok akan habis
2. **Generate Alert**: Membuat alert saat stok mencapai threshold kritis
3. **Buat Draft Order**: Otomatis membuat draft order dengan quantity yang disarankan
4. **Approval Workflow**: Mengirim order untuk approval sebelum di-proses
5. **Notifikasi**: Mengirim notifikasi melalui berbagai channel

```typescript
// Formula perhitungan order quantity
orderQty = (predictedDailyDemand × leadTimeDays + safetyStock) - currentStock
```

### Smart Control Analytics

Smart Control mendeteksi:

1. **Fraud Detection**
   - High selisih pada nozzle (>5%)
   - Pola transaksi mencurigakan
   - Performa shift tidak wajar

2. **Performance Monitoring**
   - Shift dengan performa rendah
   - Produk terlaris
   - Jam sibuk (peak hours)
   - Tren keuntungan

3. **Actionable Recommendations**
   - Rekomendasi training untuk operator
   - Suggest investigasi untuk anomali
   - Optimasi staf berdasarkan jam sibuk

## 🎨 UI Components

### Komponen Utama

- **Cards**: KPI cards, stat cards, info cards
- **Charts**: Line charts, bar charts, pie charts
- **Tables**: Data tables dengan sorting, filtering, pagination
- **Forms**: Validasi forms dengan error handling
- **Modals**: Dialog modals untuk konfirmasi dan input
- **Notifications**: Toast notifications dan dropdown panel

### Theme Support

- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Smooth animations dengan Framer Motion

## 🔧 Konfigurasi

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRY_IN=7d

# Notification Channels (Optional)
WHATSAPP_API_KEY=your-whatsapp-api-key
EMAIL_FROM=noreply@spbu.id
```

### Tailwind Configuration

```javascript
// tailwind.config.ts
export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          // ... color variants
        }
      }
    }
  }
}
```

## 📈 API Integration

### Service Layer Pattern

Semua API calls menggunakan service layer yang dapat dengan mudah diganti dengan real API:

```typescript
// lib/api/services/product.service.ts
export const productService = {
  async getProducts(filters?: ProductFilters) {
    // TODO: Replace with actual API call
    // const response = await apiClient.get('/products', { params: filters })
    // return response.data

    return mockProducts
  }
}
```

### API Endpoints (to be implemented)

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/products
POST   /api/transactions
GET    /api/spbu/dispensers
POST   /api/spbu/settlements
GET    /api/lpg/sales-agreements
POST   /api/lpg/realisasi
GET    /api/orders
POST    /api/orders
PUT    /api/orders/:id/approve
GET    /api/smart-control/insights
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm test:coverage

# Run E2E tests
npm test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build image
docker build -t spbu-management-system .

# Run container
docker run -p 3000:3000 spbu-management-system
```

## 📝 Development Guide

### Menambah Modul Baru

1. Buat page di `app/[module-name]/page.tsx`
2. Buat components di `components/[module-name]/`
3. Buat store di `store/use[Module]Store.ts`
4. Tambah menu di sidebar
5. Update permissions di `lib/auth/rbac.ts`

### Menambah Dashboard Widget

1. Buat component di `components/dashboard/`
2. Export dari `components/dashboard/index.ts`
3. Import dan gunakan di `app/dashboard/page.tsx`

### Customizing Theme

Edit `app/globals.css` untuk mengubah:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - lihat file [LICENSE](LICENSE) untuk detail

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

## 📞 Support

Untuk support dan pertanyaan:
- Email: support@spbu.id
- Documentation: [Wiki](https://github.com/username/spbu-management-system/wiki)
- Issues: [GitHub Issues](https://github.com/username/spbu-management-system/issues)

---

**Status**: Active Development
**Version**: 1.0.0
**Last Updated**: March 2025
