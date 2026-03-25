/**
 * LPG Store
 * Manages LPG operations including Sales Agreements (SA), realisasi, and quota tracking
 */

import { create } from 'zustand'
import { createJSONStorage, persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { logger } from './utils/middleware'

// Types
export type LPGProductType = '3kg' | '5.5kg' | '12kg' | '50kg'
export type SalesAgreementStatus = 'active' | 'completed' | 'suspended' | 'expired' | 'cancelled'
export type RealisasiStatus = 'pending' | 'approved' | 'rejected' | 'delivered'
export type LPGCategory = 'subsidi' | 'non-subsidi'

export interface Customer {
  id: string
  name: string
  address: string
  phone: string
  nik?: string
  type: 'individual' | 'business'
}

export interface SalesAgreement {
  id: string
  number: string // SA number
  customerId: string
  customerName: string
  productType: LPGProductType
  category: LPGCategory
  quota: number // in units or kg depending on product
  quotaUnit: 'unit' | 'kg'
  startDate: string
  endDate: string
  period: string // e.g., "2025-03"
  status: SalesAgreementStatus
  pricePerUnit: number
  realizedQuota: number
  remainingQuota: number
  utilizationPercentage: number
  notes?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface RealisasiItem {
  id: string
  salesAgreementId: string
  salesAgreementNumber: string
  customerId: string
  customerName: string
  productType: LPGProductType
  category: LPGCategory
  quantity: number // in units
  unitPrice: number
  totalPrice: number
  deliveryDate: string
  deliveryAddress: string
  recipientName: string
  recipientPhone: string
  driverName?: string
  vehiclePlate?: string
  notes?: string
  status: RealisasiStatus
  previousQuota: number
  newQuota: number
  quotaDeduction: number
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export interface LPGProduct {
  id: string
  name: string
  type: LPGProductType
  category: LPGCategory
  price: number
  stock: number
  unit: 'unit' | 'kg'
  image?: string
  barcode?: string
  isActive: boolean
}

export interface LPGOrder {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  items: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  orderDate: string
  deliveryDate?: string
  deliveryAddress?: string
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface LPGReport {
  period: string
  category: LPGCategory
  totalSales: number
  totalRevenue: number
  totalQuota: number
  totalRealization: number
  utilizationRate: number
  perProductType: {
    productType: LPGProductType
    sales: number
    revenue: number
    quota: number
    realization: number
    utilizationRate: number
  }[]
  topCustomers: {
    customerId: string
    customerName: string
    totalQuantity: number
    totalRevenue: number
  }[]
}

// State interface
interface LPGState {
  // Sales Agreements
  salesAgreements: SalesAgreement[]
  selectedSalesAgreement: SalesAgreement | null
  activeSalesAgreements: SalesAgreement[]

  // Realisasi
  realisasi: RealisasiItem[]
  selectedRealisasi: RealisasiItem | null
  pendingRealisasi: RealisasiItem[]

  // Products
  products: LPGProduct[]
  selectedProduct: LPGProduct | null

  // Orders (non-subsidi)
  orders: LPGOrder[]
  selectedOrder: LPGOrder | null

  // Reports
  reports: LPGReport[]
  selectedReport: LPGReport | null

  // Loading states
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  // Actions
  // Sales Agreement actions
  setSalesAgreements: (salesAgreements: SalesAgreement[]) => void
  setSelectedSalesAgreement: (salesAgreement: SalesAgreement | null) => void
  createSalesAgreement: (salesAgreement: Omit<SalesAgreement, 'id' | 'realizedQuota' | 'remainingQuota' | 'utilizationPercentage' | 'createdAt' | 'updatedAt'>) => SalesAgreement
  updateSalesAgreement: (id: string, data: Partial<SalesAgreement>) => void
  deleteSalesAgreement: (id: string) => void
  suspendSalesAgreement: (id: string, reason: string) => void
  activateSalesAgreement: (id: string) => void
  getActiveSalesAgreements: () => SalesAgreement[]
  getSalesAgreementByCustomer: (customerId: string) => SalesAgreement[]

  // Realisasi actions
  setRealisasi: (realisasi: RealisasiItem[]) => void
  setSelectedRealisasi: (realisasi: RealisasiItem | null) => void
  createRealisasi: (realisasi: Omit<RealisasiItem, 'id' | 'quotaDeduction' | 'newQuota' | 'createdAt' | 'updatedAt'>) => RealisasiItem
  approveRealisasi: (id: string, approvedBy: string) => void
  rejectRealisasi: (id: string, reason: string) => void
  deliverRealisasi: (id: string, deliveredAt: string) => void
  getRealisasiByPeriod: (period: string) => RealisasiItem[]
  getRealisasiBySalesAgreement: (salesAgreementId: string) => RealisasiItem[]

  // Product actions
  setProducts: (products: LPGProduct[]) => void
  setSelectedProduct: (product: LPGProduct | null) => void
  addProduct: (product: LPGProduct) => void
  updateProduct: (id: string, data: Partial<LPGProduct>) => void
  deleteProduct: (id: string) => void
  getProductsByCategory: (category: LPGCategory) => LPGProduct[]

  // Order actions
  setOrders: (orders: LPGOrder[]) => void
  setSelectedOrder: (order: LPGOrder | null) => void
  createOrder: (order: Omit<LPGOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => LPGOrder
  updateOrder: (id: string, data: Partial<LPGOrder>) => void
  cancelOrder: (id: string, reason: string) => void

  // Report actions
  setReports: (reports: LPGReport[]) => void
  setSelectedReport: (report: LPGReport | null) => void
  generateReport: (period: string, category: LPGCategory) => LPGReport | null

  // Quota management
  checkQuotaAvailability: (salesAgreementId: string, quantity: number) => { available: boolean; remainingQuota: number }
  deductQuota: (salesAgreementId: string, quantity: number) => void
  addQuota: (salesAgreementId: string, quantity: number) => void

  // UI actions
  setLoading: (loading: boolean) => void
  setSubmitting: (submitting: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

// Initial state
const initialState = {
  salesAgreements: [],
  selectedSalesAgreement: null,
  activeSalesAgreements: [],
  realisasi: [],
  selectedRealisasi: null,
  pendingRealisasi: [],
  products: [],
  selectedProduct: null,
  orders: [],
  selectedOrder: null,
  reports: [],
  selectedReport: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
}

// Helper function to calculate utilization
const calculateUtilization = (realized: number, quota: number): number => {
  if (quota === 0) return 0
  return (realized / quota) * 100
}

// Create store
export const useLPGStore = create<LPGState>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...initialState,

          // Sales Agreement actions
          setSalesAgreements: (salesAgreements) =>
            set((state) => {
              state.salesAgreements = salesAgreements
              state.activeSalesAgreements = salesAgreements.filter((sa) => sa.status === 'active')
            }),

          setSelectedSalesAgreement: (salesAgreement) =>
            set((state) => {
              state.selectedSalesAgreement = salesAgreement
            }),

          createSalesAgreement: (salesAgreementData) => {
            const now = new Date().toISOString()
            const newSalesAgreement: SalesAgreement = {
              ...salesAgreementData,
              id: `sa-${Date.now()}`,
              realizedQuota: 0,
              remainingQuota: salesAgreementData.quota,
              utilizationPercentage: 0,
              createdAt: now,
              updatedAt: now,
            }
            set((state) => {
              state.salesAgreements.push(newSalesAgreement)
              if (newSalesAgreement.status === 'active') {
                state.activeSalesAgreements.push(newSalesAgreement)
              }
            })
            return newSalesAgreement
          },

          updateSalesAgreement: (id, data) =>
            set((state) => {
              const index = state.salesAgreements.findIndex((sa) => sa.id === id)
              if (index !== -1) {
                const sa = state.salesAgreements[index]
                Object.assign(sa, data)
                sa.updatedAt = new Date().toISOString()
                sa.remainingQuota = sa.quota - sa.realizedQuota
                sa.utilizationPercentage = calculateUtilization(sa.realizedQuota, sa.quota)

                // Update active sales agreements list
                state.activeSalesAgreements = state.salesAgreements.filter((s) => s.status === 'active')

                // Update selected if it's the same
                if (state.selectedSalesAgreement?.id === id) {
                  state.selectedSalesAgreement = { ...sa }
                }
              }
            }),

          deleteSalesAgreement: (id) =>
            set((state) => {
              state.salesAgreements = state.salesAgreements.filter((sa) => sa.id !== id)
              state.activeSalesAgreements = state.salesAgreements.filter((s) => s.status === 'active')
              if (state.selectedSalesAgreement?.id === id) {
                state.selectedSalesAgreement = null
              }
            }),

          suspendSalesAgreement: (id, reason) =>
            set((state) => {
              const sa = state.salesAgreements.find((s) => s.id === id)
              if (sa) {
                sa.status = 'suspended'
                sa.notes = reason
                sa.updatedAt = new Date().toISOString()
                state.activeSalesAgreements = state.salesAgreements.filter((s) => s.status === 'active')
              }
            }),

          activateSalesAgreement: (id) =>
            set((state) => {
              const sa = state.salesAgreements.find((s) => s.id === id)
              if (sa) {
                sa.status = 'active'
                sa.updatedAt = new Date().toISOString()
                state.activeSalesAgreements = state.salesAgreements.filter((s) => s.status === 'active')
              }
            }),

          getActiveSalesAgreements: () => get().activeSalesAgreements,

          getSalesAgreementByCustomer: (customerId) =>
            get().salesAgreements.filter((sa) => sa.customerId === customerId && sa.status === 'active'),

          // Realisasi actions
          setRealisasi: (realisasi) =>
            set((state) => {
              state.realisasi = realisasi
              state.pendingRealisasi = realisasi.filter((r) => r.status === 'pending')
            }),

          setSelectedRealisasi: (realisasiItem) =>
            set((state) => {
              state.selectedRealisasi = realisasiItem
            }),

          createRealisasi: (realisasiData) => {
            const now = new Date().toISOString()
            const sa = get().salesAgreements.find((s) => s.id === realisasiData.salesAgreementId)

            if (!sa) {
              throw new Error('Sales Agreement not found')
            }

            const quotaDeduction = realisasiData.quantity
            const newQuota = sa.realizedQuota + quotaDeduction

            // Check if quota is available
            if (newQuota > sa.quota) {
              throw new Error('Quota tidak mencukupi')
            }

            const newRealisasi: RealisasiItem = {
              ...realisasiData,
              id: `realisasi-${Date.now()}`,
              previousQuota: sa.realizedQuota,
              newQuota,
              quotaDeduction,
              createdAt: now,
              updatedAt: now,
            }

            set((state) => {
              state.realisasi.push(newRealisasi)
              if (newRealisasi.status === 'pending') {
                state.pendingRealisasi.push(newRealisasi)
              }

              // Update SA quota
              const saIndex = state.salesAgreements.findIndex((s) => s.id === sa.id)
              if (saIndex !== -1) {
                state.salesAgreements[saIndex].realizedQuota = newQuota
                state.salesAgreements[saIndex].remainingQuota = sa.quota - newQuota
                state.salesAgreements[saIndex].utilizationPercentage = calculateUtilization(newQuota, sa.quota)
                state.salesAgreements[saIndex].updatedAt = now
              }
            })

            return newRealisasi
          },

          approveRealisasi: (id, approvedBy) =>
            set((state) => {
              const realisasi = state.realisasi.find((r) => r.id === id)
              if (realisasi && realisasi.status === 'pending') {
                realisasi.status = 'approved'
                realisasi.approvedBy = approvedBy
                realisasi.approvedAt = new Date().toISOString()
                realisasi.updatedAt = new Date().toISOString()

                // Remove from pending
                state.pendingRealisasi = state.realisasi.filter((r) => r.status === 'pending')
              }
            }),

          rejectRealisasi: (id, reason) =>
            set((state) => {
              const realisasi = state.realisasi.find((r) => r.id === id)
              if (realisasi && realisasi.status === 'pending') {
                realisasi.status = 'rejected'
                realisasi.notes = reason
                realisasi.updatedAt = new Date().toISOString()

                // Remove from pending
                state.pendingRealisasi = state.realisasi.filter((r) => r.status === 'pending')

                // Restore quota
                const sa = state.salesAgreements.find((s) => s.id === realisasi.salesAgreementId)
                if (sa) {
                  sa.realizedQuota = realisasi.previousQuota
                  sa.remainingQuota = sa.quota - realisasi.previousQuota
                  sa.utilizationPercentage = calculateUtilization(realisasi.previousQuota, sa.quota)
                }
              }
            }),

          deliverRealisasi: (id, deliveredAt) =>
            set((state) => {
              const realisasi = state.realisasi.find((r) => r.id === id)
              if (realisasi && realisasi.status === 'approved') {
                realisasi.status = 'delivered'
                realisasi.deliveredAt = deliveredAt
                realisasi.updatedAt = new Date().toISOString()
              }
            }),

          getRealisasiByPeriod: (period) =>
            get().realisasi.filter((r) => r.deliveryDate.startsWith(period)),

          getRealisasiBySalesAgreement: (salesAgreementId) =>
            get().realisasi.filter((r) => r.salesAgreementId === salesAgreementId),

          // Product actions
          setProducts: (products) =>
            set((state) => {
              state.products = products
            }),

          setSelectedProduct: (product) =>
            set((state) => {
              state.selectedProduct = product
            }),

          addProduct: (product) =>
            set((state) => {
              state.products.push(product)
            }),

          updateProduct: (id, data) =>
            set((state) => {
              const index = state.products.findIndex((p) => p.id === id)
              if (index !== -1) {
                Object.assign(state.products[index], data)
              }
            }),

          deleteProduct: (id) =>
            set((state) => {
              state.products = state.products.filter((p) => p.id !== id)
              if (state.selectedProduct?.id === id) {
                state.selectedProduct = null
              }
            }),

          getProductsByCategory: (category) =>
            get().products.filter((p) => p.category === category && p.isActive),

          // Order actions
          setOrders: (orders) =>
            set((state) => {
              state.orders = orders
            }),

          setSelectedOrder: (order) =>
            set((state) => {
              state.selectedOrder = order
            }),

          createOrder: (orderData) => {
            const now = new Date().toISOString()
            const newOrder: LPGOrder = {
              ...orderData,
              id: `order-${Date.now()}`,
              orderNumber: `ORD-${Date.now()}`,
              createdAt: now,
              updatedAt: now,
            }
            set((state) => {
              state.orders.push(newOrder)
            })
            return newOrder
          },

          updateOrder: (id, data) =>
            set((state) => {
              const index = state.orders.findIndex((o) => o.id === id)
              if (index !== -1) {
                Object.assign(state.orders[index], data)
                state.orders[index].updatedAt = new Date().toISOString()
              }
            }),

          cancelOrder: (id, reason) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (order) {
                order.status = 'cancelled'
                order.notes = reason
                order.updatedAt = new Date().toISOString()
              }
            }),

          // Report actions
          setReports: (reports) =>
            set((state) => {
              state.reports = reports
            }),

          setSelectedReport: (report) =>
            set((state) => {
              state.selectedReport = report
            }),

          generateReport: (period, category) => {
            const state = get()
            const filteredSalesAgreements = state.salesAgreements.filter(
              (sa) => sa.period === period && sa.category === category
            )
            const filteredRealisasi = state.realisasi.filter((r) =>
              r.deliveryDate.startsWith(period) && r.category === category && r.status === 'delivered'
            )

            const totalQuota = filteredSalesAgreements.reduce((sum, sa) => sum + sa.quota, 0)
            const totalRealization = filteredRealisasi.reduce((sum, r) => sum + r.quantity, 0)
            const totalRevenue = filteredRealisasi.reduce((sum, r) => sum + r.totalPrice, 0)
            const totalSales = filteredRealisasi.length
            const utilizationRate = totalQuota > 0 ? (totalRealization / totalQuota) * 100 : 0

            // Per product type breakdown
            const productTypes: LPGProductType[] = ['3kg', '5.5kg', '12kg', '50kg']
            const perProductType = productTypes.map((productType) => {
              const productRealisasi = filteredRealisasi.filter((r) => r.productType === productType)
              const sales = productRealisasi.length
              const revenue = productRealisasi.reduce((sum, r) => sum + r.totalPrice, 0)
              const realization = productRealisasi.reduce((sum, r) => sum + r.quantity, 0)
              const quota = filteredSalesAgreements
                .filter((sa) => sa.productType === productType)
                .reduce((sum, sa) => sum + sa.quota, 0)
              const utilizationRate = quota > 0 ? (realization / quota) * 100 : 0

              return {
                productType,
                sales,
                revenue,
                quota,
                realization,
                utilizationRate,
              }
            })

            // Top customers
            const customerMap = new Map<string, { quantity: number; revenue: number }>()
            filteredRealisasi.forEach((r) => {
              const existing = customerMap.get(r.customerId)
              if (existing) {
                existing.quantity += r.quantity
                existing.revenue += r.totalPrice
              } else {
                customerMap.set(r.customerId, { quantity: r.quantity, revenue: r.totalPrice })
              }
            })

            const topCustomers = Array.from(customerMap.entries())
              .map(([customerId, data]) => ({
                customerId,
                customerName: state.salesAgreements.find((sa) => sa.customerId === customerId)?.customerName || '',
                ...data,
              }))
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 10)

            const report: LPGReport = {
              period,
              category,
              totalSales,
              totalRevenue,
              totalQuota,
              totalRealization,
              utilizationRate,
              perProductType,
              topCustomers,
            }

            set((state) => {
              const existingIndex = state.reports.findIndex((r) => r.period === period && r.category === category)
              if (existingIndex !== -1) {
                state.reports[existingIndex] = report
              } else {
                state.reports.push(report)
              }
            })

            return report
          },

          // Quota management
          checkQuotaAvailability: (salesAgreementId, quantity) => {
            const sa = get().salesAgreements.find((s) => s.id === salesAgreementId)
            if (!sa) {
              return { available: false, remainingQuota: 0 }
            }
            const remaining = sa.quota - sa.realizedQuota
            return { available: remaining >= quantity, remainingQuota: remaining }
          },

          deductQuota: (salesAgreementId, quantity) => {
            set((state) => {
              const sa = state.salesAgreements.find((s) => s.id === salesAgreementId)
              if (sa) {
                sa.realizedQuota += quantity
                sa.remainingQuota = sa.quota - sa.realizedQuota
                sa.utilizationPercentage = calculateUtilization(sa.realizedQuota, sa.quota)
              }
            })
          },

          addQuota: (salesAgreementId, quantity) => {
            set((state) => {
              const sa = state.salesAgreements.find((s) => s.id === salesAgreementId)
              if (sa) {
                sa.quota += quantity
                sa.remainingQuota = sa.quota - sa.realizedQuota
                sa.utilizationPercentage = calculateUtilization(sa.realizedQuota, sa.quota)
              }
            })
          },

          // UI actions
          setLoading: (loading) =>
            set((state) => {
              state.isLoading = loading
            }),

          setSubmitting: (submitting) =>
            set((state) => {
              state.isSubmitting = submitting
            }),

          setError: (error) =>
            set((state) => {
              state.error = error
            }),

          clearError: () =>
            set((state) => {
              state.error = null
            }),

          reset: () =>
            set((state) => {
              Object.assign(state, initialState)
            }),
        })),
        {
          name: 'lpg-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            salesAgreements: state.salesAgreements,
            realisasi: state.realisasi,
            products: state.products,
            orders: state.orders,
            reports: state.reports,
          }),
        }
      )
    )
  )
)
