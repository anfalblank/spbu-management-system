# State Management Documentation

This document describes the Zustand state management implementation for the SPBU Management System.

## Overview

The application uses **Zustand** for global state management with the following principles:

1. **Separation of Concerns**: Each store handles a specific domain
2. **Persistence**: Critical state (auth, cart, UI preferences) is persisted to localStorage
3. **No API Duplication**: Stores only manage UI/interaction state, not API data
4. **Performance Optimized**: Uses selectors to prevent unnecessary re-renders
5. **Type Safe**: Full TypeScript support for all stores

## Store Architecture

```
┌─────────────────────────────────────┐
│         Components                   │
└──────────────┬──────────────────────┘
               │ use selectors
               ▼
┌─────────────────────────────────────┐
│        Zustand Stores                │
│  ┌───────────────────────────────┐  │
│  │ useAuthStore                  │  │
│  │ - user, token, isAuthenticated│  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ usePOSStore (CRITICAL)        │  │
│  │ - cart items, totals, payment │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ useUIStore                    │  │
│  │ - sidebar, modals, theme      │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ useDashboardStore             │  │
│  │ - filters, tabs, preferences  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ useStockStore                 │  │
│  │ - alerts, warehouses          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
               │ API calls (via hooks)
               ▼
┌─────────────────────────────────────┐
│      React Query Hooks              │
│  (useKPIs, useProducts, etc.)       │
└─────────────────────────────────────┘
```

## Available Stores

### 1. useAuthStore

Manages user authentication and authorization.

**State:**
- `user: User | null` - Current user data
- `token: string | null` - JWT token
- `isAuthenticated: boolean` - Auth status
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message

**Actions:**
- `login(email, password)` - Authenticate user
- `logout()` - Clear session
- `setUser(user)` - Set user data
- `setToken(token)` - Set auth token
- `updateUser(updates)` - Update user data
- `hasPermission(permission)` - Check permission
- `hasRole(roles)` - Check role

**Example:**
```typescript
'use client'

import { useAuthStore } from '@/store'

export default function LoginPage() {
  const { login, isLoading, error } = useAuthStore()

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      console.error('Login failed:', error)
    }
  }

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
}
```

### 2. usePOSStore (CRITICAL)

Manages POS cart state with **persistence**. Cart survives page reload and navigation.

**State:**
- `items: CartItem[]` - Cart items
- `subtotal: number` - Subtotal before tax/discount
- `tax: number` - Tax amount
- `taxRate: number` - Tax rate (default 11%)
- `discount: number` - Discount amount
- `total: number` - Final total
- `paymentMethod: PaymentMethod | null` - Selected payment method
- `paidAmount: number` - Amount paid
- `change: number` - Change to return
- `status: PaymentStatus` - Transaction status
- `isProcessing: boolean` - Processing state

**Actions:**
- `addItem(item)` - Add item to cart
- `removeItem(id)` - Remove item from cart
- `updateQty(id, quantity)` - Update item quantity
- `setPaymentMethod(method)` - Set payment method
- `setPaidAmount(amount)` - Set paid amount
- `calculateTotals()` - Recalculate totals
- `resetCart()` - Clear cart
- `validateCart()` - Validate cart state

**Example:**
```typescript
'use client'

import { usePOSStore, useCartSummary } from '@/store'

export default function POSPage() {
  const { addItem, resetCart } = usePOSStore()
  const { items, total, itemCount } = useCartSummary()

  const handleAddProduct = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      module: product.module,
      stock: product.stock,
    })
  }

  const handleReset = () => {
    if (confirm('Clear cart?')) {
      resetCart()
    }
  }

  return (
    <div>
      <CartItems items={items} />
      <CartTotal total={total} itemCount={itemCount} />
      <button onClick={handleReset}>Clear Cart</button>
    </div>
  )
}
```

**Custom Hooks:**
- `useCartSummary()` - Get cart summary
- `usePaymentState()` - Get payment state

### 3. useUIStore

Manages global UI state.

**State:**
- `sidebar: SidebarState` - Sidebar state
- `theme: Theme` - Current theme
- `activeModal: ModalType | null` - Active modal
- `notifications: Notification[]` - Notifications
- `searchQuery: string` - Search query

**Actions:**
- `toggleSidebar()` - Toggle sidebar
- `setTheme(theme)` - Set theme
- `openModal(type, data)` - Open modal
- `closeModal()` - Close modal
- `addNotification(notification)` - Add notification

**Example:**
```typescript
'use client'

import { useSidebar, useModal, useTheme } from '@/store'

export default function Layout() {
  const { isOpen, toggleSidebar } = useSidebar()
  const { openModal, closeModal } = useModal()
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={toggleTheme}>Toggle Theme ({theme})</button>
      <button onClick={() => openModal('payment')}>Open Payment Modal</button>
    </div>
  )
}
```

**Custom Hooks:**
- `useSidebar()` - Sidebar state and actions
- `useModal()` - Modal state and actions
- `useNotifications()` - Notifications state
- `useTheme()` - Theme state

### 4. useDashboardStore

Manages dashboard UI state (filters, preferences).

**State:**
- `filters: DashboardFilters` - Dashboard filters
- `selectedKpiPeriod: string` - KPI period
- `activeTab: string` - Active tab
- `showPredictions: boolean` - Show AI predictions
- `chartTimeRange: string` - Chart time range
- `pinnedWidgets: string[]` - Pinned widgets

**Actions:**
- `setPeriod(period)` - Set time period
- `setModule(module)` - Set module filter
- `setActiveTab(tab)` - Set active tab
- `togglePredictions()` - Toggle predictions
- `pinWidget(id)` - Pin widget

**Example:**
```typescript
'use client'

import { useDashboardFilters } from '@/store'

export default function DashboardPage() {
  const { period, module, setPeriod, setModule } = useDashboardFilters()

  return (
    <div>
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </div>
  )
}
```

### 5. useStockStore

Manages stock alerts and warehouse selection.

**State:**
- `alerts: StockAlert[]` - Stock alerts
- `selectedWarehouse: string | null` - Selected warehouse
- `warehouses: Warehouse[]` - Available warehouses
- `alertThresholds: object` - Alert thresholds

**Actions:**
- `setAlerts(alerts)` - Set alerts
- `addAlert(alert)` - Add alert
- `acknowledgeAlert(id)` - Acknowledge alert
- `setSelectedWarehouse(id)` - Set warehouse

**Example:**
```typescript
'use client'

import { useStockAlerts } from '@/store'

export default function StockAlerts() {
  const { alerts, criticalAlerts, acknowledgeAlert } = useStockAlerts()

  return (
    <div>
      <h2>Stock Alerts ({criticalAlerts.length})</h2>
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
      ))}
    </div>
  )
}
```

## Best Practices

### 1. Use Selectors for Performance

Instead of subscribing to the entire store, use selectors to only subscribe to the data you need:

```typescript
// ❌ Bad - subscribes to entire store
const store = usePOSStore()

// ✅ Good - only subscribes to items
const items = usePOSStore((state) => state.items)

// ✅ Better - use pre-defined selector
import { selectCartItems } from '@/store'
const items = usePOSStore(selectCartItems)
```

### 2. Use Custom Hooks

Custom hooks provide better encapsulation and reusability:

```typescript
// ✅ Good - use custom hook
const { items, total, itemCount } = useCartSummary()
```

### 3. Don't Duplicate API Data

Stores should only contain UI/interaction state. API data should be fetched using React Query hooks:

```typescript
// ❌ Bad - duplicating API data in store
const useProducts = () => {
  const [products, setProducts] = useState([])
  const setProductsInStore = useProductStore((state) => state.setProducts)
  // ...
}

// ✅ Good - use React Query for data, store for filters
const useProductFilters = () => {
  const { filters, setFilters } = useProductStore()
  const { data: products, isLoading } = useProducts(filters)
  return { products, isLoading, filters, setFilters }
}
```

### 4. Handle Edge Cases

**Refresh during transaction:**
```typescript
// Cart is persisted, so it survives refresh
// But payment state is reset for security
useEffect(() => {
  // Reset payment state on mount
  if (isMounted) {
    resetPayment()
  }
}, [])
```

**Prevent double submit:**
```typescript
const { isProcessing, setProcessing } = usePOSStore()

const handleSubmit = async () => {
  if (isProcessing) return // Prevent double submit
  
  setProcessing(true)
  try {
    await createTransaction()
  } finally {
    setProcessing(false)
  }
}
```

## Persistence

The following stores persist data to localStorage:

| Store | What's Persisted |
|-------|-----------------|
| useAuthStore | user, token, isAuthenticated |
| usePOSStore | cart items, totals, payment method |
| useUIStore | sidebar state, theme |
| useDashboardStore | filters, preferences |
| useStockStore | warehouse selection, thresholds |

To clear persisted data:
```typescript
// Clear all store data
localStorage.clear()

// Clear specific store
localStorage.removeItem('pos-storage')
```

## Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { usePOSStore } from '@/store'

test('addItem adds item to cart', () => {
  const { result } = renderHook(() => usePOSStore())

  act(() => {
    result.current.addItem({
      productId: '1',
      name: 'Product 1',
      price: 10000,
      quantity: 1,
      module: 'spbu',
    })
  })

  expect(result.current.items).toHaveLength(1)
  expect(result.current.total).toBe(11100) // Including tax
})
```

## TypeScript Support

All stores are fully typed. Import types from the store:

```typescript
import type { User, CartItem, PaymentMethod } from '@/store'

const user: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  // ...
}
```

## Migrating from Context/Redux

Zustand provides a simpler API compared to Context or Redux:

```typescript
// Context
const { cart, addItem } = useContext(CartContext)

// Redux
const dispatch = useDispatch()
dispatch(addItem(item))

// Zustand
const addItem = usePOSStore((state) => state.addItem)
addItem(item)
```

For more information, see [Zustand Documentation](https://github.com/pmndrs/zustand).
