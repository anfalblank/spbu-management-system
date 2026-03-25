# API Integration Documentation

This document describes how to use the API service layer pattern in the SPBU Management System application.

## Overview

The application uses a service layer pattern with:
- **Centralized API Client** (`lib/api/client/api-client.ts`)
- **Service Classes** for each module (`lib/api/services/`)
- **React Hooks** for easy integration in components (`lib/hooks/`)
- **Error Handling** with user-friendly messages (`lib/api/utils/error-handler.ts`)
- **Caching** and **Retry Logic** built-in

## Quick Start

### Using Hooks in Components

```typescript
'use client'

import { useKPIs, useSalesData } from '@/lib/hooks'

export default function DashboardPage() {
  const { data: kpis, isLoading, isError, error } = useKPIs('today')
  const { data: sales } = useSalesData('week')

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error?.message}</div>

  return <div>Total Sales: {kpis?.totalSales}</div>
}
```

### Using Services Directly

```typescript
import { productService } from '@/lib/api'

const products = await productService.getProducts({ page: 1, pageSize: 20 })
const newProduct = await productService.createProduct({ name: 'Product Name', price: 10000, stock: 50 })
```

## Available Hooks

### Dashboard Hooks
- `useKPIs(period)` - Get KPI data
- `useSalesData(period)` - Get sales chart data
- `useSalesPredictions(days)` - Get AI predictions
- `useStockPredictions()` - Get stock predictions
- `useNotifications(unreadOnly)` - Get notifications

### Product Hooks
- `useProducts(filters)` - Get paginated products
- `useProduct(id)` - Get single product
- `useProductsByModule(module)` - Get products by module
- `useCreateProduct()` - Create new product
- `useUpdateProduct()` - Update product

### POS Hooks
- `useCreateTransaction()` - Create transaction
- `useTransaction(id)` - Get transaction details
- `useTransactions(filters)` - Get transactions list
- `useValidateDiscount()` - Validate discount code

### SPBU Hooks
- `useDispensers()` - Get all dispensers
- `useTanks()` - Get all tanks
- `useFuelStock()` - Get fuel stock levels
- `useSubmitShiftSettlement()` - Submit shift settlement

### LPG Hooks
- `useSalesAgreements(filters)` - Get sales agreements
- `useDistributions(filters)` - Get distributions
- `useLPGAnalytics(params)` - Get LPG analytics

For complete documentation, see each service file in `lib/api/services/`.
