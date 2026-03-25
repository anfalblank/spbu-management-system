/**
 * POS Store (Enhanced)
 * Manages POS cart state with persistence and transaction safeguards
 * CRITICAL: Cart must survive page reload and navigation
 * SECURITY: Prevents duplicate transactions and ensures data integrity
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, PaymentMethod, PaymentStatus, POSState } from './types'

/**
 * Transaction lock data
 */
interface TransactionLock {
  id: string
  timestamp: string
  userId: string | null
  total: number
  itemCount: number
}

/**
 * Stock validation error
 */
interface StockValidationError {
  productId: string
  productName: string
  requestedQty: number
  availableQty: number
  message: string
}

interface POSActions {
  // Cart item management
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, quantity: number) => void
  setItemPrice: (id: string, price: number) => void
  clearItems: () => void

  // Payment management
  setPaymentMethod: (method: PaymentMethod) => void
  setPaidAmount: (amount: number) => void
  calculateChange: () => void

  // Discount management
  setDiscount: (amount: number) => void
  setDiscountCode: (code: string | null) => void
  applyDiscount: (code: string, amount: number) => Promise<{ success: boolean; message?: string }>

  // Calculations
  calculateTotals: () => void
  resetCart: (keepPaymentInfo?: boolean) => void
  resetPayment: () => void

  // Transaction state
  setStatus: (status: PaymentStatus) => void
  setProcessing: (processing: boolean) => void
  setLastTransactionId: (id: string) => void

  // Transaction lock (prevent duplicate submissions)
  acquireTransactionLock: () => TransactionLock | null
  releaseTransactionLock: () => void
  hasTransactionLock: () => boolean
  isTransactionLocked: (lockId: string) => boolean

  // Customer & notes
  setCustomerId: (id: string | null) => void
  setNotes: (notes: string | null) => void

  // User association (for cart isolation)
  setUserId: (userId: string | null) => void
  getUserId: () => string | null
  resetCartForUser: (userId: string) => void

  // Getters
  getItemById: (id: string) => CartItem | undefined
  getItemCount: () => number
  getTotalItems: () => number
  hasItem: (productId: string) => boolean

  // Enhanced validation
  validateCart: () => { valid: boolean; errors: string[] }
  validateStock: (availableStock: Map<string, number>) => { valid: boolean; errors: StockValidationError[] }
  canProcessPayment: () => { canProcess: boolean; reason?: string }

  // Error handling
  getLastError: () => string | null
  clearError: () => void

  // Snapshot/restore (for recovery)
  createSnapshot: () => string
  restoreSnapshot: (snapshot: string) => boolean
}

interface POSStore extends POSState {
  transactionLock: TransactionLock | null
  userId: string | null // User-specific cart isolation
  lastError: string | null
}

/**
 * Default POS state
 */
const defaultState: POSState = {
  items: [],
  subtotal: 0,
  tax: 0,
  taxRate: 0.11, // 11% PPN
  discount: 0,
  discountCode: null,
  total: 0,
  paymentMethod: null,
  paidAmount: 0,
  change: 0,
  status: 'pending',
  customerId: null,
  notes: null,
  lastTransactionId: null,
  isProcessing: false,
}

/**
 * Create POS store with persistence and safeguards
 */
export const usePOSStore = create<POSStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      transactionLock: null,
      userId: null,
      lastError: null,

      // Cart item management
      addItem: (item) => {
        const state = get()

        // Prevent adding items while processing transaction
        if (state.isProcessing) {
          set({ lastError: 'Cannot modify cart during transaction processing' })
          return
        }

        const existingItem = state.items.find(
          (i) => i.productId === item.productId
        )

        let newItems: CartItem[]

        if (existingItem) {
          // Update quantity if item exists
          newItems = state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        } else {
          // Add new item with unique ID
          newItems = [
            ...state.items,
            { ...item, id: `cart-${Date.now()}-${Math.random()}` },
          ]
        }

        set({ items: newItems, lastError: null })
        get().calculateTotals()
      },

      removeItem: (id) => {
        const state = get()

        // Prevent removing items while processing transaction
        if (state.isProcessing) {
          set({ lastError: 'Cannot modify cart during transaction processing' })
          return
        }

        set((state) => ({ items: state.items.filter((i) => i.id !== id), lastError: null }))
        get().calculateTotals()
      },

      updateQty: (id, quantity) => {
        const state = get()

        // Prevent updating quantities while processing transaction
        if (state.isProcessing) {
          set({ lastError: 'Cannot modify cart during transaction processing' })
          return
        }

        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
          lastError: null,
        }))
        get().calculateTotals()
      },

      setItemPrice: (id, price) => {
        const state = get()

        if (state.isProcessing) {
          set({ lastError: 'Cannot modify cart during transaction processing' })
          return
        }

        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, price } : i)),
          lastError: null,
        }))
        get().calculateTotals()
      },

      clearItems: () => {
        const state = get()

        if (state.isProcessing) {
          set({ lastError: 'Cannot modify cart during transaction processing' })
          return
        }

        set({ items: [], lastError: null })
        get().calculateTotals()
      },

      // Payment management
      setPaymentMethod: (method) => {
        const state = get()

        if (state.isProcessing) {
          set({ lastError: 'Cannot change payment method during processing' })
          return
        }

        set({ paymentMethod: method, lastError: null })
        get().calculateChange()
      },

      setPaidAmount: (amount) => {
        set({ paidAmount: amount, lastError: null })
        get().calculateChange()
      },

      calculateChange: () => {
        const state = get()
        const change = Math.max(0, state.paidAmount - state.total)
        set({ change })
      },

      // Discount management
      setDiscount: (amount) => {
        const state = get()

        if (state.isProcessing) {
          set({ lastError: 'Cannot apply discount during processing' })
          return
        }

        set({ discount: Math.max(0, amount), lastError: null })
        get().calculateTotals()
      },

      setDiscountCode: (code) => {
        set({ discountCode: code, lastError: null })
      },

      applyDiscount: async (code, amount) => {
        const state = get()

        if (state.isProcessing) {
          return { success: false, message: 'Cannot apply discount during processing' }
        }

        try {
          // TODO: Validate discount code with API
          // const response = await posService.validateDiscountCode(code)

          // Mock validation
          const isValid = code.toLowerCase() === 'diskon10'

          if (isValid) {
            set({ discount: amount, discountCode: code, lastError: null })
            get().calculateTotals()
            return { success: true }
          }

          set({ lastError: 'Invalid discount code' })
          return { success: false, message: 'Kode diskon tidak valid' }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to validate discount'
          set({ lastError: errorMsg })
          return { success: false, message: errorMsg }
        }
      },

      // Calculations
      calculateTotals: () => {
        const state = get()

        const subtotal = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )

        const tax = Math.round(subtotal * state.taxRate)
        const total = Math.max(0, subtotal + tax - state.discount)

        set({ subtotal, tax, total })
        get().calculateChange()
      },

      resetCart: (keepPaymentInfo = false) => {
        const state = get()

        // Prevent resetting while processing
        if (state.isProcessing) {
          set({ lastError: 'Cannot reset cart during transaction processing' })
          return
        }

        set((state) => ({
          items: [],
          subtotal: 0,
          tax: 0,
          discount: 0,
          discountCode: null,
          total: 0,
          paidAmount: 0,
          change: 0,
          status: 'pending',
          customerId: null,
          notes: null,
          paymentMethod: keepPaymentInfo ? state.paymentMethod : null,
          transactionLock: null,
          lastError: null,
        }))
      },

      resetPayment: () => {
        set({
          paidAmount: 0,
          change: 0,
          paymentMethod: null,
          lastError: null,
        })
      },

      // Transaction state
      setStatus: (status) => {
        set({ status })
      },

      setProcessing: (processing) => {
        const state = get()

        if (processing) {
          // Acquire transaction lock when starting processing
          const lock = get().acquireTransactionLock()
          if (!lock) {
            set({ lastError: 'Transaction already in progress' })
            return
          }
        } else {
          // Release lock when done processing
          get().releaseTransactionLock()
        }

        set({ isProcessing: processing })
      },

      setLastTransactionId: (id) => {
        set({ lastTransactionId: id })
      },

      // Transaction lock (prevent duplicate submissions)
      acquireTransactionLock: () => {
        const state = get()

        // Check if already locked
        if (state.transactionLock) {
          // Check if lock is stale (older than 5 minutes)
          const lockAge = Date.now() - new Date(state.transactionLock.timestamp).getTime()
          if (lockAge < 5 * 60 * 1000) {
            return null // Lock is still valid
          }
        }

        // Create new lock
        const lock: TransactionLock = {
          id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          userId: state.userId,
          total: state.total,
          itemCount: state.items.length,
        }

        set({ transactionLock: lock })
        return lock
      },

      releaseTransactionLock: () => {
        set({ transactionLock: null })
      },

      hasTransactionLock: () => {
        const state = get()
        return state.transactionLock !== null
      },

      isTransactionLocked: (lockId: string) => {
        const state = get()
        return state.transactionLock?.id === lockId
      },

      // User association (for cart isolation)
      setUserId: (userId) => {
        const state = get()

        // If user changed, reset cart
        if (state.userId && state.userId !== userId && state.items.length > 0) {
          // Save current cart for old user
          // TODO: Implement cart save/load per user
          get().resetCart()
        }

        set({ userId })
      },

      getUserId: () => {
        return get().userId
      },

      resetCartForUser: (userId) => {
        const state = get()

        if (state.userId === userId) {
          get().resetCart()
        }
      },

      // Getters
      getItemById: (id) => {
        return get().items.find((i) => i.id === id)
      },

      getItemCount: () => {
        return get().items.length
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      hasItem: (productId) => {
        return get().items.some((i) => i.productId === productId)
      },

      // Enhanced validation
      validateCart: () => {
        const state = get()
        const errors: string[] = []

        if (state.items.length === 0) {
          errors.push('Keranjang belanja kosong')
        }

        if (state.total <= 0) {
          errors.push('Total pembayaran tidak valid')
        }

        if (!state.paymentMethod) {
          errors.push('Metode pembayaran belum dipilih')
        }

        if (state.paymentMethod === 'cash' && state.paidAmount < state.total) {
          errors.push('Jumlah pembayaran kurang')
        }

        // Check if already processing
        if (state.isProcessing) {
          errors.push('Transaksi sedang diproses')
        }

        // Check transaction lock
        if (state.transactionLock) {
          errors.push('Transaksi terkunci. Mohon tunggu sebentar.')
        }

        return {
          valid: errors.length === 0,
          errors,
        }
      },

      validateStock: (availableStock: Map<string, number>) => {
        const state = get()
        const errors: StockValidationError[] = []

        state.items.forEach((item) => {
          const available = availableStock.get(item.productId)

          if (available === undefined) {
            errors.push({
              productId: item.productId,
              productName: item.name,
              requestedQty: item.quantity,
              availableQty: 0,
              message: `Stok ${item.name} tidak tersedia`,
            })
          } else if (item.quantity > available) {
            errors.push({
              productId: item.productId,
              productName: item.name,
              requestedQty: item.quantity,
              availableQty: available,
              message: `Stok ${item.name} tidak mencukupi (tersedia: ${available}, diminta: ${item.quantity})`,
            })
          }
        })

        return {
          valid: errors.length === 0,
          errors,
        }
      },

      canProcessPayment: () => {
        const validation = get().validateCart()

        if (!validation.valid) {
          return {
            canProcess: false,
            reason: validation.errors[0] || 'Validasi gagal',
          }
        }

        return { canProcess: true }
      },

      // Error handling
      getLastError: () => {
        return get().lastError
      },

      clearError: () => {
        set({ lastError: null })
      },

      // Snapshot/restore (for recovery)
      createSnapshot: () => {
        const state = get()
        return JSON.stringify({
          items: state.items,
          subtotal: state.subtotal,
          tax: state.tax,
          discount: state.discount,
          discountCode: state.discountCode,
          total: state.total,
          paymentMethod: state.paymentMethod,
          customerId: state.customerId,
          notes: state.notes,
          timestamp: new Date().toISOString(),
        })
      },

      restoreSnapshot: (snapshot: string) => {
        try {
          const data = JSON.parse(snapshot)

          // Validate snapshot structure
          if (!data.items || !Array.isArray(data.items)) {
            return false
          }

          // Check if cart is empty or processing
          const state = get()
          if (state.isProcessing || state.items.length > 0) {
            return false
          }

          set({
            items: data.items,
            subtotal: data.subtotal || 0,
            tax: data.tax || 0,
            discount: data.discount || 0,
            discountCode: data.discountCode || null,
            total: data.total || 0,
            paymentMethod: data.paymentMethod || null,
            customerId: data.customerId || null,
            notes: data.notes || null,
            status: 'pending',
            lastError: null,
          })

          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'pos-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist only cart state, not transaction state
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        tax: state.tax,
        taxRate: state.taxRate,
        discount: state.discount,
        discountCode: state.discountCode,
        total: state.total,
        paymentMethod: state.paymentMethod,
        customerId: state.customerId,
        notes: state.notes,
        userId: state.userId,
        // Don't persist these
        paidAmount: 0,
        change: 0,
        status: 'pending',
        lastTransactionId: null,
        isProcessing: false,
        transactionLock: null,
        lastError: null,
      }),
    }
  )
)

// Auto-reset payment state on page load (security)
if (typeof window !== 'undefined') {
  // Reset payment-specific state on mount
  const state = usePOSStore.getState()
  if (state.isProcessing || state.paidAmount > 0 || state.transactionLock) {
    usePOSStore.setState({
      isProcessing: false,
      paidAmount: 0,
      change: 0,
      transactionLock: null,
      status: 'pending',
    })
  }
}

// Selectors for optimized reads
export const selectCartItems = (state: POSStore) => state.items
export const selectCartSubtotal = (state: POSStore) => state.subtotal
export const selectCartTotal = (state: POSStore) => state.total
export const selectCartItemCount = (state: POSStore) => state.getTotalItems()
export const selectPaymentMethod = (state: POSStore) => state.paymentMethod
export const selectIsProcessing = (state: POSStore) => state.isProcessing
export const selectCanCheckout = (state: POSStore) =>
  state.items.length > 0 && state.total > 0 && !state.isProcessing
export const selectTransactionLocked = (state: POSStore) => state.transactionLock !== null

/**
 * Hook to get cart summary
 */
export const useCartSummary = () => {
  const items = usePOSStore((state) => state.items)
  const subtotal = usePOSStore((state) => state.subtotal)
  const tax = usePOSStore((state) => state.tax)
  const discount = usePOSStore((state) => state.discount)
  const total = usePOSStore((state) => state.total)
  const itemCount = usePOSStore((state) => state.getTotalItems())
  const lastError = usePOSStore((state) => state.lastError)

  return {
    items,
    subtotal,
    tax,
    discount,
    total,
    itemCount,
    hasItems: items.length > 0,
    lastError,
  }
}

/**
 * Hook to get payment state
 */
export const usePaymentState = () => {
  const paymentMethod = usePOSStore((state) => state.paymentMethod)
  const paidAmount = usePOSStore((state) => state.paidAmount)
  const change = usePOSStore((state) => state.change)
  const total = usePOSStore((state) => state.total)
  const isProcessing = usePOSStore((state) => state.isProcessing)
  const canProcess = usePOSStore((state) => state.canProcessPayment())

  return {
    paymentMethod,
    paidAmount,
    change,
    total,
    remainingAmount: Math.max(0, total - paidAmount),
    isProcessing,
    canProcess,
    isLocked: usePOSStore((state) => state.transactionLock !== null),
  }
}

/**
 * Hook to get transaction lock state
 */
export const useTransactionLock = () => {
  const transactionLock = usePOSStore((state) => state.transactionLock)
  const isProcessing = usePOSStore((state) => state.isProcessing)

  return {
    isLocked: transactionLock !== null,
    lockId: transactionLock?.id || null,
    isProcessing,
    canModify: !isProcessing && transactionLock === null,
  }
}

/**
 * Hook to get cart validation state
 */
export const useCartValidation = () => {
  const validateCart = usePOSStore((state) => state.validateCart)
  const validateStock = usePOSStore((state) => state.validateStock)
  const canProcessPayment = usePOSStore((state) => state.canProcessPayment)
  const clearError = usePOSStore((state) => state.clearError)
  const lastError = usePOSStore((state) => state.lastError)

  return {
    validateCart,
    validateStock,
    canProcessPayment,
    lastError,
    clearError,
  }
}
