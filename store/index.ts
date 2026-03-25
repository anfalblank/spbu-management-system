/**
 * Zustand Stores Barrel Export (Enhanced)
 * Centralized export of all Zustand stores with production safeguards
 */

// Types
export type {
  User,
  UserRole,
  CartItem,
  PaymentMethod,
  PaymentStatus,
  TransactionState,
  ModalType,
  Theme,
  SidebarState,
  StockAlertLevel,
  Warehouse,
  DashboardFilters,
  AuthState,
  POSState,
  UIState,
  DashboardState,
  StockState,
} from './types'

// Auth Store (Enhanced with token expiry and auto-logout)
export { useAuthStore } from './useAuthStore'
export {
  selectUser,
  selectIsAuthenticated,
  selectToken,
  selectUserRole,
  selectHasPermission,
  selectTokenExpiry,
  selectTimeUntilExpiry,
  useAuthStatus,
} from './useAuthStore'

// POS Store (Enhanced with transaction safeguards)
export { usePOSStore } from './usePOSStore'
export {
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
  selectCartItemCount,
  selectPaymentMethod,
  selectIsProcessing,
  selectCanCheckout,
  selectTransactionLocked,
  useCartSummary,
  usePaymentState,
  useTransactionLock,
  useCartValidation,
} from './usePOSStore'

// UI Store
export { useUIStore } from './useUIStore'
export {
  selectSidebarOpen,
  selectSidebarCollapsed,
  selectTheme,
  selectActiveModal,
  selectNotifications,
  selectUnreadNotifications,
  selectSearchQuery,
  useSidebar,
  useModal,
  useNotifications,
  useTheme,
} from './useUIStore'

// Dashboard Store
export { useDashboardStore } from './useDashboardStore'
export {
  selectDashboardFilters,
  selectDashboardPeriod,
  selectDashboardModule,
  selectShowPredictions,
  selectChartTimeRange,
  selectPinnedWidgets,
  useDashboardFilters,
  useChartSettings,
  useWidgetLayout,
  useDashboardTab,
} from './useDashboardStore'

// Stock Store
export { useStockStore } from './useStockStore'
export {
  selectStockAlerts,
  selectSelectedWarehouse,
  selectWarehouses,
  selectUnacknowledgedAlerts,
  useStockAlerts,
  useWarehouseState,
  useAlertThresholds,
  useAlertSummary,
} from './useStockStore'

// SPBU Store
export { useSPBUStore } from './useSPBUStore'
export type {
  Dispenser,
  Nozzle,
  Tank,
  Shift,
  Settlement,
  SettlementNozzle,
  SettlementPayment,
  SPBUReport,
  DispenserStatus,
  NozzleStatus,
  FuelType,
  ShiftStatus,
  SettlementStatus,
} from './useSPBUStore'

// LPG Store
export { useLPGStore } from './useLPGStore'
export type {
  Customer,
  SalesAgreement,
  RealisasiItem,
  LPGProduct,
  LPGOrder,
  LPGReport,
  LPGProductType,
  SalesAgreementStatus,
  RealisasiStatus,
  LPGCategory,
} from './useLPGStore'

export { useAutoOrderStore } from './useAutoOrderStore'
export type {
  StockAlert,
  Order,
  OrderItem,
  OrderTimeline,
  OrderStatus,
  OrderPriority,
  Supplier,
  Notification,
  AlertSeverity,
  NotificationChannel,
} from './useAutoOrderStore'

// Store Utilities (Error handling, middleware, integration)
export {
  StoreError,
  StoreErrorType,
  getErrorMessage,
  createValidationError,
  createNetworkError,
  createPermissionError,
  createConflictError,
  handleApiError,
  getToastConfigFromError,
  logError,
} from './utils/error-handler'

export {
  logger,
  reset,
  devtools,
  immer,
  performanceMonitor,
  actionTracker,
  localStorageSync,
  createDebouncedListener,
  combineMiddlewares,
  deepFreeze,
} from './utils/middleware'

export {
  initializeStoreIntegrations,
  handleLogout,
  handleTokenExpiry,
  processTransaction,
  recoverCart,
  createCartBackup,
  getStoreHealth,
  debugStores,
  clearAllStores,
} from './utils/integration'
