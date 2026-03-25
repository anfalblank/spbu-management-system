/**
 * Products Hook
 * Handles all product-related API calls with loading and error states
 */

'use client'

import { useCallback } from 'react'
import { productService } from '@/lib/api'
import type { Product, ProductFilters } from '@/lib/api'
import { useApi, useApiLazy, useApiPaginated } from './use-api'

/**
 * Hook for fetching all products with pagination and filters
 */
export function useProducts(filters?: ProductFilters & { page?: number; pageSize?: number }) {
  const {
    data,
    total,
    page,
    pageSize,
    isLoading,
    isError,
    error,
    setPage,
    setPageSize,
    refetch,
  } = useApiPaginated<Product>(
    (page, pageSize) =>
      productService.getProducts({ ...filters, page, pageSize }),
    filters?.pageSize ?? 20
  )

  return {
    products: data,
    total,
    page,
    pageSize,
    isLoading,
    isError,
    error,
    setPage,
    setPageSize,
    refetch,
  }
}

/**
 * Hook for fetching a single product by ID
 */
export function useProduct(id: string) {
  return useApi<Product>(
    () => productService.getProduct(id),
    { enabled: !!id }
  )
}

/**
 * Hook for fetching products by module
 */
export function useProductsByModule(module: 'spbu' | 'gas' | 'oli' | 'snb') {
  return useApi<Product[]>(
    () => productService.getProductsByModule(module),
    { enabled: !!module }
  )
}

/**
 * Hook for searching products
 */
export function useProductSearch() {
  const { execute, data, isLoading, isError, error } = useApiLazy<Product[]>(
    (query: string) => productService.searchProducts(query)
  )

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      return []
    }
    return execute()
  }, [execute])

  return {
    search,
    results: data ?? [],
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for fetching low stock products
 */
export function useLowStockProducts() {
  return useApi<Product[]>(
    () => productService.getLowStockProducts(),
    { enabled: true }
  )
}

/**
 * Hook for creating a product
 */
export function useCreateProduct() {
  const { execute, isLoading, isError, error } = useApiLazy<Product>(
    (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      productService.createProduct(product)
  )

  const create = useCallback(async (
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product | null> => {
    return execute()
  }, [execute])

  return {
    create,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for updating a product
 */
export function useUpdateProduct() {
  const { execute, isLoading, isError, error } = useApiLazy<Product>(
    ({ id, product }: { id: string; product: Partial<Product> }) =>
      productService.updateProduct(id, product)
  )

  const update = useCallback(async (
    id: string,
    product: Partial<Product>
  ): Promise<Product | null> => {
    return execute()
  }, [execute])

  return {
    update,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for deleting a product
 */
export function useDeleteProduct() {
  const { execute, isLoading, isError, error } = useApiLazy<void>(
    (id: string) => productService.deleteProduct(id)
  )

  const remove = useCallback(async (id: string): Promise<void> => {
    return execute()
  }, [execute])

  return {
    remove,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for updating product stock
 */
export function useUpdateStock() {
  const { execute, isLoading, isError, error } = useApiLazy<Product>(
    ({ id, quantity, operation }: { id: string; quantity: number; operation: 'add' | 'subtract' | 'set' }) =>
      productService.updateStock(id, quantity, operation)
  )

  const updateStock = useCallback(async (
    id: string,
    quantity: number,
    operation: 'add' | 'subtract' | 'set' = 'add'
  ): Promise<Product | null> => {
    return execute()
  }, [execute])

  return {
    updateStock,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for getting product categories
 */
export function useProductCategories(module?: string) {
  return useApi<string[]>(
    () => productService.getCategories(module),
    { enabled: true }
  )
}
