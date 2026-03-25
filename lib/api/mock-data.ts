import { POSModule } from '@/store/cart-store'

// ============================================
// PRODUCTS MOCK DATA
// ============================================

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
  module: POSModule
  image?: string
  sku?: string
  barcode?: string
  minStock: number
  location?: string
}

export const mockProducts: Product[] = [
  // SPBU Products
  { id: 'p1', name: 'Pertalite', category: 'BBM', price: 10000, stock: 5000, unit: 'Liter', module: 'spbu', sku: 'SPBU-001', minStock: 1000 },
  { id: 'p2', name: 'Pertamax', category: 'BBM', price: 13700, stock: 3500, unit: 'Liter', module: 'spbu', sku: 'SPBU-002', minStock: 800 },
  { id: 'p3', name: 'Pertamax Turbo', category: 'BBM', price: 15000, stock: 2000, unit: 'Liter', module: 'spbu', sku: 'SPBU-003', minStock: 500 },
  { id: 'p4', name: 'Dexlite', category: 'BBM', price: 14750, stock: 2800, unit: 'Liter', module: 'spbu', sku: 'SPBU-004', minStock: 600 },
  { id: 'p5', name: 'Solar', category: 'BBM', price: 6800, stock: 8000, unit: 'Liter', module: 'spbu', sku: 'SPBU-005', minStock: 2000 },

  // GAS Products
  { id: 'g1', name: 'LPG 3kg', category: 'Gas Elpiji', price: 16000, stock: 150, unit: 'Tabung', module: 'gas', sku: 'GAS-001', minStock: 50 },
  { id: 'g2', name: 'LPG 5.5kg', category: 'Gas Elpiji', price: 65000, stock: 80, unit: 'Tabung', module: 'gas', sku: 'GAS-002', minStock: 20 },
  { id: 'g3', name: 'LPG 12kg', category: 'Gas Elpiji', price: 155000, stock: 45, unit: 'Tabung', module: 'gas', sku: 'GAS-003', minStock: 15 },
  { id: 'g4', name: 'Bright Gas 5.5kg', category: 'Gas Elpiji', price: 95000, stock: 30, unit: 'Tabung', module: 'gas', sku: 'GAS-004', minStock: 10 },
  { id: 'g5', name: 'Bright Gas 12kg', category: 'Gas Elpiji', price: 190000, stock: 25, unit: 'Tabung', module: 'gas', sku: 'GAS-005', minStock: 8 },

  // OLI Products
  { id: 'o1', name: 'Mesran B-40', category: 'Oli Mesin', price: 75000, stock: 100, unit: 'Botol', module: 'oli', sku: 'OLI-001', minStock: 20 },
  { id: 'o2', name: 'Shell Helix HX7 10W-40', category: 'Oli Mesin', price: 320000, stock: 45, unit: 'Botol', module: 'oli', sku: 'OLI-002', minStock: 10 },
  { id: 'o3', name: 'Mobil 1 5W-30', category: 'Oli Mesin', price: 450000, stock: 30, unit: 'Botol', module: 'oli', sku: 'OLI-003', minStock: 8 },
  { id: 'o4', name: 'Castrol Power 1', category: 'Oli Mesin', price: 285000, stock: 55, unit: 'Botol', module: 'oli', sku: 'OLI-004', minStock: 15 },
  { id: 'o5', name: 'Pelumas Gardan', category: 'Oli Gardan', price: 95000, stock: 40, unit: 'Botol', module: 'oli', sku: 'OLI-005', minStock: 10 },
  { id: 'o6', name: 'Oli Rem DOT 3', category: 'Oli Rem', price: 55000, stock: 60, unit: 'Botol', module: 'oli', sku: 'OLI-006', minStock: 15 },
  { id: 'o7', name: 'Oli Kopling', category: 'Oli Kopling', price: 65000, stock: 50, unit: 'Botol', module: 'oli', sku: 'OLI-007', minStock: 12 },

  // SnB Products
  { id: 's1', name: 'Air Mineral 600ml', category: 'Minuman', price: 4000, stock: 200, unit: 'Botol', module: 'snb', sku: 'SNB-001', minStock: 50 },
  { id: 's2', name: 'Air Mineral 1500ml', category: 'Minuman', price: 6000, stock: 150, unit: 'Botol', module: 'snb', sku: 'SNB-002', minStock: 40 },
  { id: 's3', name: 'Teh Botol Sosro', category: 'Minuman', price: 5000, stock: 180, unit: 'Botol', module: 'snb', sku: 'SNB-003', minStock: 45 },
  { id: 's4', name: 'Pocari Sweat 500ml', category: 'Minuman', price: 7000, stock: 120, unit: 'Botol', module: 'snb', sku: 'SNB-004', minStock: 30 },
  { id: 's5', name: 'Kopi Kapal Api', category: 'Minuman', price: 2500, stock: 250, unit: 'Sachet', module: 'snb', sku: 'SNB-005', minStock: 60 },
  { id: 's6', name: 'Roti Tawar', category: 'Makanan', price: 12000, stock: 45, unit: 'Pack', module: 'snb', sku: 'SNB-006', minStock: 15 },
  { id: 's7', name: 'Indomie Goreng', category: 'Makanan', price: 3500, stock: 300, unit: 'Bungkus', module: 'snb', sku: 'SNB-007', minStock: 80 },
  { id: 's8', name: 'Chitato 68g', category: 'Snack', price: 8000, stock: 90, unit: 'Pack', module: 'snb', sku: 'SNB-008', minStock: 25 },
  { id: 's9', name: 'Oreo 133g', category: 'Snack', price: 10000, stock: 75, unit: 'Pack', module: 'snb', sku: 'SNB-009', minStock: 20 },
  { id: 's10', name: 'Tisu Wajah', category: 'Lainnya', price: 2000, stock: 500, unit: 'Pack', module: 'snb', sku: 'SNB-010', minStock: 100 },
  { id: 's11', name: 'Kamera Dashcam', category: 'Aksesoris', price: 450000, stock: 15, unit: 'Unit', module: 'snb', sku: 'SNB-011', minStock: 5 },
  { id: 's12', name: 'Tire Glow', category: 'Aksesoris', price: 35000, stock: 40, unit: 'Botol', module: 'snb', sku: 'SNB-012', minStock: 10 },
]

// ============================================
// SALES MOCK DATA
// ============================================

export interface SalesData {
  date: string
  total: number
  transactions: number
  spbuSales: number
  gasSales: number
  oliSales: number
  snbSales: number
}

export const generateSalesData = (days: number): SalesData[] => {
  const data: SalesData[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const baseSales = 15000000 + Math.random() * 5000000
    data.push({
      date: date.toISOString().split('T')[0],
      total: Math.round(baseSales),
      transactions: Math.round(baseSales / 75000),
      spbuSales: Math.round(baseSales * 0.65),
      gasSales: Math.round(baseSales * 0.15),
      oliSales: Math.round(baseSales * 0.12),
      snbSales: Math.round(baseSales * 0.08),
    })
  }

  return data
}

export const mockSalesToday = {
  total: 18450000,
  transactions: 247,
  spbuSales: 11992500,
  gasSales: 2767500,
  oliSales: 2214000,
  snbSales: 1476000,
  averageTransaction: 74696,
  busiestHour: 17,
}

export const mockSalesWeek = generateSalesData(7)
export const mockSalesMonth = generateSalesData(30)

// Hourly sales data for today
export const mockHourlySales = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  sales: hour >= 6 && hour <= 22 ? Math.round(Math.random() * 2000000 + 500000) : 0,
  transactions: hour >= 6 && hour <= 22 ? Math.round(Math.random() * 30 + 5) : 0,
}))

// ============================================
// TRANSACTION MOCK DATA
// ============================================

export interface Transaction {
  id: string
  date: Date
  items: { name: string; quantity: number; price: number }[]
  total: number
  paymentMethod: 'cash' | 'qris' | 'transfer' | 'voucher'
  cashier: string
  module: POSModule
  status: 'completed' | 'cancelled' | 'refunded'
}

export const mockTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => {
  const date = new Date()
  date.setHours(date.getHours() - Math.floor(Math.random() * 72))
  const modules: POSModule[] = ['spbu', 'gas', 'oli', 'snb']
  const paymentMethods: Transaction['paymentMethod'][] = ['cash', 'qris', 'transfer', 'voucher']
  const statuses: Transaction['status'][] = ['completed', 'completed', 'completed', 'cancelled', 'refunded']

  return {
    id: `TXN-${String(10000 + i).slice(1)}`,
    date,
    items: [
      { name: 'Pertalite', quantity: 5, price: 10000 },
      { name: 'Pertamax', quantity: 3, price: 13700 },
    ],
    total: Math.round(Math.random() * 500000 + 50000),
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    cashier: ['Citra Kasir', 'Dedi Kasir', 'Eko Kasir'][Math.floor(Math.random() * 3)],
    module: modules[Math.floor(Math.random() * modules.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }
})

// ============================================
// SPBU DISPENSER MOCK DATA
// ============================================

export interface Dispenser {
  id: string
  name: string
  product: string
  nozzleCount: number
  status: 'active' | 'inactive' | 'maintenance'
  lastCalibration: Date
  totalVolume: number
  todaySales: number
}

export const mockDispensers: Dispenser[] = [
  { id: 'd1', name: 'Dispenser 1', product: 'Pertalite', nozzleCount: 2, status: 'active', lastCalibration: new Date('2024-03-01'), totalVolume: 125000, todaySales: 4500000 },
  { id: 'd2', name: 'Dispenser 2', product: 'Pertamax', nozzleCount: 2, status: 'active', lastCalibration: new Date('2024-03-05'), totalVolume: 89000, todaySales: 5200000 },
  { id: 'd3', name: 'Dispenser 3', product: 'Solar', nozzleCount: 2, status: 'active', lastCalibration: new Date('2024-02-28'), totalVolume: 156000, todaySales: 3100000 },
  { id: 'd4', name: 'Dispenser 4', product: 'Dexlite', nozzleCount: 1, status: 'maintenance', lastCalibration: new Date('2024-01-15'), totalVolume: 45000, todaySales: 0 },
  { id: 'd5', name: 'Dispenser 5', product: 'Pertamax Turbo', nozzleCount: 1, status: 'inactive', lastCalibration: new Date('2024-02-20'), totalVolume: 32000, todaySales: 0 },
]

export interface Tank {
  id: string
  product: string
  capacity: number
  currentVolume: number
  lastDelivery: Date
  level: 'critical' | 'low' | 'normal' | 'full'
}

export const mockTanks: Tank[] = [
  { id: 't1', product: 'Pertalite', capacity: 40000, currentVolume: 8500, lastDelivery: new Date('2024-03-20'), level: 'low' },
  { id: 't2', product: 'Pertamax', capacity: 30000, currentVolume: 18500, lastDelivery: new Date('2024-03-22'), level: 'normal' },
  { id: 't3', product: 'Solar', capacity: 40000, currentVolume: 32000, lastDelivery: new Date('2024-03-23'), level: 'full' },
  { id: 't4', product: 'Dexlite', capacity: 20000, currentVolume: 3200, lastDelivery: new Date('2024-03-18'), level: 'critical' },
  { id: 't5', product: 'Pertamax Turbo', capacity: 16000, currentVolume: 7800, lastDelivery: new Date('2024-03-21'), level: 'normal' },
]

// ============================================
// LPG SALES AGREEMENT (SUBSIDI) MOCK DATA
// ============================================

export interface SalesAgreement {
  id: string
  customerName: string
  customerAddress: string
  quota: number
  realized: number
  periodStart: Date
  periodEnd: Date
  status: 'active' | 'completed' | 'suspended'
  agent: string
}

export const mockSalesAgreements: SalesAgreement[] = [
  {
    id: 'SA-001',
    customerName: 'Warung Bu Siti',
    customerAddress: 'Jl. Merdeka No. 45, Jakarta',
    quota: 100,
    realized: 75,
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    status: 'active',
    agent: 'Agent A',
  },
  {
    id: 'SA-002',
    customerName: 'Warung Pak Budi',
    customerAddress: 'Jl. Ahmad Yani No. 78, Jakarta',
    quota: 150,
    realized: 120,
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    status: 'active',
    agent: 'Agent A',
  },
  {
    id: 'SA-003',
    customerName: 'Mbak Ani Store',
    customerAddress: 'Jl. Sudirman No. 123, Jakarta',
    quota: 200,
    realized: 200,
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    status: 'completed',
    agent: 'Agent B',
  },
  {
    id: 'SA-004',
    customerName: 'Pak Joko Mart',
    customerAddress: 'Jl. Gatot Subroto No. 56, Jakarta',
    quota: 120,
    realized: 45,
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    status: 'suspended',
    agent: 'Agent B',
  },
  {
    id: 'SA-005',
    customerName: 'Toko Bu Rina',
    customerAddress: 'Jl. Diponegoro No. 89, Jakarta',
    quota: 90,
    realized: 60,
    periodStart: new Date('2024-03-01'),
    periodEnd: new Date('2024-03-31'),
    status: 'active',
    agent: 'Agent A',
  },
]

export interface Distribution {
  id: string
  date: Date
  agreementId: string
  customerName: string
  quantity: number
  driver: string
  vehiclePlate: string
  notes?: string
}

export const mockDistributions: Distribution[] = [
  { id: 'DIST-001', date: new Date('2024-03-25'), agreementId: 'SA-001', customerName: 'Warung Bu Siti', quantity: 10, driver: 'Ahmad', vehiclePlate: 'B 1234 ABC', notes: 'Delivered' },
  { id: 'DIST-002', date: new Date('2024-03-25'), agreementId: 'SA-002', customerName: 'Warung Pak Budi', quantity: 15, driver: 'Budi', vehiclePlate: 'B 2345 DEF', notes: 'Delivered' },
  { id: 'DIST-003', date: new Date('2024-03-24'), agreementId: 'SA-001', customerName: 'Warung Bu Siti', quantity: 12, driver: 'Ahmad', vehiclePlate: 'B 1234 ABC', notes: 'Delivered' },
  { id: 'DIST-004', date: new Date('2024-03-24'), agreementId: 'SA-005', customerName: 'Toko Bu Rina', quantity: 8, driver: 'Cahyo', vehiclePlate: 'B 3456 GHI', notes: 'Delivered' },
  { id: 'DIST-005', date: new Date('2024-03-23'), agreementId: 'SA-002', customerName: 'Warung Pak Budi', quantity: 20, driver: 'Budi', vehiclePlate: 'B 2345 DEF', notes: 'Delivered' },
]

// ============================================
// INVENTORY MOCK DATA
// ============================================

export interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  used: number
  manager: string
}

export const mockWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'Gudang Utama', location: 'Jakarta Pusat', capacity: 10000, used: 6500, manager: 'Pak Heru' },
  { id: 'wh2', name: 'Gudang SPBU 34.12345', location: 'Jakarta Barat', capacity: 5000, used: 3200, manager: 'Bu Dewi' },
  { id: 'wh3', name: 'Gudang Cabang', location: 'Jakarta Selatan', capacity: 8000, used: 4800, manager: 'Pak Andi' },
]

export interface StockMovement {
  id: string
  date: Date
  productId: string
  productName: string
  type: 'in' | 'out' | 'transfer'
  quantity: number
  from?: string
  to?: string
  reference: string
  notes?: string
}

export const mockStockMovements: StockMovement[] = [
  { id: 'SM-001', date: new Date('2024-03-25'), productId: 'p1', productName: 'Pertalite', type: 'in', quantity: 5000, to: 'wh2', reference: 'PO-2024-0456', notes: 'Pengiriman rutin' },
  { id: 'SM-002', date: new Date('2024-03-25'), productId: 's1', productName: 'Air Mineral 600ml', type: 'out', quantity: 50, from: 'wh1', reference: 'SO-2024-0234', notes: 'Penjualan' },
  { id: 'SM-003', date: new Date('2024-03-24'), productId: 'o1', productName: 'Mesran B-40', type: 'transfer', quantity: 30, from: 'wh1', to: 'wh2', reference: 'TF-2024-0123', notes: 'Stok opname' },
  { id: 'SM-004', date: new Date('2024-03-24'), productId: 'g1', productName: 'LPG 3kg', type: 'in', quantity: 100, to: 'wh1', reference: 'PO-2024-0455', notes: 'Pengiriman rutin' },
  { id: 'SM-005', date: new Date('2024-03-23'), productId: 's7', productName: 'Indomie Goreng', type: 'out', quantity: 100, from: 'wh2', reference: 'SO-2024-0233', notes: 'Penjualan' },
]

// ============================================
// FINANCE MOCK DATA
// ============================================

export interface JournalEntry {
  id: string
  date: Date
  account: string
  debit: number
  credit: number
  description: string
  reference: string
}

export const mockJournalEntries: JournalEntry[] = [
  { id: 'JE-001', date: new Date('2024-03-25'), account: 'Kas', debit: 15000000, credit: 0, description: 'Penjualan harian', reference: 'TXN-DAILY' },
  { id: 'JE-002', date: new Date('2024-03-25'), account: 'Penjualan BBM', debit: 0, credit: 9750000, description: 'Penjualan Pertalite & Pertamax', reference: 'TXN-SPBU' },
  { id: 'JE-003', date: new Date('2024-03-25'), account: 'Penjualan LPG', debit: 0, credit: 2250000, description: 'Penjualan Gas Elpiji', reference: 'TXN-GAS' },
  { id: 'JE-004', date: new Date('2024-03-24'), account: 'Pembelian BBM', debit: 0, credit: 8500000, description: 'Pembelian dari Pertamina', reference: 'PO-2024-0450' },
  { id: 'JE-005', date: new Date('2024-03-24'), account: 'Kas', debit: 0, credit: 8500000, description: 'Pembayaran ke Pertamina', reference: 'PAY-2024-0234' },
  { id: 'JE-006', date: new Date('2024-03-23'), account: 'Gaji Karyawan', debit: 15000000, credit: 0, description: 'Gaji bulan Maret', reference: 'PAY-2024-0233' },
  { id: 'JE-007', date: new Date('2024-03-23'), account: 'Kas', debit: 0, credit: 15000000, description: 'Pembayaran gaji', reference: 'PAY-2024-0233' },
]

export const profitLossData = {
  revenue: {
    penjualanBBM: 450000000,
    penjualanLPG: 85000000,
    penjualanOli: 65000000,
    penjualanSnB: 45000000,
    total: 645000000,
  },
  expenses: {
    pembelianBBM: 360000000,
    pembelianLPG: 60000000,
    pembelianOli: 45000000,
    pembelianSnB: 30000000,
    gajiKaryawan: 45000000,
    listrikDanAir: 8500000,
    sewa: 25000000,
    lainLain: 12000000,
    total: 585500000,
  },
  netProfit: 59500000,
  grossMargin: 9.22,
}

export const balanceSheetData = {
  assets: {
    currentAssets: {
      kas: 125000000,
      bank: 285000000,
      piutang: 45000000,
      persediaan: 185000000,
      total: 640000000,
    },
    fixedAssets: {
      tanah: 500000000,
      bangunan: 750000000,
      peralatan: 150000000,
      kendaraan: 125000000,
      akumPenyusutan: -250000000,
      total: 1275000000,
    },
    total: 1915000000,
  },
  liabilities: {
    currentLiabilities: {
      hutangDagang: 85000000,
      hutangBank: 200000000,
      total: 285000000,
    },
    longTermLiabilities: {
      hutangBankJangkaPanjang: 350000000,
      total: 350000000,
    },
    total: 635000000,
  },
  equity: {
    modal: 1000000000,
    labaDitahan: 280000000,
    total: 1280000000,
  },
}

// ============================================
// AI PREDICTION MOCK DATA
// ============================================

export interface SalesPrediction {
  date: string
  predicted: number
  confidence: number
  actual?: number
}

export const mockSalesPredictions: SalesPrediction[] = (() => {
  const predictions: SalesPrediction[] = []
  const today = new Date()

  // Historical data (last 7 days with actual values)
  for (let i = 7; i > 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    predictions.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(16000000 + Math.random() * 4000000),
      confidence: 0.92,
      actual: Math.round(15000000 + Math.random() * 5000000),
    })
  }

  // Future predictions (next 7 days)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    predictions.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(17000000 + Math.random() * 4000000),
      confidence: 0.85 - i * 0.05,
    })
  }

  return predictions
})()

export interface StockPrediction {
  productId: string
  productName: string
  currentStock: number
  dailyUsage: number
  daysUntilEmpty: number
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

export const mockStockPredictions: StockPrediction[] = [
  { productId: 'p1', productName: 'Pertalite', currentStock: 8500, dailyUsage: 1200, daysUntilEmpty: 7, recommendation: 'Order 20,000L within 3 days', priority: 'high' },
  { productId: 'p4', productName: 'Dexlite', currentStock: 3200, dailyUsage: 450, daysUntilEmpty: 7, recommendation: 'Order 10,000L within 3 days', priority: 'high' },
  { productId: 'g1', productName: 'LPG 3kg', currentStock: 150, dailyUsage: 18, daysUntilEmpty: 8, recommendation: 'Order 200 cylinders', priority: 'medium' },
  { productId: 'o2', productName: 'Shell Helix HX7 10W-40', currentStock: 45, dailyUsage: 5, daysUntilEmpty: 9, recommendation: 'Order 50 bottles', priority: 'medium' },
  { productId: 's1', productName: 'Air Mineral 600ml', currentStock: 200, dailyUsage: 35, daysUntilEmpty: 6, recommendation: 'Order 500 bottles', priority: 'high' },
]

// ============================================
// NOTIFICATIONS MOCK DATA
// ============================================

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  date: Date
  read: boolean
  actionUrl?: string
}

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Stok Rendah',
    message: 'Stok Dexlite已达临界水平 (3,200L). 请立即订购.',
    type: 'warning',
    date: new Date('2024-03-25T10:30:00'),
    read: false,
    actionUrl: '/spbu/stock',
  },
  {
    id: 'n2',
    title: 'SA已完成',
    message: 'Sales Agreement SA-003 for Mbak Ani Store 已完成.',
    type: 'success',
    date: new Date('2024-03-25T09:15:00'),
    read: false,
    actionUrl: '/lpg/sales-agreement',
  },
  {
    id: 'n3',
    title: '新订单',
    message: '新订单 TXN-10045 已收到 (Rp 520,000).',
    type: 'info',
    date: new Date('2024-03-25T08:45:00'),
    read: true,
    actionUrl: '/pos',
  },
  {
    id: 'n4',
    title: '维护提醒',
    message: 'Dispenser 4 需要校准.',
    type: 'error',
    date: new Date('2024-03-24T16:20:00'),
    read: true,
    actionUrl: '/spbu/dispenser',
  },
]
