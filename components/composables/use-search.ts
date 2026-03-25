'use client'

import { useState, useCallback, useEffect } from 'react'

/**
 * Generic search hook with debouncing
 */
export function useSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  options?: {
    debounceMs?: number
    initialQuery?: string
  }
) {
  const [query, setQuery] = useState(options?.initialQuery || '')
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, options?.debounceMs || 300)

    return () => clearTimeout(timer)
  }, [query, options?.debounceMs])

  // Filtered results
  const results = items.filter(item => searchFn(item, debouncedQuery))

  const clear = useCallback(() => {
    setQuery('')
  }, [])

  return {
    query,
    debouncedQuery,
    setQuery,
    results,
    clear,
    isSearching: query !== debouncedQuery,
    hasQuery: query.length > 0,
    resultCount: results.length,
    totalCount: items.length,
  }
}

/**
 * Simple search implementation for string fields
 */
export function createStringSearchFn<T>(fields: (keyof T)[]) {
  return (item: T, query: string): boolean => {
    if (!query) return true

    const lowerQuery = query.toLowerCase()

    return fields.some(field => {
      const value = item[field]
      return (
        value !== null &&
        value !== undefined &&
        String(value).toLowerCase().includes(lowerQuery)
      )
    })
  }
}

/**
 * Advanced search with filters
 */
export function useAdvancedSearch<T>(
  items: T[],
  options?: {
    searchFn?: (item: T, query: string) => boolean
    filterFn?: (item: T) => boolean
    sortFn?: (a: T, b: T) => number
    debounceMs?: number
  }
) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, options?.debounceMs || 300)

    return () => clearTimeout(timer)
  }, [query, options?.debounceMs])

  // Apply search, filters, and sort
  const results = items
    .filter(item => {
      // Apply search
      if (options?.searchFn && debouncedQuery) {
        if (!options.searchFn(item, debouncedQuery)) return false
      }

      // Apply filters
      if (options?.filterFn) {
        if (!options.filterFn(item)) return false
      }

      return true
    })
    .sort(options?.sortFn)

  const updateFilter = useCallback(<K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const clearAll = useCallback(() => {
    setQuery('')
    setFilters({})
  }, [])

  return {
    // Query
    query,
    debouncedQuery,
    setQuery,

    // Filters
    filters,
    updateFilter,
    clearFilters,

    // Results
    results,
    resultCount: results.length,
    totalCount: items.length,

    // Actions
    clearSearch,
    clearAll,
    isSearching: query !== debouncedQuery,
    hasQuery: query.length > 0,
    hasFilters: Object.keys(filters).length > 0,
  }
}
