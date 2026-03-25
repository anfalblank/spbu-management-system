/**
 * POS Hooks
 * Custom hooks for POS operations
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePOSStore } from '@/store'
import { useAuth } from '@/lib/auth'
import {
  processTransaction,
  resetCartAfterTransaction,
  getLastTransaction,
  clearLastTransaction,
  formatTransactionForReceipt,
  validateStockBeforeTransaction,
} from './transaction'
import {
  validateCheckout,
  formatValidationError,
  getValidationMessage,
} from './validation'
import type { CartItem, PaymentMethod } from '@/store/types'
import type { TransactionResult, TransactionStatus } from './transaction'

/**
 * Hook for managing POS cart operations
 */
export function usePOSCart() {
  const {
    items,
    addItem,
    removeItem,
    updateQty,
    clearItems,
    resetCart,
  } = usePOSStore()

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    addItem({
      ...item,
      id: `cart-${Date.now()}-${Math.random()}`,
    })
  }, [addItem])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      updateQty(id, quantity)
    }
  }, [removeItem, updateQty])

  const clearCart = useCallback(() => {
    if (confirm('Keranjang akan dikosongkan. Lanjutkan?')) {
      clearItems()
    }
  }, [clearItems])

  return {
    items,
    totalItems,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    isEmpty: items.length === 0,
  }
}

/**
 * Hook for managing checkout process
 */
export function usePOSCheckout() {
  const {
    items,
    total,
    paymentMethod,
    paidAmount,
    setPaymentMethod,
    setPaidAmount,
    resetCart,
    validateCart,
  } = usePOSStore()

  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE)
  const [error, setError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const startTransaction = useCallback(async (): Promise<TransactionResult> => {
    // Reset state
    setError(null)
    setStatus(TransactionStatus.VALIDATING)

    // Validate checkout
    const validation = validateCheckout({
      items,
      total,
      paymentMethod,
      paidAmount,
    })

    if (!validation.valid) {
      setError(formatValidationError(validation.errors))
      setStatus(TransactionStatus.FAILED)
      return {
        success: false,
        error: formatValidationError(validation.errors),
        code: 'VALIDATION_ERROR',
      }
    }

    // Show warnings if any
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('Checkout warnings:', validation.warnings)
    }

    setStatus(TransactionStatus.PROCESSING)

    // Process transaction
    try {
      const result = await processTransaction()

      if (result.success) {
        setStatus(TransactionStatus.SUCCESS)
        setTransactionId(result.transactionId || null)

        // Reset cart after delay
        resetCartAfterTransaction(3000)

        return result
      } else {
        setStatus(TransactionStatus.FAILED)
        setError(result.error || 'Transaksi gagal')
        return result
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui'
      setStatus(TransactionStatus.FAILED)
      setError(errorMessage)

      return {
        success: false,
        error: errorMessage,
        code: 'UNKNOWN_ERROR',
      }
    }
  }, [items, total, paymentMethod, paidAmount])

  const resetTransaction = useCallback(() => {
    setStatus(TransactionStatus.IDLE)
    setError(null)
    setTransactionId(null)
  }, [])

  const canCheckout = items.length > 0 &&
    total > 0 &&
    paymentMethod !== null &&
    status === TransactionStatus.IDLE

  return {
    status,
    error,
    transactionId,
    startTransaction,
    resetTransaction,
    canCheckout,
    isProcessing: status === TransactionStatus.PROCESSING,
    isSuccess: status === TransactionStatus.SUCCESS,
    isFailed: status === TransactionStatus.FAILED,
  }
}

/**
 * Hook for managing payment
 */
export function usePOSPayment() {
  const {
    paymentMethod,
    paidAmount,
    total,
    change,
    setPaymentMethod,
    setPaidAmount,
    calculateChange,
  } = usePOSStore()

  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    setPaymentMethod(method)

    // Auto-set paid amount for non-cash payments
    if (method !== 'cash') {
      setPaidAmount(total)
    }
  }, [setPaymentMethod, setPaidAmount, total])

  const updatePaidAmount = useCallback((amount: number) => {
    setPaidAmount(amount)
    calculateChange()
  }, [setPaidAmount, calculateChange])

  const remainingAmount = Math.max(0, total - paidAmount)
  const isAmountSufficient = paidAmount >= total
  const isExactChange = paidAmount === total

  return {
    paymentMethod,
    paidAmount,
    total,
    change,
    remainingAmount,
    isAmountSufficient,
    isExactChange,
    selectPaymentMethod,
    updatePaidAmount,
  }
}

/**
 * Hook for getting transaction receipt
 */
export function usePOSTransactionReceipt(transactionId?: string) {
  const [receipt, setReceipt] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReceipt = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to get from sessionStorage first
      const lastTransaction = getLastTransaction()
      if (lastTransaction && lastTransaction.id === id) {
        setReceipt(formatTransactionForReceipt(lastTransaction))
        setIsLoading(false)
        return
      }

      // TODO: Fetch from API
      // const data = await posService.getReceipt(id)
      // setReceipt(formatTransactionForReceipt(data))

      setIsLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil struk'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [])

  const clearReceipt = useCallback(() => {
    setReceipt(null)
    setError(null)
    clearLastTransaction()
  }, [])

  // Auto-fetch if transactionId provided
  if (transactionId && !receipt) {
    fetchReceipt(transactionId)
  }

  return {
    receipt,
    isLoading,
    error,
    fetchReceipt,
    clearReceipt,
  }
}

/**
 * Hook for product quick actions
 */
export function usePOSProductActions() {
  const { addToCart, items } = usePOSCart()

  const addProduct = useCallback((product: {
    id: string
    name: string
    price: number
    module: 'spbu' | 'gas' | 'oli' | 'snb'
    stock?: number
    image?: string
  }) => {
    // Check if already in cart
    const existingItem = items.find(item => item.productId === product.id)

    if (existingItem) {
      // Update quantity
      updateQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      // Add new item
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        module: product.module,
        stock: product.stock,
        image: product.image,
      })
    }
  }, [addToCart, items])

  const removeProduct = useCallback((productId: string) => {
    const item = items.find(item => item.productId === productId)
    if (item) {
      removeItem(item.id)
    }
  }, [items])

  const updateProductQuantity = useCallback((productId: string, quantity: number) => {
    const item = items.find(item => item.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeProduct(productId)
      } else {
        updateQuantity(item.id, quantity)
      }
    }
  }, [items])

  const getProductQuantity = useCallback((productId: string) => {
    const item = items.find(item => item.productId === productId)
    return item?.quantity || 0
  }, [items])

  const isInCart = useCallback((productId: string) => {
    return items.some(item => item.productId === productId)
  }, [items])

  return {
    addProduct,
    removeProduct,
    updateProductQuantity,
    getProductQuantity,
    isInCart,
  }
}
