/**
 * API Module Barrel Export
 * Centralized export of all API-related functionality
 */

// Client
export { apiClient, get, post, put, patch, del } from './client/api-client'
export type { ApiRequestConfig, ApiResponse } from './client/api-client'

// Config
export { API_CONFIG, getEnvConfig } from './client/config'
export type { ApiConfig } from './client/config'

// Services
export {
  authService,
  productService,
  posService,
  spbuService,
  lpgService,
  dashboardService,
  AuthService,
  ProductService,
  POSService,
  SPBUService,
  LPGService,
  DashboardService,
  BaseService,
} from './services'

// Types
export type {
  // Common
  PaginationParams,
  PaginatedResponse,
  ApiResponse as ApiResponseType,
  ListResponse,
  FilterParams,
  DateRangeFilter,
  CreateResponse,
  UpdateResponse,
  DeleteResponse,
  BulkOperationResponse,
  ExportParams,
  StatisticsResponse,
  ChartDataPoint,
  MetricsResponse,
} from './types/common'

// Error handling
export {
  ApiError,
  handleApiError,
  parseValidationErrors,
  getToastMessage,
  handleApiErrorInUI,
} from './utils/error-handler'

// Retry
export { retryRequest, createRetriableFunction } from './utils/retry'
export type { RetryConfig } from './utils/retry'
