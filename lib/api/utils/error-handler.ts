/**
 * API Error Handler
 * Centralized error handling for API requests
 */

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any,
    public requestId?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.status === 0 || this.code === 'NETWORK_ERROR'
  }

  /**
   * Check if error is a validation error
   */
  isValidationError(): boolean {
    return this.status === 400 || this.code === 'VALIDATION_ERROR'
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return this.status === 401 || this.code === 'UNAUTHORIZED'
  }

  /**
   * Check if error is a permission error
   */
  isPermissionError(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN'
  }

  /**
   * Check if error is a not found error
   */
  isNotFoundError(): boolean {
    return this.status === 404 || this.code === 'NOT_FOUND'
  }

  /**
   * Check if error is a server error
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    }
    if (this.isAuthError()) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.'
    }
    if (this.isPermissionError()) {
      return 'Anda tidak memiliki izin untuk melakukan aksi ini.'
    }
    if (this.isNotFoundError()) {
      return 'Data yang dicari tidak ditemukan.'
    }
    if (this.isValidationError()) {
      return this.details?.message || 'Data yang dimasukkan tidak valid.'
    }
    if (this.isServerError()) {
      return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
    }
    return this.message || 'Terjadi kesalahan yang tidak diketahui.'
  }
}

/**
 * Error response format from API
 */
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: any
    requestId?: string
  }
}

/**
 * Handle API response error
 */
export async function handleApiError(response: Response): Promise<ApiError> {
  let errorData: ErrorResponse | null = null

  try {
    errorData = await response.json()
  } catch {
    // Response is not JSON
  }

  const status = response.status
  const code = errorData?.error?.code || getErrorCode(status)
  const message = errorData?.error?.message || getDefaultErrorMessage(status)
  const details = errorData?.error?.details
  const requestId = errorData?.error?.requestId

  return new ApiError(status, code, message, details, requestId)
}

/**
 * Get error code from status
 */
function getErrorCode(status: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT',
  }

  return codes[status] || 'UNKNOWN_ERROR'
}

/**
 * Get default error message
 */
function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Permintaan tidak valid',
    401: 'Autentikasi diperlukan',
    403: 'Akses ditolak',
    404: 'Sumber daya tidak ditemukan',
    409: 'Konflik dengan data yang ada',
    422: 'Validasi gagal',
    429: 'Terlalu banyak permintaan',
    500: 'Kesalahan server internal',
    502: 'Gateway tidak valid',
    503: 'Layanan tidak tersedia',
    504: 'Gateway timeout',
  }

  return messages[status] || 'Terjadi kesalahan'
}

/**
 * Parse validation errors
 */
export function parseValidationErrors(details: any): Record<string, string[]> {
  if (!details || typeof details !== 'object') {
    return {}
  }

  const errors: Record<string, string[]> = {}

  for (const [field, messages] of Object.entries(details)) {
    if (Array.isArray(messages)) {
      errors[field] = messages.map(String)
    } else if (typeof messages === 'string') {
      errors[field] = [messages]
    }
  }

  return errors
}

/**
 * Toast message for API error
 */
export function getToastMessage(error: ApiError): {
  title: string
  description: string
  variant: 'destructive' | 'default'
} {
  if (error.isNetworkError()) {
    return {
      title: 'Koneksi Gagal',
      description: error.getUserMessage(),
      variant: 'destructive',
    }
  }

  if (error.isAuthError()) {
    return {
      title: 'Sesi Berakhir',
      description: error.getUserMessage(),
      variant: 'destructive',
    }
  }

  if (error.isServerError()) {
    return {
      title: 'Kesalahan Server',
      description: error.getUserMessage(),
      variant: 'destructive',
    }
  }

  return {
    title: 'Error',
    description: error.getUserMessage(),
    variant: 'destructive',
  }
}

/**
 * Handle API error in UI
 */
export function handleApiErrorInUI(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof Error) {
    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ApiError(0, 'NETWORK_ERROR', 'Gagal menghubungi server')
    }

    // Check for abort errors
    if (error.name === 'AbortError') {
      return new ApiError(0, 'REQUEST_CANCELLED', 'Permintaan dibatalkan')
    }

    return new ApiError(0, 'UNKNOWN_ERROR', error.message)
  }

  return new ApiError(0, 'UNKNOWN_ERROR', 'Terjadi kesalahan yang tidak diketahui')
}
