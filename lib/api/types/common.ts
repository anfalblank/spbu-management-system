/**
 * Common API Types
 * Shared types used across all API services
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T
  meta?: {
    requestId: string
    timestamp: string
    version?: string
  }
}

/**
 * List response with optional pagination
 */
export interface ListResponse<T> {
  items: T[]
  total?: number
  page?: number
  pageSize?: number
}

/**
 * Filter parameters
 */
export interface FilterParams {
  search?: string
  category?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: any
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate: string
  endDate: string
}

/**
 * Create response
 */
export interface CreateResponse {
  id: string
  createdAt: string
}

/**
 * Update response
 */
export interface UpdateResponse {
  id: string
  updatedAt: string
  affectedRows?: number
}

/**
 * Delete response
 */
export interface DeleteResponse {
  id: string
  deleted: boolean
  deletedAt?: string
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  success: number
  failed: number
  errors?: Array<{
    id: string
    error: string
  }>
}

/**
 * Export request parameters
 */
export interface ExportParams {
  format: 'csv' | 'xlsx' | 'pdf'
  dateRange?: DateRangeFilter
  filters?: FilterParams
  fields?: string[]
}

/**
 * Statistics response
 */
export interface StatisticsResponse {
  total: number
  growth?: number
  period?: string
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

/**
 * Metrics response
 */
export interface MetricsResponse {
  [key: string]: number | string | ChartDataPoint[]
}
