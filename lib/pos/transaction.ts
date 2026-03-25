/**
 * POS Transaction Processing
 * Complete transaction flow with production-level reliability
 */

import { posService } from '@/lib/api'
import { usePOSStore, useAuthStore } from '@/store'
import type { CartItem, PaymentMethod } from '@/store/types'

/**
 * Transaction status
 */
export enum TransactionStatus {
  IDLE = 'idle',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean
  transactionId?: string
  error?: string
  code?: string
  details?: any
}

/**
 * Transaction request data
 */
export interface TransactionRequest {
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  paidAmount: number
  change: number
  cashierId: string
  cashierName: string
  customerId?: string | null
  notes?: string | null
  discountCode?: string | null
}

/**
 * Process a POS transaction with all safeguards
 */
export async function processTransaction(): Promise<TransactionResult> {
  const posStore = usePOSStore.getState()
  const authStore = useAuthStore.getState()

  // 1. Check authentication
  if (!authStore.isAuthenticated || !authStore.user) {
    return {
      success: false,
      error: 'Anda belum login. Silakan login terlebih dahulu.',
      code: 'NOT_AUTHENTICATED',
    }
  }

  // 2. Validate cart state
  const cartValidation = posStore.validateCart()
  if (!cartValidation.valid) {
    return {
      success: false,
      error: cartValidation.errors[0] || 'Validasi keranjang gagal',
      code: 'VALIDATION_ERROR',
      details: { errors: cartValidation.errors },
    }
  }

  // 3. Check transaction lock
  if (posStore.hasTransactionLock()) {
    return {
      success: false,
      error: 'Transaksi sedang diproses. Mohon tunggu sebentar.',
      code: 'TRANSACTION_LOCKED',
    }
  }

  // 4. Acquire transaction lock
  const lock = posStore.acquireTransactionLock()
  if (!lock) {
    return {
      success: false,
      error: 'Gagal memproses transaksi. Silakan coba lagi.',
      code: 'LOCK_ACQUISITION_FAILED',
    }
  }

  try {
    // 5. Set processing state
    posStore.setProcessing(true)
    posStore.setStatus('processing')

    // 6. Prepare transaction data
    const transactionData: TransactionRequest = {
      items: posStore.items,
      subtotal: posStore.subtotal,
      tax: posStore.tax,
      discount: posStore.discount,
      total: posStore.total,
      paymentMethod: posStore.paymentMethod!,
      paidAmount: posStore.paidAmount,
      change: posStore.change,
      cashierId: authStore.user.id,
      cashierName: authStore.user.name,
      customerId: posStore.customerId,
      notes: posStore.notes,
      discountCode: posStore.discountCode,
    }

    // 7. Call API
    const response = await posService.createTransaction(transactionData)

    if (response.status === 'success' && response.transaction) {
      // 8. Transaction successful
      posStore.setStatus('completed')
      posStore.setLastTransactionId(response.transaction.id || '')

      // Store transaction details for receipt
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lastTransaction', JSON.stringify(response.transaction))
      }

      return {
        success: true,
        transactionId: response.transaction.id,
      }
    } else {
      // Transaction failed
      posStore.setStatus('failed')
      return {
        success: false,
        error: response.error || 'Transaksi gagal',
        code: response.status,
      }
    }
  } catch (error) {
    // API error
    posStore.setStatus('failed')
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan pada koneksi'

    return {
      success: false,
      error: errorMessage,
      code: 'API_ERROR',
    }
  } finally {
    // 9. Always release lock and reset processing state
    posStore.setProcessing(false)
    posStore.releaseTransactionLock()
  }
}

/**
 * Validate stock before transaction
 */
export async function validateStockBeforeTransaction(): Promise<{
  valid: boolean
  errors: Array<{ productId: string; productName: string; requested: number; available: number }>
}> {
  const posStore = usePOSStore.getState()
  const errors: Array<{ productId: string; productName: string; requested: number; available: number }> = []

  // TODO: Fetch current stock from API
  // For now, use cached stock from cart items
  posStore.items.forEach((item) => {
    if (item.stock !== undefined && item.quantity > item.stock) {
      errors.push({
        productId: item.productId,
        productName: item.name,
        requested: item.quantity,
        available: item.stock,
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Format transaction data for receipt
 */
export function formatTransactionForReceipt(transaction: any) {
  return {
    id: transaction.id,
    date: new Date().toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
    }),
    cashier: transaction.cashierName || 'Kasir',
    items: transaction.items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    })),
    subtotal: transaction.subtotal,
    tax: transaction.tax,
    discount: transaction.discount,
    total: transaction.total,
    paymentMethod: transaction.paymentMethod,
    paidAmount: transaction.paidAmount,
    change: transaction.change,
  }
}

/**
 * Reset cart after successful transaction
 */
export function resetCartAfterTransaction(delay = 3000) {
  setTimeout(() => {
    const posStore = usePOSStore.getState()
    posStore.resetCart()
  }, delay)
}

/**
 * Get last transaction from sessionStorage
 */
export function getLastTransaction() {
  if (typeof window === 'undefined') return null

  try {
    const stored = sessionStorage.getItem('lastTransaction')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    return null
  }

  return null
}

/**
 * Clear last transaction from sessionStorage
 */
export function clearLastTransaction() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('lastTransaction')
  }
}
