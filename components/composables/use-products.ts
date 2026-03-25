'use client'

import { useState, useEffect, useCallback } from 'react'
import { getProducts, getProductById, searchProducts } from '@/lib/api/services'
import { Product } from '@/lib/api/mock-data'

/**
 * Enhanced products hook with loading states and caching
 */
export function useProducts(module?: string, options?: {
  enabled?: boolean
  cacheKey?: string
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProducts = useCallback(async () => {
    if (options?.enabled === false) return

    setLoading(true)
    setError(null)

    try {
      const data = await getProducts(module as any)
      setProducts(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [module, options?.enabled])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  }
}

/**
 * Single product hook
 */
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await getProductById(id)
        setProduct(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return {
    product,
    loading,
    error,
  }
}

/**
 * Product search hook
 */
export function useProductSearch() {
  const [results, setResults] = useState<Product[]>([])
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery)
    setSearching(true)

    try {
      const data = await searchProducts(searchQuery)
      setResults(data)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return {
    results,
    searching,
    query,
    search,
    clear,
    hasQuery: query.length > 0,
  }
}

/**
 * Product filter hook
 */
export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<{
    category: string
    searchQuery: string
    inStockOnly: boolean
    priceRange?: [number, number]
  }>({
    category: 'all',
    searchQuery: '',
    inStockOnly: false,
  })

  const filteredProducts = products.filter(product => {
    // Category filter
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)

      if (!matchesSearch) return false
    }

    // Stock filter
    if (filters.inStockOnly && product.stock === 0) {
      return false
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange
      if (product.price < min || product.price > max) {
        return false
      }
    }

    return true
  })

  const updateFilter = useCallback(<K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      category: 'all',
      searchQuery: '',
      inStockOnly: false,
    })
  }, [])

  return {
    filters,
    filteredProducts,
    updateFilter,
    clearFilters,
    hasActiveFilters:
      filters.category !== 'all' ||
      filters.searchQuery.length > 0 ||
      filters.inStockOnly,
  }
}
