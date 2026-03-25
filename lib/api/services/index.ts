/**
 * API Services Barrel Export
 * Centralized export of all API services
 */

// Services
export { authService } from './auth.service'
export { productService } from './product.service'
export { posService } from './pos.service'
export { spbuService } from './spbu.service'
export { lpgService } from './lpg.service'
export { dashboardService } from './dashboard.service'

// Service classes (for extending if needed)
export { AuthService } from './auth.service'
export { ProductService } from './product.service'
export { POSService } from './pos.service'
export { SPBUService } from './spbu.service'
export { LPGService } from './lpg.service'
export { DashboardService } from './dashboard.service'

// Base service
export { BaseService } from './base-service'

// Auth Types
export type {
  LoginCredentials,
  LoginResponse,
  ChangePasswordRequest,
} from './auth.service'

// Types
export type {
  Product,
  ProductFilters,
} from './product.service'

export type {
  CartItem,
  Discount,
  Transaction,
  CreateTransactionRequest,
  TransactionResponse,
  DailySalesSummary,
  ShiftSettlementRequest,
} from './pos.service'

export type {
  Dispenser,
  Tank,
  ShiftSettlement,
  FuelStock,
  SPBUSalesReport,
} from './spbu.service'

export type {
  SalesAgreement,
  CreateSalesAgreementRequest,
  Distribution,
  CreateDistributionRequest,
  LPGProduct,
  LPGOrder,
  LPGAnalytics,
} from './lpg.service'

export type {
  SalesData,
  KPIData,
  SalesPrediction,
  StockPrediction,
  Notification,
} from './dashboard.service'
