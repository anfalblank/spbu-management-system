/**
 * Mock Data Initialization for SPBU and LPG Stores
 * Provides realistic initial data for development and testing
 */

import { useSPBUStore } from '@/store/useSPBUStore'
import { useLPGStore } from '@/store/useLPGStore'
import type {
  Dispenser,
  Nozzle,
  Tank,
  Shift,
  Settlement,
  SalesAgreement,
  RealisasiItem,
  LPGProduct,
  FuelType,
} from '@/store'

// SPBU Mock Data
export const mockDispensers: Dispenser[] = [
  {
    id: 'disp-1',
    name: 'Dispenser 1',
    number: 1,
    status: 'active',
    location: 'Area Depan',
    nozzles: [
      {
        id: 'nozzle-1-1',
        dispenserId: 'disp-1',
        number: 1,
        fuelType: 'Pertalite',
        status: 'active',
        pricePerLiter: 10000,
      },
      {
        id: 'nozzle-1-2',
        dispenserId: 'disp-1',
        number: 2,
        fuelType: 'Pertamax',
        status: 'active',
        pricePerLiter: 13700,
      },
    ],
  },
  {
    id: 'disp-2',
    name: 'Dispenser 2',
    number: 2,
    status: 'active',
    location: 'Area Depan',
    nozzles: [
      {
        id: 'nozzle-2-1',
        dispenserId: 'disp-2',
        number: 1,
        fuelType: 'Solar',
        status: 'active',
        pricePerLiter: 6800,
      },
      {
        id: 'nozzle-2-2',
        dispenserId: 'disp-2',
        number: 2,
        fuelType: 'Dexlite',
        status: 'active',
        pricePerLiter: 14750,
      },
    ],
  },
  {
    id: 'disp-3',
    name: 'Dispenser 3',
    number: 3,
    status: 'active',
    location: 'Area Belakang',
    nozzles: [
      {
        id: 'nozzle-3-1',
        dispenserId: 'disp-3',
        number: 1,
        fuelType: 'Pertamax Turbo',
        status: 'active',
        pricePerLiter: 14300,
      },
      {
        id: 'nozzle-3-2',
        dispenserId: 'disp-3',
        number: 2,
        fuelType: 'Dex',
        status: 'active',
        pricePerLiter: 16100,
      },
    ],
  },
  {
    id: 'disp-4',
    name: 'Dispenser 4',
    number: 4,
    status: 'maintenance',
    location: 'Area Samping',
    nozzles: [
      {
        id: 'nozzle-4-1',
        dispenserId: 'disp-4',
        number: 1,
        fuelType: 'Pertalite',
        status: 'inactive',
        pricePerLiter: 10000,
      },
    ],
  },
]

export const mockTanks: Tank[] = [
  {
    id: 'tank-1',
    number: 1,
    fuelType: 'Pertalite',
    capacity: 30000, // 30 kiloliters
    currentVolume: 18500,
    minVolume: 5000,
    lastDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastDeliveryVolume: 10000,
  },
  {
    id: 'tank-2',
    number: 2,
    fuelType: 'Pertamax',
    capacity: 20000,
    currentVolume: 12500,
    minVolume: 4000,
    lastDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastDeliveryVolume: 8000,
  },
  {
    id: 'tank-3',
    number: 3,
    fuelType: 'Solar',
    capacity: 25000,
    currentVolume: 3200,
    minVolume: 5000,
    lastDelivery: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastDeliveryVolume: 12000,
  },
  {
    id: 'tank-4',
    number: 4,
    fuelType: 'Dexlite',
    capacity: 15000,
    currentVolume: 9800,
    minVolume: 3000,
    lastDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastDeliveryVolume: 6000,
  },
  {
    id: 'tank-5',
    number: 5,
    fuelType: 'Pertamax Turbo',
    capacity: 10000,
    currentVolume: 6500,
    minVolume: 2000,
    lastDelivery: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastDeliveryVolume: 5000,
  },
  {
    id: 'tank-6',
    number: 6,
    fuelType: 'Dex',
    capacity: 8000,
    currentVolume: 5200,
    minVolume: 2000,
    lastDelivery: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastDeliveryVolume: 4000,
  },
]

// LPG Mock Data
export const mockSalesAgreements: SalesAgreement[] = [
  {
    id: 'sa-001',
    number: 'SA/2025/03/001',
    customerId: 'CUST-001',
    customerName: 'PT Berkah Abadi Gas',
    productType: '3kg',
    category: 'subsidi',
    quota: 500,
    quotaUnit: 'unit',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    period: '2025-03',
    status: 'active',
    pricePerUnit: 16000,
    realizedQuota: 245,
    remainingQuota: 255,
    utilizationPercentage: 49,
    notes: 'Pelanggan tetap sejak 2023',
    approvedBy: 'admin',
    approvedAt: '2025-03-01T00:00:00Z',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-03-25T10:30:00Z',
  },
  {
    id: 'sa-002',
    number: 'SA/2025/03/002',
    customerId: 'CUST-002',
    customerName: 'CV Mitra Jaya',
    productType: '3kg',
    category: 'subsidi',
    quota: 300,
    quotaUnit: 'unit',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    period: '2025-03',
    status: 'active',
    pricePerUnit: 16000,
    realizedQuota: 180,
    remainingQuota: 120,
    utilizationPercentage: 60,
    approvedBy: 'admin',
    approvedAt: '2025-03-01T00:00:00Z',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-03-25T10:30:00Z',
  },
  {
    id: 'sa-003',
    number: 'SA/2025/03/003',
    customerId: 'CUST-003',
    customerName: 'UD Gas Sejahtera',
    productType: '5.5kg',
    category: 'subsidi',
    quota: 100,
    quotaUnit: 'unit',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    period: '2025-03',
    status: 'active',
    pricePerUnit: 27500,
    realizedQuota: 75,
    remainingQuota: 25,
    utilizationPercentage: 75,
    notes: 'Order mingguan',
    approvedBy: 'admin',
    approvedAt: '2025-03-01T00:00:00Z',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-03-25T10:30:00Z',
  },
  {
    id: 'sa-004',
    number: 'SA/2025/03/004',
    customerId: 'CUST-004',
    customerName: 'Toko Sumber Rezeki',
    productType: '12kg',
    category: 'subsidi',
    quota: 50,
    quotaUnit: 'unit',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    period: '2025-03',
    status: 'active',
    pricePerUnit: 133000,
    realizedQuota: 12,
    remainingQuota: 38,
    utilizationPercentage: 24,
    approvedBy: 'admin',
    approvedAt: '2025-03-01T00:00:00Z',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-03-25T10:30:00Z',
  },
  {
    id: 'sa-005',
    number: 'SA/2025/02/015',
    customerId: 'CUST-005',
    customerName: 'PT Gas Mandiri',
    productType: '3kg',
    category: 'subsidi',
    quota: 400,
    quotaUnit: 'unit',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    period: '2025-02',
    status: 'completed',
    pricePerUnit: 16000,
    realizedQuota: 400,
    remainingQuota: 0,
    utilizationPercentage: 100,
    approvedBy: 'admin',
    approvedAt: '2025-02-01T00:00:00Z',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-02-28T23:59:59Z',
  },
]

export const mockRealisasi: RealisasiItem[] = [
  {
    id: 'real-001',
    salesAgreementId: 'sa-001',
    salesAgreementNumber: 'SA/2025/03/001',
    customerId: 'CUST-001',
    customerName: 'PT Berkah Abadi Gas',
    productType: '3kg',
    category: 'subsidi',
    quantity: 50,
    unitPrice: 16000,
    totalPrice: 800000,
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: 'Jl. Merdeka No. 123',
    recipientName: 'Budi Santoso',
    recipientPhone: '08123456789',
    driverName: 'Ahmad',
    vehiclePlate: 'B 1234 ABC',
    notes: 'Pengiriman rutin minggu ke-3',
    status: 'delivered',
    previousQuota: 195,
    newQuota: 245,
    quotaDeduction: 50,
    createdBy: 'operator-1',
    approvedBy: 'admin',
    approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'real-002',
    salesAgreementId: 'sa-002',
    salesAgreementNumber: 'SA/2025/03/002',
    customerId: 'CUST-002',
    customerName: 'CV Mitra Jaya',
    productType: '3kg',
    category: 'subsidi',
    quantity: 30,
    unitPrice: 16000,
    totalPrice: 480000,
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: 'Jl. Sudirman No. 45',
    recipientName: 'Dewi Lestari',
    recipientPhone: '08198765432',
    driverName: 'Bambang',
    vehiclePlate: 'B 5678 XYZ',
    notes: '',
    status: 'approved',
    previousQuota: 150,
    newQuota: 180,
    quotaDeduction: 30,
    createdBy: 'operator-2',
    approvedBy: 'admin',
    approvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'real-003',
    salesAgreementId: 'sa-003',
    salesAgreementNumber: 'SA/2025/03/003',
    customerId: 'CUST-003',
    customerName: 'UD Gas Sejahtera',
    productType: '5.5kg',
    category: 'subsidi',
    quantity: 25,
    unitPrice: 27500,
    totalPrice: 687500,
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: 'Jl. Gatot Subroto No. 78',
    recipientName: 'Eko Prasetyo',
    recipientPhone: '08234567890',
    driverName: 'Cecep',
    vehiclePlate: 'D 1234 AB',
    notes: '',
    status: 'pending',
    previousQuota: 50,
    newQuota: 75,
    quotaDeduction: 25,
    createdBy: 'operator-1',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
]

export const mockLPGProducts: LPGProduct[] = [
  {
    id: 'lpg-3kg',
    name: 'LPG 3kg',
    type: '3kg',
    category: 'subsidi',
    price: 16000,
    stock: 250,
    unit: 'unit',
    image: '',
    barcode: '8991234567890',
    isActive: true,
  },
  {
    id: 'lpg-5-5kg',
    name: 'LPG 5.5kg',
    type: '5.5kg',
    category: 'subsidi',
    price: 27500,
    stock: 80,
    unit: 'unit',
    image: '',
    barcode: '8991234567891',
    isActive: true,
  },
  {
    id: 'lpg-12kg',
    name: 'LPG 12kg Bright Gas',
    type: '12kg',
    category: 'non-subsidi',
    price: 185000,
    stock: 45,
    unit: 'unit',
    image: '',
    barcode: '8991234567892',
    isActive: true,
  },
  {
    id: 'lpg-50kg',
    name: 'LPG 50kg',
    type: '50kg',
    category: 'non-subsidi',
    price: 850000,
    stock: 12,
    unit: 'unit',
    image: '',
    barcode: '8991234567893',
    isActive: true,
  },
]

/**
 * Initialize SPBU store with mock data
 */
export function initializeSPBUStore() {
  const store = useSPBUStore.getState()

  // Only initialize if empty
  if (store.dispensers.length === 0) {
    store.setDispensers(mockDispensers)
    store.setTanks(mockTanks)
    console.log('✅ SPBU store initialized with mock data')
  }
}

/**
 * Initialize LPG store with mock data
 */
export function initializeLPGStore() {
  const store = useLPGStore.getState()

  // Only initialize if empty
  if (store.salesAgreements.length === 0) {
    store.setSalesAgreements(mockSalesAgreements)
    store.setRealisasi(mockRealisasi)
    store.setProducts(mockLPGProducts)
    console.log('✅ LPG store initialized with mock data')
  }
}

/**
 * Initialize all stores with mock data
 */
export function initializeAllStores() {
  initializeSPBUStore()
  initializeLPGStore()
}
