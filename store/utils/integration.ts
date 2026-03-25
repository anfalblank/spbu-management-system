/**
 * Store Integration Utilities
 * Handles cross-store communication and integration
 */

import { useAuthStore } from '../useAuthStore'
import { usePOSStore } from '../usePOSStore'
import { useUIStore } from '../useUIStore'

/**
 * Initialize store integrations
 * Call this once when the app initializes
 */
export function initializeStoreIntegrations() {
  // Set up auth store listener to reset cart on logout/user change
  useAuthStore.subscribe(
    (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    ({ user: prevUser }, { user: currUser }) => {
      const prevUserId = prevUser?.id
      const currUserId = currUser?.id

      // User logged out
      if (prevUserId && !currUserId) {
        // Reset cart
        usePOSStore.getState().resetCart()
        usePOSStore.getState().setUserId(null)
        
        // Show notification
        useUIStore.getState().addNotification({
          title: 'Logout Berhasil',
          message: 'Keranjang belanja telah direset',
          type: 'info',
        })
      }

      // User changed
      if (prevUserId && currUserId && prevUserId !== currUserId) {
        // Reset cart for new user
        usePOSStore.getState().resetCartForUser(prevUserId)
        usePOSStore.getState().setUserId(currUserId)
      }

      // User logged in
      if (!prevUserId && currUserId) {
        usePOSStore.getState().setUserId(currUserId)
        
        // Load user's saved cart (if implemented)
        // loadUserCart(currUserId)
      }
    },
    {
      equalityFn: (a, b) => a.user?.id === b.user?.id && a.isAuthenticated === b.isAuthenticated,
    }
  )

  // Set up POS store listener for notifications
  usePOSStore.subscribe(
    (state) => state.lastError,
    (error, prevError) => {
      if (error && error !== prevError) {
        useUIStore.getState().addNotification({
          title: 'Error',
          message: error,
          type: 'error',
        })
      }
    }
  )

  // Set up transaction lock monitoring
  setInterval(() => {
    const state = usePOSStore.getState()
    
    if (state.transactionLock) {
      const lockAge = Date.now() - new Date(state.transactionLock.timestamp).getTime()
      
      // Auto-release stale locks (older than 5 minutes)
      if (lockAge > 5 * 60 * 1000) {
        usePOSStore.getState().releaseTransactionLock()
        useUIStore.getState().addNotification({
          title: 'Transaksi Timeout',
          message: 'Lock transaksi telah dilepas karena timeout',
          type: 'warning',
        })
      }
    }
  }, 60000) // Check every minute
}

/**
 * Handle logout sequence
 */
export function handleLogout() {
  // Save current cart snapshot before logout (optional)
  const snapshot = usePOSStore.getState().createSnapshot()
  
  // Logout from auth store
  useAuthStore.getState().logout()
  
  // POS cart will be reset automatically by the integration
  // But you could save the snapshot for later restoration
}

/**
 * Handle token expiry
 */
export function handleTokenExpiry() {
  useUIStore.getState().addNotification({
    title: 'Sesi Berakhir',
    message: 'Sesi Anda telah berakhir. Silakan login kembali.',
    type: 'warning',
  })

  // Force logout
  useAuthStore.getState().logout(true)
}

/**
 * Process transaction with safeguards
 */
export async function processTransaction(
  transactionFn: () => Promise<{ success: boolean; transactionId?: string; error?: string }>
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const posStore = usePOSStore.getState()
  const authStore = useAuthStore.getState()

  // Check authentication
  if (!authStore.isAuthenticated) {
    return {
      success: false,
      error: 'Anda belum login. Silakan login terlebih dahulu.',
    }
  }

  // Validate cart
  const validation = posStore.validateCart()
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors[0] || 'Validasi gagal',
    }
  }

  // Acquire transaction lock
  const lock = posStore.acquireTransactionLock()
  if (!lock) {
    return {
      success: false,
      error: 'Transaksi sedang diproses. Mohon tunggu sebentar.',
    }
  }

  try {
    // Set processing state
    posStore.setProcessing(true)
    posStore.setStatus('processing')

    // Execute transaction
    const result = await transactionFn()

    if (result.success && result.transactionId) {
      // Transaction successful
      posStore.setStatus('completed')
      posStore.setLastTransactionId(result.transactionId)

      // Show success notification
      useUIStore.getState().addNotification({
        title: 'Transaksi Berhasil',
        message: 'Transaksi telah selesai diproses',
        type: 'success',
      })

      // Reset cart after delay (to show receipt)
      setTimeout(() => {
        posStore.resetCart()
      }, 3000)
    } else {
      // Transaction failed
      posStore.setStatus('failed')
      posStore.setLastError(result.error || 'Transaksi gagal')

      useUIStore.getState().addNotification({
        title: 'Transaksi Gagal',
        message: result.error || 'Terjadi kesalahan saat memproses transaksi',
        type: 'error',
      })
    }

    return result
  } catch (error) {
    // Transaction error
    posStore.setStatus('failed')
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui'
    posStore.setLastError(errorMessage)

    useUIStore.getState().addNotification({
      title: 'Transaksi Error',
      message: errorMessage,
      type: 'error',
    })

    return {
      success: false,
      error: errorMessage,
    }
  } finally {
    // Always release lock and reset processing state
    posStore.setProcessing(false)
    posStore.releaseTransactionLock()
  }
}

/**
 * Recovery utilities
 */

/**
 * Recover cart from snapshot
 */
export function recoverCart(snapshot: string): boolean {
  return usePOSStore.getState().restoreSnapshot(snapshot)
}

/**
 * Create emergency backup of current cart
 */
export function createCartBackup(): string {
  return usePOSStore.getState().createSnapshot()
}

/**
 * Get store health status
 */
export function getStoreHealth() {
  const authState = useAuthStore.getState()
  const posState = usePOSStore.getState()
  const uiState = useUIStore.getState()

  return {
    auth: {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token,
      tokenExpiry: authState.tokenData?.expiresAt || null,
      isExpired: authState.isTokenExpired(),
    },
    pos: {
      hasItems: posState.items.length > 0,
      isProcessing: posState.isProcessing,
      hasLock: posState.transactionLock !== null,
      cartTotal: posState.total,
    },
    ui: {
      theme: uiState.theme,
      sidebarOpen: uiState.sidebar.isOpen,
      notificationCount: uiState.notifications.filter(n => !n.read).length,
    },
  }
}

/**
 * Debug utility to log all store states
 */
export function debugStores() {
  if (process.env.NODE_ENV !== 'production') {
    console.group('🔍 Store States')
    console.log('Auth Store:', useAuthStore.getState())
    console.log('POS Store:', usePOSStore.getState())
    console.log('UI Store:', useUIStore.getState())
    console.log('Dashboard Store:', useDashboardStore?.getState())
    console.log('Stock Store:', useStockStore?.getState())
    console.groupEnd()
  }
}

// Import dashboard and stock stores conditionally to avoid circular dependencies
let useDashboardStore: any = null
let useStockStore: any = null

try {
  const dashboardModule = require('../useDashboardStore')
  useDashboardStore = dashboardModule.useDashboardStore
} catch {
  // Module not available
}

try {
  const stockModule = require('../useStockStore')
  useStockStore = stockModule.useStockStore
} catch {
  // Module not available
}

/**
 * Clear all store data (useful for testing/debugging)
 */
export function clearAllStores() {
  if (process.env.NODE_ENV !== 'production') {
    useAuthStore.getState().logout()
    usePOSStore.getState().resetCart()
    useUIStore.getState().resetUI()
    useDashboardStore?.getState().resetDashboard()
    useStockStore?.getState().clearAlerts()

    // Clear all localStorage
    localStorage.clear()

    console.warn('🧹 All stores cleared')
  }
}
