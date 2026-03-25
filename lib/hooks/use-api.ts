/**
 * Base API Hook
 * Provides common functionality for API hooks with loading, error states
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ApiError, handleApiErrorInUI } from '@/lib/api'

export interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: ApiError | null
}

export interface UseApiOptions {
  enabled?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
  showErrorToast?: boolean
}

/**
 * Base hook for API calls
 */
export function useApi<T = any>(
  apiFn: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { enabled = true, onSuccess, onError, showErrorToast = true } = options

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: enabled,
    isError: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(async (): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setState(prev => ({ ...prev, isLoading: true, isError: false, error: null }))

    try {
      const data = await apiFn()
      setState({
        data,
        isLoading: false,
        isError: false,
        error: null,
      })
      onSuccess?.(data)
      return data
    } catch (error) {
      const apiError = handleApiErrorInUI(error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: apiError,
      }))
      onError?.(apiError)
      return null
    }
  }, [apiFn, onSuccess, onError])

  useEffect(() => {
    if (enabled) {
      execute()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [enabled])

  const refetch = useCallback(() => execute(), [execute])

  return {
    ...state,
    execute,
    refetch,
  }
}

/**
 * Hook for manual API calls (not auto-executing)
 */
export function useApiLazy<T = any>(apiFn: () => Promise<T>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  })

  const execute = useCallback(async (): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, isError: false, error: null }))

    try {
      const data = await apiFn()
      setState({
        data,
        isLoading: false,
        isError: false,
        error: null,
      })
      return data
    } catch (error) {
      const apiError = handleApiErrorInUI(error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: apiError,
      }))
      return null
    }
  }, [apiFn])

  return {
    ...state,
    execute,
  }
}

/**
 * Hook for paginated API calls
 */
export function useApiPaginated<T = any>(
  apiFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  initialPageSize = 20
) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const response = await apiFn(page, pageSize)
      setData(response.data)
      setTotal(response.total)
    } catch (err) {
      const apiError = handleApiErrorInUI(err)
      setIsError(true)
      setError(apiError)
    } finally {
      setIsLoading(false)
    }
  }, [apiFn, page, pageSize])

  useEffect(() => {
    fetch()
  }, [fetch])

  const refetch = useCallback(() => fetch(), [fetch])

  return {
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
  }
}
