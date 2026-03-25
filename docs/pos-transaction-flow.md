# POS Transaction Flow - Complete Documentation

## Overview

This document describes the complete POS transaction flow implemented with production-level reliability, including all safeguards, validations, and error handling.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                     │
│  (Product Grid → Cart → Payment Modal → Receipt)     │
└──────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   POS Hooks & Utilities                │
│  - usePOSCart     - usePOSCheckout                  │
│  - usePOSPayment  - validateCheckout                   │
│  - processTransaction                                 │
└──────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Zustand POS Store                    │
│  - Cart state    - Transaction lock                  │
│  - Processing    - Validation                      │
└──────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    API Service Layer                    │
│  - POST /transactions                                  │
│  - GET /products                                      │
└─────────────────────────────────────────────────────────┘
```

## Transaction Flow

### 1. Add Products to Cart

```typescript
// Using hook
import { usePOSProductActions } from '@/lib/pos'

function ProductCard({ product }) {
  const { addProduct, isInCart } = usePOSProductActions()

  return (
    <button onClick={() => addProduct(product)}>
      Add to Cart
      {isInCart(product.id) && '✓'}
    </button>
  )
}
```

**Features:**
- ✅ Add product to cart
- ✅ Auto-merge quantities for same product
- ✅ Prevent adding out-of-stock items
- ✅ Show in-cart indicator
- ✅ Support for all 4 modules (SPBU, Gas, OLI, SnB)

### 2. View & Manage Cart

```typescript
import { useCartSummary, usePOSCart } from '@/lib/pos'

function CartDisplay() {
  const { items, total, itemCount } = useCartSummary()
  const { updateQuantity, removeProduct, clearCart } = usePOSCart()

  return (
    <div>
      <p>Items: {itemCount}</p>
      <p>Total: Rp {total.toLocaleString('id-ID')}</p>

      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onQtyChange={(qty) => updateQuantity(item.id, qty)}
          onRemove={() => removeProduct(item.id)}
        />
      ))}

      <button onClick={clearCart}>Clear Cart</button>
    </div>
  )
}
```

**Features:**
- ✅ Real-time cart updates
- ✅ Quantity modification
- ✅ Remove individual items
- ✅ Clear entire cart
- ✅ Shows subtotal, tax, discount, total

### 3. Checkout & Payment

```typescript
import { usePOSCheckout, usePOSPayment } from '@/lib/pos'

function PaymentFlow() {
  const {
    startTransaction,
    isProcessing,
    isSuccess,
    error,
    canCheckout,
  } = usePOSCheckout()

  const {
    paymentMethod,
    paidAmount,
    change,
    selectPaymentMethod,
    updatePaidAmount,
  } = usePOSPayment()

  return (
    <>
      <PaymentModal
        open={showPayment}
        onComplete={(result) => {
          if (result.success) {
            showReceipt(result.transactionId)
          }
        }}
      />
    </>
  )
}
```

**Features:**
- ✅ Pre-transaction validation
- ✅ Transaction lock (prevents duplicates)
- ✅ Multiple payment methods:
  - **Cash** - with quick amount buttons
  - **QRIS** - QR code display
  - **Transfer** - bank account details
  - **Voucher** - code redemption
- ✅ Auto-calculate change
- ✅ Stock validation
- ✅ Processing state management

### 4. Transaction Processing

```typescript
import { processTransaction } from '@/lib/pos'

// Automatic processing through usePOSCheckout hook
const result = await processTransaction()

// Result:
// {
//   success: boolean
//   transactionId: string
//   error?: string
//   code?: string
// }
```

**Safeguards:**
- ✅ Authentication check
- ✅ Cart validation
- ✅ Stock validation
- ✅ Transaction lock acquisition
- ✅ API error handling
- ✅ Auto-release lock on complete
- ✅ Cart reset after success
- ✅ Receipt storage

### 5. Receipt & Completion

```typescript
import { usePOSTransactionReceipt } from '@/lib/pos'

function ReceiptModal({ transactionId }) {
  const { receipt, isLoading } = usePOSTransactionReceipt(transactionId)

  return (
    <ReceiptDisplay
      receipt={receipt}
      onPrint={() => window.print()}
      onDownload={() => downloadReceipt(receipt)}
    />
  )
}
```

**Features:**
- ✅ Professional receipt layout
- ✅ Print functionality
- � Download as text file
- ✅ Share functionality
- ✅ Auto-clear cart after display

## State Management

### Cart State (Zustand)

```typescript
// Access directly
import { usePOSStore } from '@/store'

const {
  items,
  subtotal,
  tax,
  discount,
  total,
  paymentMethod,
  paidAmount,
  change,
  isProcessing,
  transactionLock,
} = usePOSStore()

// Actions
addItem({ name, price, quantity, module })
removeItem(id)
updateQty(id, quantity)
setPaymentMethod('cash')
resetCart()
```

### Transaction Lock

```typescript
// Lock prevents duplicate transactions
const lock = usePOSStore.getState().acquireTransactionLock()

if (lock) {
  // Transaction in progress
  console.log('Transaction ID:', lock.id)
  console.log('Timestamp:', lock.timestamp)
  console.log('User:', lock.userId)
  console.log('Total:', lock.total)
}

// Lock auto-releases after 5 minutes if stale
// Always release after transaction completes:
usePOSStore.getState().releaseTransactionLock()
```

### Validation

```typescript
import { validateCheckout, getValidationMessage } from '@/lib/pos'

// Complete checkout validation
const validation = validateCheckout({
  items: cartItems,
  total: cartTotal,
  paymentMethod: selectedMethod,
  paidAmount: amountPaid,
})

if (!validation.valid) {
  validation.errors.forEach(error => showError(error))
}

// Prebuilt messages
getValidationMessage('cart_empty') // "Keranjang belanja masih kosong..."
getValidationMessage('stock_insufficient') // "Stok tidak mencukupup..."
getValidationMessage('payment_required') // "Silakan pilih metode pembayaran..."
```

## Payment Methods

### 1. Cash Payment

```typescript
selectPaymentMethod('cash')

// Quick amount buttons
handleQuickAmount(10000)  // Adds Rp 10.000
handleQuickAmount(20000)  // Adds Rp 20.000
handleQuickAmount(50000)  // Adds Rp 50.000
handleQuickAmount(100000) // Adds Rp 100.000

// Auto-rounds to nearest thousand
```

**Features:**
- Quick amount buttons
- Change calculation
- Minimum payment validation
- Amount input

### 2. QRIS Payment

```typescript
selectPaymentMethod('qris')

// Shows QR code for scanning
// Amount auto-sets to total
```

### 3. Transfer Payment

```typescript
selectPaymentMethod('transfer')

// Shows bank account details
// User must manually transfer
```

### 4. Voucher Payment

```typescript
selectPaymentMethod('voucher')

// Enter voucher code
// Auto-applies discount if valid
```

## Error Handling

### Validation Errors

```typescript
// Cart validation
{
  valid: false,
  errors: [
    'Keranjang belanja kosong',
    'Stok tidak mencukupup: Pertalite (tersedia: 5, diminta: 10)',
  ]
}
```

### API Errors

```typescript
// Network error
{
  success: false,
  error: 'Koneksi ke server gagal',
  code: 'NETWORK_ERROR',
}

// Validation error from API
{
  success: false,
  error: 'Stok Pertalite tidak mencukupup',
  code: 'STOCK_VALIDATION_FAILED',
}
```

### User Actions

```typescript
// Retry transaction
if (error.code === 'NETWORK_ERROR') {
  // Cart data preserved
  // User can retry payment
  showRetryDialog()
}

// Clear cart on fatal error
if (error.code === 'STOCK_VALIDATION_FAILED') {
  showError('Stok berubah. Silakan periksa kembali keranjang Anda.')
  // Remove problematic items or update quantities
}
```

## Edge Cases Handled

### 1. Slow Network

```typescript
// Transaction lock prevents duplicate submissions
// Loading states prevent multiple clicks
// Cart data preserved if request fails
```

### 2. Double Click Prevention

```typescript
// isProcessing flag prevents multiple submissions
const { isProcessing } = usePOSCheckout()

<Button disabled={isProcessing}>
  {isProcessing ? 'Memproses...' : 'Bayar'}
</Button>
```

### 3. Stock Changes During Checkout

```typescript
// Stock validated before transaction
// If stock changes, transaction fails
// User informed of updated stock
// Cart preserved for retry
```

### 4. Page Refresh During Transaction

```typescript
// Transaction lock persists
// Cart persists via Zustand
// User can continue after refresh
// Lock auto-expires after 5 minutes
```

### 5. Partial Stock Availability

```typescript
// Validates stock before adding to cart
// Shows warning for low stock items
// Prevents over-ordering
// Alerts when stock reaches minimum
```

## Usage Examples

### Complete Transaction Flow

```typescript
'use client'

import { useAuth } from '@/lib/auth'
import { usePOSCart, usePOSCheckout, usePOSPayment } from '@/lib/pos'

export default function POSPage() {
  const { user } = useAuth()
  const { addToCart, items } = usePOSCart()
  const { startTransaction, canCheckout, isProcessing } = usePOSCheckout()
  const { paymentMethod, paidAmount } = usePOSPayment()

  return (
    <div>
      {/* Product Grid */}
      <ProductGrid />

      {/* Cart */}
      <CartSidebar />

      {/* Payment */}
      <PaymentModal
        open={showPayment}
        onComplete={(result) => {
          if (result.success) {
            showReceipt(result.transactionId)
          }
        }}
      />
    </div>
  )
}
```

### Quick Add to Cart

```typescript
import { usePOSProductActions } from '@/lib/pos'

function QuickAddButton({ product }) {
  const { addProduct, getProductQuantity } = usePOSProductActions()

  return (
    <button onClick={() => addProduct(product)}>
      Add to Cart
      <span className="ml-2">
        ({getProductQuantity(product.id)})
      </span>
    </button>
  )
}
```

### Custom Validation

```typescript
import { validateCheckout, getValidationMessage } from '@/lib/pos'

function CustomCheckoutButton() {
  const { items, total, paymentMethod, paidAmount } = useCartSummary()

  const handleCheckout = () => {
    const validation = validateCheckout({
      items,
      total,
      paymentMethod,
      paidAmount,
    })

    if (!validation.valid) {
      toast.error(getValidationMessage('cart_empty'))
      return
    }

    // Show payment modal
    setShowPayment(true)
  }

  return <Button onClick={handleCheckout}>Checkout</Button>
}
```

## Transaction States

| State | Description | Button State |
|-------|-------------|-------------|
| `IDLE` | Ready to process | Checkout enabled |
| `VALIDATING` | Validating inputs | Checkout disabled |
| `PROCESSING` | Calling API | All buttons disabled |
| `SUCCESS` | Transaction complete | Show receipt |
| `FAILED` | Error occurred | Show error, allow retry |

## API Integration

### Request Format

```typescript
POST /api/transactions
{
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    module: 'spbu' | 'gas' | 'oli' | 'snb'
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'qris' | 'transfer' | 'voucher'
  paidAmount: number
  change: number
  cashierId: string
  cashierName: string
  customerId?: string
  notes?: string
  discountCode?: string
}
```

### Response Format

```typescript
{
  status: 'success' | 'failed'
  transaction?: {
    id: string
    date: string
    items: [...]
    subtotal: number
    tax: number
    discount: number
    total: number
    paymentMethod: string
    paidAmount: number
    change: number
    cashier: string
  }
  error?: string
}
```

## Performance Optimizations

1. **Transaction Lock** - Prevents duplicate API calls
2. **Debounced Validation** - Validates only when cart changes
3. **Memoized Selectors** - Prevents unnecessary re-renders
4. **Optimistic Updates** - Immediate UI feedback
5. **State Persistence** - Cart survives page refresh

## Security Features

1. **Authentication Required** - All transactions require auth
2. **User Association** - Transactions linked to cashier
3. **Audit Trail** - All transactions logged
4. **Tamper Evidence** - Receipts stored as proof
5. **Secure Calculations** - Server-side validation
6. **Token Management** - Secure JWT handling

## Testing

### Test Transaction Flow

```typescript
test('complete transaction flow', async () => {
  const { addToCart } = usePOSProductActions()
  const { startTransaction } = usePOSCheckout()

  // Add products
  addToCart({ id: '1', name: 'Pertalite', price: 10000, module: 'spbu' })

  // Process transaction
  const result = await startTransaction()

  expect(result.success).toBe(true)
  expect(result.transactionId).toBeDefined()

  // Cart should be cleared after delay
  await waitFor(() => {
    const { items } = useCartSummary()
    expect(items).toHaveLength(0)
  })
})
```

## Troubleshooting

### Transaction Lock Stuck

```typescript
// Manually release lock if stuck
const { releaseTransactionLock, setProcessing } = usePOSStore.getState()
releaseTransactionLock()
setProcessing(false)
```

### Cart Not Resetting

```typescript
// Manual cart reset
const { resetCart } = usePOSStore.getState()
resetCart()
```

### Missing Receipt

```typescript
// Clear stuck transaction from sessionStorage
sessionStorage.removeItem('lastTransaction')

// Or fetch fresh receipt
const { fetchReceipt } = usePOSTransactionReceipt(transactionId)
await fetchReceipt(transactionId)
```

## Best Practices

1. **Always validate cart before checkout**
2. **Check canCheckout flag before enabling payment**
3. **Handle all error states gracefully**
4. **Preserve cart data on API errors**
5. **Show loading states during processing**
6. **Test all payment methods**
7. **Verify receipt generation**
8. **Test transaction lock functionality**
9. **Simulate network failures**
10. **Test edge cases (empty cart, insufficient stock, etc.)**
