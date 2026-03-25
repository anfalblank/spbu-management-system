/**
 * Zustand Store Types
 * Shared types used across all Zustand stores
 */

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'manager' | 'cashier' | 'viewer'

/**
 * User interface
 */
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phoneNumber?: string
  createdAt: string
  updatedAt: string
}

/**
 * Cart item interface
 */
export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  module: 'spbu' | 'gas' | 'oli' | 'snb'
  unit?: string
  stock?: number
  image?: string
  discount?: number
}

/**
 * Payment method types
 */
export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'voucher'

/**
 * Payment status
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

/**
 * Transaction state
 */
export interface TransactionState {
  items: CartItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  paymentMethod: PaymentMethod | null
  paidAmount: number
  change: number
  status: PaymentStatus
}

/**
 * Modal types
 */
export type ModalType =
  | 'payment'
  | 'receipt'
  | 'discount'
  | 'confirm'
  | 'shift-settlement'
  | 'product-form'
  | 'customer-form'
  | null

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Sidebar state
 */
export interface SidebarState {
  isOpen: boolean
  isCollapsed: boolean
  activeItem: string | null
}

/**
 * Stock alert level
 */
export type StockAlertLevel = 'critical' | 'low' | 'warning'

/**
 * Stock alert
 */
export interface StockAlert {
  id: string
  productId: string
  productName: string
  currentStock: number
  minStock: number
  level: StockAlertLevel
  warehouseId: string
  warehouseName: string
  acknowledged: boolean
  createdAt: string
}

/**
 * Warehouse
 */
export interface Warehouse {
  id: string
  name: string
  location: string
  isActive: boolean
}

/**
 * Dashboard filter state
 */
export interface DashboardFilters {
  period: 'today' | 'week' | 'month' | 'custom'
  startDate?: string
  endDate?: string
  module?: 'all' | 'spbu' | 'gas' | 'oli' | 'snb'
}

/**
 * Auth store state
 */
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * POS store state
 */
export interface POSState {
  items: CartItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  discountCode: string | null
  total: number
  paymentMethod: PaymentMethod | null
  paidAmount: number
  change: number
  status: PaymentStatus
  customerId: string | null
  notes: string | null
  lastTransactionId: string | null
  isProcessing: boolean
}

/**
 * UI store state
 */
export interface UIState {
  sidebar: SidebarState
  theme: Theme
  activeModal: ModalType
  modalData: Record<string, any> | null
  notifications: Array<{
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    createdAt: string
  }>
  isLoading: boolean
  searchQuery: string
  breadcrumbs: Array<{ label: string; href?: string }>
}

/**
 * Dashboard store state
 */
export interface DashboardState {
  filters: DashboardFilters
  selectedKpiPeriod: 'today' | 'week' | 'month'
  activeTab: string
  showPredictions: boolean
  chartTimeRange: '7d' | '30d' | '90d'
  pinnedWidgets: string[]
  refreshInterval: number | null
}

/**
 * Stock store state
 */
export interface StockState {
  alerts: StockAlert[]
  selectedWarehouse: string | null
  warehouses: Warehouse[]
  alertThresholds: {
    critical: number // percentage
    low: number
    warning: number
  }
  lastSync: string | null
  autoRefreshEnabled: boolean
}
