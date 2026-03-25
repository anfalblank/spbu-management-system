# Clean Architecture Refactor

## Overview

The application has been refactored to follow clean architecture principles, separating concerns into reusable layers. This improves maintainability, testability, and reusability across modules.

## Directory Structure

```
components/
├── ui/                    # Base shadcn/ui components (no business logic)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── common/                # Reusable application components
│   ├── product/           # Product-related components
│   │   ├── product-card-base.tsx       # Generic product card
│   │   └── product-grid-base.tsx       # Generic product grid
│   ├── cart/              # Cart-related components
│   │   ├── cart-item-base.tsx          # Generic cart item
│   │   └── cart-summary.tsx            # Cart totals & actions
│   ├── form/              # Form components
│   │   ├── search-input.tsx            # Enhanced search input
│   │   └── quantity-selector.tsx       # Quantity selector
│   ├── layout/            # Layout components
│   │   └── page-header.tsx             # Page header
│   ├── modal/             # Modal components
│   │   └── base-modal.tsx              # Generic modal wrapper
│   └── index.ts           # Barrel export
├── composables/           # Custom hooks (business logic)
│   ├── use-cart.ts        # Cart logic & state
│   ├── use-products.ts    # Product fetching & filtering
│   ├── use-search.ts      # Search functionality
│   ├── use-modal.ts       # Modal state management
│   └── index.ts           # Barrel export
├── pos/                   # POS-specific components (use common + composables)
│   ├── refactored-product-card.tsx
│   ├── refactored-cart-item.tsx
│   ├── refactored-pos-page.tsx
│   └── ...
├── dashboard/             # Dashboard-specific components
├── shared/                # Shared utilities
└── ...
```

## Architecture Layers

### 1. UI Layer (`components/ui/`)

- **Purpose**: Base, unstyled components from shadcn/ui
- **Characteristics**:
  - No business logic
  - Highly reusable
  - Framework-agnostic patterns
  - Styled with Tailwind CSS variants

### 2. Common Layer (`components/common/`)

- **Purpose**: Reusable application components
- **Characteristics**:
  - Configurable via props
  - No direct business logic
  - Generic type support
  - Can be used across modules

**Examples**:
```typescript
// Generic product card - can be used in POS, Catalog, Inventory, etc.
<ProductCardBase
  id="p1"
  name="Pertalite"
  price={10000}
  stock={5000}
  onAction={handleAddToCart}
/>

// Generic cart item - can be used in any cart implementation
<CartItemBase
  name="Pertalite"
  price={10000}
  quantity={2}
  onIncrement={() => {}}
  onDecrement={() => {}}
/>
```

### 3. Composables Layer (`components/composables/`)

- **Purpose**: Business logic and state management
- **Characteristics**:
  - Encapsulates complex logic
  - Reusable across components
  - Testable in isolation
  - Clear API surface

**Examples**:
```typescript
// Cart hook - handles all cart operations
const { items, total, addItem, removeItem } = useCart()

// Products hook - handles fetching and filtering
const { products, loading, error } = useProducts('spbu')

// Search hook - debounced search with filters
const { query, results, search } = useProductSearch()
```

### 4. Feature Layer (`components/pos/`, `components/dashboard/`, etc.)

- **Purpose**: Module-specific implementations
- **Characteristics**:
  - Combines common + composables
  - Implements specific business rules
  - Provides feature-specific UI

**Example**:
```typescript
// POS-specific product card using base component
export function POSProductCard({ product }: { product: Product }) {
  const { addItem } = useCart() // Business logic from composable

  return (
    <ProductCardBase
      {...productProps}
      onAction={handleAddToCart} // POS-specific action
    />
  )
}
```

## Key Principles

### 1. Separation of Concerns

Each layer has a clear responsibility:
- **UI**: Visual components
- **Common**: Reusable application components
- **Composables**: Business logic
- **Features**: Specific implementations

### 2. Dependency Inversion

Features depend on abstractions (common components), not concretions:
```typescript
// ❌ Bad: Direct implementation
export function CartItem() {
  return <div>{/* specific implementation */}</div>
}

// ✅ Good: Using base component
export function POSCartItem({ item }) {
  return <CartItemBase {...props} />
}
```

### 3. Reusability

Components are designed for reuse:
- Generic type parameters
- Configurable via props
- No hard-coded business logic

### 4. Testability

Each layer can be tested independently:
```typescript
// Test composable without UI
describe('useCart', () => {
  it('calculates total correctly', () => {
    const { result } = renderHook(() => useCart())
    // Test logic
  })
})

// Test component with mocked hooks
describe('ProductCardBase', () => {
  it('renders product info', () => {
    render(<ProductCardBase {...props} />)
    // Test rendering
  })
})
```

## Migration Guide

### Old Pattern ❌

```typescript
// Everything in one component
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()

  return (
    <Card>
      <CardContent>
        <img src={product.image} />
        <h3>{product.name}</h3>
        <p>{formatCurrency(product.price)}</p>
        <Button onClick={() => addItem(product)}>Add</Button>
      </CardContent>
    </Card>
  )
}
```

### New Pattern ✅

```typescript
// Step 1: Create base component (common layer)
export function ProductCardBase({ /* ... */ }: ProductCardBaseProps) {
  // Generic rendering
  return <Card> {/* ... */} </Card>
}

// Step 2: Create composable (composables layer)
export function useCart() {
  // Business logic
  return { items, total, addItem }
}

// Step 3: Create feature component (feature layer)
export function POSProductCard({ product }: { product: Product }) {
  const { addItem } = useCart() // Use composable

  return (
    <ProductCardBase
      {...productProps}
      onAction={() => addItem(product)} // Feature-specific logic
    />
  )
}
```

## Benefits

1. **Reusability**: Common components can be used across POS, Catalog, Inventory, etc.
2. **Maintainability**: Changes to business logic are isolated in composables
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easy to add new features using existing patterns
5. **Type Safety**: Full TypeScript support with generic types

## Examples of Reuse

### Product Card

Can be used in:
- **POS**: Quick add to cart
- **Catalog**: Detailed view with reviews
- **Inventory**: Stock management
- **Reports**: Sales analytics

```typescript
// POS - Quick add
<ProductCardBase onAction={addToCart} actionLabel="Add" />

// Catalog - View details
<ProductCardBase onAction={viewDetails} actionLabel="View" />

// Inventory - Edit stock
<ProductCardBase onAction={editStock} actionLabel="Edit" />
```

### Search

Can be used for:
- Products
- Customers
- Transactions
- Reports

```typescript
const { query, results, search } = useSearch(
  items,
  (item, q) => item.name.includes(q)
)
```

## Best Practices

1. **Keep components small and focused**
2. **Use composables for business logic**
3. **Prefer composition over inheritance**
4. **Use TypeScript generics for flexibility**
5. **Document component APIs with JSDoc**
6. **Test composables independently**
7. **Use barrel exports (`index.ts`) for clean imports**

## Future Enhancements

- [ ] Add more common components (table, filters, etc.)
- [ ] Create data fetching abstractions
- [ ] Add error boundary components
- [ ] Implement optimistic updates
- [ ] Add loading state management
- [ ] Create animation components
