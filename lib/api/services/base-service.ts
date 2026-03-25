/**
 * Base Service Class
 * Provides common functionality for all API services
 */

import { apiClient, type ApiRequestConfig } from '../client/api-client'
import type { PaginationParams, PaginatedResponse } from '../types/common'

/**
 * Base class for all API services
 */
export abstract class BaseService {
  protected client = apiClient

  /**
   * Build query string from params
   */
  protected buildQuery(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Build endpoint with query params
   */
  protected buildEndpoint(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint
    return `${endpoint}${this.buildQuery(params)}`
  }

  /**
   * Generic list request with pagination
   */
  protected async list<T>(
    endpoint: string,
    params?: PaginationParams & Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(
      this.buildEndpoint(endpoint, params)
    )
    return response.data
  }

  /**
   * Generic get by id request
   */
  protected async getById<T>(endpoint: string, id: string): Promise<T> {
    const response = await this.client.get<T>(`${endpoint}/${id}`)
    return response.data
  }

  /**
   * Generic create request
   */
  protected async create<T, R = T>(
    endpoint: string,
    data: T
  ): Promise<R> {
    const response = await this.client.post<R>(endpoint, data)
    return response.data
  }

  /**
   * Generic update request
   */
  protected async update<T, R = T>(
    endpoint: string,
    id: string,
    data: Partial<T>
  ): Promise<R> {
    const response = await this.client.patch<R>(`${endpoint}/${id}`, data)
    return response.data
  }

  /**
   * Generic delete request
   */
  protected async delete(endpoint: string, id: string): Promise<void> {
    await this.client.delete(`${endpoint}/${id}`)
  }

  /**
   * Generic bulk delete request
   */
  protected async bulkDelete(endpoint: string, ids: string[]): Promise<void> {
    await this.client.post(`${endpoint}/bulk-delete`, { ids })
  }
}
