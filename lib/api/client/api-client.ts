/**
 * API Client
 * Centralized HTTP client with interceptors, error handling, and caching
 */

import { API_CONFIG, getEnvConfig } from './config'
import { handleApiError } from '../utils/error-handler'
import { retryRequest } from '../utils/retry'

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  params?: Record<string, string | number>
  body?: any
  cache?: boolean | number // false = no cache, true = default TTL, number = custom TTL
  retry?: boolean
  timeout?: number
  signal?: AbortSignal
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
  meta?: {
    requestId: string
    timestamp: string
  }
}

/**
 * API Client Class
 */
export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private cache = new Map<string, { data: any; expires: number }>()
  private envConfig: ReturnType<typeof getEnvConfig>

  constructor() {
    this.baseURL = getEnvConfig().baseURL
    this.defaultHeaders = API_CONFIG.headers
    this.envConfig = getEnvConfig()

    // Initialize cache from localStorage if available
    if (typeof window !== 'undefined') {
      this.loadCacheFromStorage()
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(endpoint, this.baseURL)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null

    // Try to get from localStorage
    const token = localStorage.getItem('auth_token')
    if (token) return token

    // Try to get from cookie
    const match = document.cookie.match(/(^|;) *auth_token=([^;]*)/)
    return match ? match[2] : null
  }

  /**
   * Get request headers
   */
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...customHeaders,
    }

    // Add auth token if available
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Generate cache key
   */
  private getCacheKey(url: string, method: string, body?: any): string {
    return `${method}:${url}:${body ? JSON.stringify(body) : ''}`
  }

  /**
   * Get from cache
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() > cached.expires) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any, ttl?: number): void {
    const expires = Date.now() + (ttl || API_CONFIG.cache.ttl)
    this.cache.set(key, { data, expires })

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      this.saveCacheToStorage()
    }
  }

  /**
   * Clear cache
   */
  public clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }

    if (typeof window !== 'undefined') {
      this.saveCacheToStorage()
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const saved = localStorage.getItem('api_cache')
      if (saved) {
        const parsed = JSON.parse(saved)
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          if (value.expires > Date.now()) {
            this.cache.set(key, value)
          }
        })
      }
    } catch {
      // Ignore errors
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      const obj = Object.fromEntries(this.cache.entries())
      localStorage.setItem('api_cache', JSON.stringify(obj))
    } catch {
      // Ignore errors (might be quota exceeded)
    }
  }

  /**
   * Log request (development only)
   */
  private logRequest(method: string, url: string, config: ApiRequestConfig): void {
    if (!this.envConfig.logRequests) return

    console.group(`🚀 API [${method}]`, url)
    console.log('Config:', config)
    console.groupEnd()
  }

  /**
   * Log response (development only)
   */
  private logResponse(method: string, url: string, response: ApiResponse): void {
    if (!this.envConfig.logRequests) return

    console.group(`✅ API Response [${method}]`, url)
    console.log('Status:', response.status)
    console.log('Data:', response.data)
    console.groupEnd()
  }

  /**
   * Log error (development only)
   */
  private logError(method: string, url: string, error: Error): void {
    if (!this.envConfig.logErrors) return

    console.group(`❌ API Error [${method}]`, url)
    console.error('Error:', error)
    console.groupEnd()
  }

  /**
   * Make HTTP request
   */
  public async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers,
      params,
      body,
      cache = API_CONFIG.cache.enabled,
      retry = true,
      timeout = API_CONFIG.timeout,
      signal,
    } = config

    const url = this.buildUrl(endpoint, params)
    const cacheKey = this.getCacheKey(url, method, body)

    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        this.logRequest(method, url, { ...config, cached: true })
        return {
          data: cached,
          status: 200,
          statusText: 'OK (Cached)',
          headers: new Headers(),
        }
      }
    }

    // Prepare request
    const requestInit: RequestInit = {
      method,
      headers: this.getHeaders(headers),
      signal,
    }

    if (body && method !== 'GET') {
      requestInit.body = JSON.stringify(body)
    }

    // Create timeout signal
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Combine signals
    const combinedSignal = signal
      ? this.combineSignals([controller.signal, signal])
      : controller.signal

    requestInit.signal = combinedSignal

    this.logRequest(method, url, config)

    try {
      const executeRequest = async (): Promise<Response> => {
        const response = await fetch(url, requestInit)
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw await handleApiError(response)
        }

        return response
      }

      // Execute with retry if enabled
      const response = retry
        ? await retryRequest(executeRequest, API_CONFIG.retry)
        : await executeRequest()

      const data = await response.json()

      // Cache successful GET requests
      if (method === 'GET' && cache && response.ok) {
        this.setCache(cacheKey, data, typeof cache === 'number' ? cache : undefined)
      }

      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        meta: {
          requestId: crypto.randomUUID?.() || Math.random().toString(36),
          timestamp: new Date().toISOString(),
        },
      }

      this.logResponse(method, url, apiResponse)

      return apiResponse
    } catch (error) {
      this.logError(method, url, error as Error)
      throw error
    }
  }

  /**
   * Combine multiple abort signals
   */
  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort()
        break
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    return controller.signal
  }

  /**
   * Convenience methods
   */
  public get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  public post<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  public put<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  public patch<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  public delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

/**
 * Singleton instance
 */
export const apiClient = new ApiClient()

/**
 * Export convenience functions
 */
export const { get, post, put, patch, delete: del } = apiClient
