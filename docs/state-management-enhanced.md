# Enhanced State Management Documentation

## Production-Level Safeguards

This document describes the production-ready enhancements made to the Zustand stores for real-world POS usage.

## Overview

The enhanced state management includes:

✅ **Token expiry handling** with auto-logout
✅ **Transaction locks** to prevent duplicate submissions
✅ **User-specific cart isolation**
✅ **Comprehensive error handling** with Indonesian messages
✅ **Stock validation** with conflict resolution
✅ **Performance monitoring** and debugging tools
✅ **Recovery mechanisms** for cart snapshots

## New Features

### 1. Auth Store Enhancements

#### Token Expiry Management

```typescript
import { useAuthStatus } from '@/store'

function AuthStatus() {
  const { isAuthenticated, isExpired, timeUntilExpiry, willExpireSoon } = useAuthStatus()

  if (willExpireSoon) {
    return <WarningBanner message="Sesi Anda akan berakhir dalam {timeUntilExpiry} detik" />
  }

  if (isExpired) {
    return <LoginForm />
  }

  return <Dashboard />
}
```

**Features:**
- JWT token parsing for expiry detection
- Auto-logout when token expires
- Auto-refresh 5 minutes before expiry
- Activity timeout (default 30 minutes)
- Secure token usage with httpOnly cookies (recommended)

#### Token Data Structure

```typescript
interface TokenData {
  token: string
  expiresAt: string
  refreshToken?: string
}
```

### 2. POS Store Enhancements

#### Transaction Lock System

Prevents duplicate transaction submissions:

```typescript
import { useTransactionLock, processTransaction } from '@/store'

function PaymentButton() {
  const { isLocked, isProcessing, canModify } = useTransactionLock()

  const handlePayment = async () => {
    const result = await processTransaction(async () => {
      return await posService.createTransaction({
        items: cartItems,
        paymentMethod: 'cash',
        amountPaid: paidAmount,
      })
    })

    if (result.success) {
      // Transaction completed
      showReceipt(result.transactionId)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLocked || isProcessing || !canModify}
    >
      {isProcessing ? 'Memproses...' : 'Bayar'}
    </Button>
  )
}
```

**Features:**
- Automatic lock acquisition when processing starts
- Lock auto-releases after transaction completes
- Stale lock detection (5-minute timeout)
- Prevents cart modifications during processing

#### Cart Validation

Enhanced validation with Indonesian error messages:

```typescript
import { useCartValidation } from '@/store'

function CheckoutFlow() {
  const { validateCart, validateStock, canProcessPayment, lastError } = useCartValidation()

  const handleCheckout = () => {
    // Validate cart
    const cartValidation = validateCart()
    if (!cartValidation.valid) {
      cartValidation.errors.forEach(error => {
        showError(error)
      })
      return
    }

    // Validate stock against current inventory
    const stockValidation = validateStock(currentStock)
    if (!stockValidation.valid) {
      stockValidation.errors.forEach(error => {
        showError(error.message)
      })
      return
    }

    // Process payment
    processPayment()
  }

  return <Button onClick={handleCheckout}>Checkout</Button>
}
```

#### User-Specific Cart Isolation

Cart is automatically reset when user changes:

```typescript
// Automatic on user change
useAuthStore.subscribe(
  (state) => state.user?.id,
  (prevUserId, currUserId) => {
    if (prevUserId && prevUserId !== currUserId) {
      usePOSStore.getState().resetCartForUser(prevUserId)
    }
  }
)
```

#### Error Handling

User-friendly Indonesian error messages:

```typescript
import { getErrorMessage, getToastConfigFromError } from '@/store'

try {
  await processTransaction()
} catch (error) {
  const toast = getToastConfigFromError(error)
  toast(toast.title, {
    description: toast.description,
    variant: toast.variant,
  })
}
```

**Error Types:**
- `VALIDATION` - Cart validation errors
- `NETWORK` - Connection issues
- `PERMISSION` - Auth/authorization issues
- `CONFLICT` - Duplicate transactions, stock conflicts
- `NOT_FOUND` - Product/customer not found
- `TIMEOUT` - Request timeout

### 3. Store Integration

#### Initialize Integrations

Call once when app initializes:

```typescript
// app/layout.tsx
import { initializeStoreIntegrations } from '@/store'

export default function RootLayout({ children }) {
  useEffect(() => {
    initializeStoreIntegrations()
  }, [])

  return <div>{children}</div>
}
```

**Integrations include:**
- Auto-reset cart on logout
- Auto-reset cart on user change
- Auto-show notifications for errors
- Auto-release stale transaction locks

#### Transaction Processing

Use the `processTransaction` helper for safe transaction handling:

```typescript
import { processTransaction } from '@/store'

const result = await processTransaction(async () => {
  // Your transaction logic here
  const response = await api.createTransaction(transactionData)
  return response
})

// Result includes:
// { success: boolean, transactionId?: string, error?: string }
```

**Safeguards built-in:**
- Authentication check
- Cart validation
- Transaction lock acquisition
- Automatic state management
- Error handling and notifications

## Store Utilities

### Error Handler

```typescript
import {
  createValidationError,
  createNetworkError,
  getErrorMessage,
  logError,
} from '@/store'

// Create specific errors
const error = createValidationError('stock_insufficient', 'Stok tidak mencukupi')

// Get user-friendly message
const message = getErrorMessage(error) // "Stok tidak mencukupi"

// Log error for debugging
logError(error, 'Checkout')
```

### Middleware

```typescript
import {
  logger,
  performanceMonitor,
  actionTracker,
  devtools,
} from '@/store'

// Apply middleware to custom store
const useMyStore = create(
  devtools(
    performanceMonitor(
      logger(
        (set, get) => ({
          // store state
        })
      ),
      'MyStore' // name for devtools
    )
  )
)
```

### Integration Utilities

```typescript
import {
  handleLogout,
  handleTokenExpiry,
  recoverCart,
  createCartBackup,
  getStoreHealth,
  debugStores,
} from '@/store'

// Logout with cleanup
handleLogout()

// Handle token expiry
handleTokenExpiry()

// Backup current cart
const backup = createCartBackup()

// Recover from backup
recoverCart(backup)

// Debug all stores
debugStores()

// Get store health status
const health = getStoreHealth()
console.log(health.auth.isExpired) // Check token expiry
console.log(health.pos.hasItems) // Check if cart has items
```

## Best Practices

### 1. Transaction Flow

```typescript
// ✅ Good - Use processTransaction helper
const result = await processTransaction(async () => {
  return await api.createTransaction(data)
})

// ❌ Bad - Manual processing without safeguards
try {
  const result = await api.createTransaction(data)
  // No lock, no validation, no error handling
} catch (error) {
  console.error(error)
}
```

### 2. Error Handling

```typescript
// ✅ Good - Use error handler utilities
import { handleApiError, getToastConfigFromError } from '@/store'

try {
  await api.createTransaction(data)
} catch (error) {
  const storeError = handleApiError(error)
  const toast = getToastConfigFromError(storeError)
  showErrorToast(toast)
}

// ❌ Bad - Manual error handling
try {
  await api.createTransaction(data)
} catch (error) {
  if (error.response?.status === 401) {
    // Hardcoded checks
  }
}
```

### 3. Cart Validation

```typescript
// ✅ Good - Use validation hook
import { useCartValidation } from '@/store'

const { validateCart, validateStock } = useCartValidation()

// ❌ Bad - Manual validation
if (cart.items.length === 0) {
  // Manual check
}
```

## Error Messages (Indonesian)

| Code | Message |
|------|---------|
| `cart_empty` | Keranjang belanja kosong |
| `invalid_total` | Total pembayaran tidak valid |
| `insufficient_payment` | Jumlah pembayaran kurang |
| `transaction_locked` | Transaksi sedang diproses. Mohon tunggu sebentar. |
| `stock_insufficient` | Stok tidak mencukupi |
| `session_expired` | Sesi Anda telah berakhir. Silakan login kembali. |
| `connection_failed` | Koneksi ke server gagal |
| `duplicate_transaction` | Transaksi duplikat terdeteksi |

## Testing

### Test Transaction Lock

```typescript
import { useTransactionLock } from '@/store'

test('prevents duplicate transactions', async () => {
  const { result: lock1 } = renderHook(() => useTransactionLock())
  
  // First lock should succeed
  act(() => {
    const lock = usePOSStore.getState().acquireTransactionLock()
    expect(lock).not.toBeNull()
  })

  // Second lock should fail
  act(() => {
    const lock = usePOSStore.getState().acquireTransactionLock()
    expect(lock).toBeNull()
  })

  // After release, new lock should succeed
  act(() => {
    usePOSStore.getState().releaseTransactionLock()
    const lock = usePOSStore.getState().acquireTransactionLock()
    expect(lock).not.toBeNull()
  })
})
```

### Test Token Expiry

```typescript
import { useAuthStore } from '@/store'

test('auto-logs out on token expiry', () => {
  const { result } = renderHook(() => useAuthStore())

  act(() => {
    result.current.setToken('expired-token', 0) // Already expired
  })

  // Check token expiry
  act(() => {
    const isExpired = result.current.isTokenExpired()
    expect(isExpired).toBe(true)
  })

  // Should auto-logout
  act(() => {
    result.current.checkTokenExpiry()
  })

  expect(result.current.isAuthenticated).toBe(false)
})
```

## Troubleshooting

### Transaction stuck in processing

```typescript
// Check transaction lock
const lock = usePOSStore.getState().transactionLock
if (lock) {
  const lockAge = Date.now() - new Date(lock.timestamp).getTime()
  if (lockAge > 5 * 60 * 1000) {
    // Lock is stale, release it
    usePOSStore.getState().releaseTransactionLock()
  }
}

// Reset processing state
usePOSStore.getState().setProcessing(false)
```

### Token expired errors

```typescript
// Check token status
const isExpired = useAuthStore.getState().isTokenExpired()
if (isExpired) {
  // Token has expired, user needs to login again
  handleTokenExpiry()
}
```

### Cart not resetting

```typescript
// Force reset cart
usePOSStore.getState().resetCart()

// Clear transaction lock
usePOSStore.getState().releaseTransactionLock()

// Clear processing state
usePOSStore.getState().setProcessing(false)
```

## Migration from Old Stores

If you have existing code using the old stores:

```typescript
// Before
const { addItem, items, total } = usePOSStore()

// After (still works, but now includes safeguards)
const { addItem, items, total } = usePOSStore()

// New: Use custom hooks for better performance
const { items, total, itemCount } = useCartSummary()
const { isProcessing, canProcess } = usePaymentState()
const { isLocked } = useTransactionLock()
```

## Performance Considerations

1. **Use Selectors**: Always use selectors to prevent unnecessary re-renders
2. **Custom Hooks**: Use provided custom hooks for optimized reads
3. **Debounce Listeners**: Use `createDebouncedListener` for expensive operations
4. **Monitor Performance**: Use `performanceMonitor` middleware in development

## Security Considerations

1. **Token Storage**: Consider using httpOnly cookies for token storage
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Refresh**: Implement secure token refresh mechanism
4. **Cart Isolation**: Ensure carts are properly isolated per user
5. **Transaction Locks**: Prevent duplicate submissions with locks

For more information, see the main [State Management Documentation](./state-management.md).
