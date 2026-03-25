/**
 * Store Error Handler
 * Centralized error handling for all Zustand stores
 */

/**
 * Store error types
 */
export enum StoreErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  PERMISSION = 'PERMISSION',
  CONFLICT = 'CONFLICT',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Store error class
 */
export class StoreError extends Error {
  constructor(
    public type: StoreErrorType,
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'StoreError'
  }
}

/**
 * Error message mappings (Indonesian)
 */
const ERROR_MESSAGES: Record<StoreErrorType, Record<string, string>> = {
  [StoreErrorType.VALIDATION]: {
    cart_empty: 'Keranjang belanja kosong',
    invalid_total: 'Total pembayaran tidak valid',
    insufficient_payment: 'Jumlah pembayaran kurang',
    no_payment_method: 'Metode pembayaran belum dipilih',
    transaction_locked: 'Transaksi sedang diproses. Mohon tunggu sebentar.',
    cart_locked: 'Tidak dapat mengubah keranjang saat transaksi diproses',
    stock_insufficient: 'Stok tidak mencukupi',
    stock_unavailable: 'Produk tidak tersedia',
  },
  [StoreErrorType.NETWORK]: {
    connection_failed: 'Koneksi ke server gagal',
    request_timeout: 'Request timeout. Silakan coba lagi.',
    server_error: 'Terjadi kesalahan pada server',
  },
  [StoreErrorType.PERMISSION]: {
    unauthorized: 'Anda tidak memiliki izin untuk melakukan aksi ini',
    session_expired: 'Sesi Anda telah berakhir. Silakan login kembali.',
    access_denied: 'Akses ditolak',
  },
  [StoreErrorType.CONFLICT]: {
    duplicate_transaction: 'Transaksi duplikat terdeteksi',
    cart_modified: 'Keranjang belanja telah dimodifikasi',
    price_changed: 'Harga produk telah berubah',
    stock_changed: 'Stok produk telah berubah',
  },
  [StoreErrorType.NOT_FOUND]: {
    product_not_found: 'Produk tidak ditemukan',
    customer_not_found: 'Pelanggan tidak ditemukan',
    discount_not_found: 'Diskon tidak ditemukan',
  },
  [StoreErrorType.TIMEOUT]: {
    operation_timeout: 'Operasi timeout. Silakan coba lagi.',
  },
  [StoreErrorType.UNKNOWN]: {
    unknown_error: 'Terjadi kesalahan yang tidak diketahui',
  },
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: StoreError | Error | string): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof StoreError) {
    const messages = ERROR_MESSAGES[error.type]
    return messages[error.code || 'unknown_error'] || error.message || messages.unknown_error
  }

  if (error instanceof Error) {
    return error.message
  }

  return ERROR_MESSAGES[StoreErrorType.UNKNOWN].unknown_error
}

/**
 * Create validation error
 */
export function createValidationError(code: string, message?: string, details?: Record<string, any>): StoreError {
  return new StoreError(
    StoreErrorType.VALIDATION,
    message || getErrorMessage(new StoreError(StoreErrorType.VALIDATION, '', code)),
    code,
    details
  )
}

/**
 * Create network error
 */
export function createNetworkError(code: string, message?: string): StoreError {
  return new StoreError(
    StoreErrorType.NETWORK,
    message || getErrorMessage(new StoreError(StoreErrorType.NETWORK, '', code)),
    code
  )
}

/**
 * Create permission error
 */
export function createPermissionError(code: string, message?: string): StoreError {
  return new StoreError(
    StoreErrorType.PERMISSION,
    message || getErrorMessage(new StoreError(StoreErrorType.PERMISSION, '', code)),
    code
  )
}

/**
 * Create conflict error
 */
export function createConflictError(code: string, message?: string, details?: Record<string, any>): StoreError {
  return new StoreError(
    StoreErrorType.CONFLICT,
    message || getErrorMessage(new StoreError(StoreErrorType.CONFLICT, '', code)),
    code,
    details
  )
}

/**
 * Handle API error and convert to store error
 */
export function handleApiError(error: any): StoreError {
  if (error instanceof StoreError) {
    return error
  }

  // Network errors
  if (!navigator.onLine) {
    return createNetworkError('connection_failed')
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return createNetworkError('request_timeout')
  }

  // HTTP status errors
  if (error.response?.status) {
    const status = error.response.status

    if (status === 401) {
      return createPermissionError('session_expired')
    }

    if (status === 403) {
      return createPermissionError('access_denied')
    }

    if (status === 404) {
      return new StoreError(
        StoreErrorType.NOT_FOUND,
        'Resource tidak ditemukan',
        'resource_not_found'
      )
    }

    if (status === 409) {
      return createConflictError('duplicate_transaction')
    }

    if (status === 422) {
      return createValidationError('invalid_data', error.response.data?.message)
    }

    if (status >= 500) {
      return createNetworkError('server_error')
    }
  }

  // Validation errors from API
  if (error.response?.data?.errors) {
    return createValidationError('validation_failed', error.response.data.message, {
      errors: error.response.data.errors,
    })
  }

  // Unknown error
  return new StoreError(
    StoreErrorType.UNKNOWN,
    error.message || 'Terjadi kesalahan yang tidak diketahui',
    'unknown_error',
    { originalError: error }
  )
}

/**
 * Toast notification configuration from error
 */
export function getToastConfigFromError(error: StoreError | Error | string): {
  title: string
  description: string
  variant: 'destructive' | 'default'
} {
  const message = getErrorMessage(error)

  if (error instanceof StoreError) {
    switch (error.type) {
      case StoreErrorType.VALIDATION:
        return {
          title: 'Validasi Gagal',
          description: message,
          variant: 'destructive',
        }
      case StoreErrorType.PERMISSION:
        return {
          title: 'Izin Ditolak',
          description: message,
          variant: 'destructive',
        }
      case StoreErrorType.CONFLICT:
        return {
          title: 'Konflik',
          description: message,
          variant: 'destructive',
        }
      default:
        return {
          title: 'Error',
          description: message,
          variant: 'destructive',
        }
    }
  }

  return {
    title: 'Error',
    description: message,
    variant: 'destructive',
  }
}

/**
 * Log error for debugging
 */
export function logError(error: StoreError | Error, context?: string) {
  const prefix = context ? `[${context}]` : '[Store Error]'
  
  if (error instanceof StoreError) {
    console.error(prefix, {
      type: error.type,
      code: error.code,
      message: error.message,
      details: error.details,
    })
  } else {
    console.error(prefix, error)
  }
}
