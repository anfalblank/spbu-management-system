/**
 * Product Service
 * Handles all product-related API calls
 */

import { BaseService } from './base-service'
import type { Product } from '@/lib/api/mock-data' // Will be replaced with proper types
import type { PaginationParams, PaginatedResponse, FilterParams } from '../types/common'

/**
 * Product interface
 */
export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
  module: 'spbu' | 'gas' | 'oli' | 'snb'
  image?: string
  sku?: string
  barcode?: string
  minStock: number
  location?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Product list filters
 */
export interface ProductFilters extends FilterParams {
  module?: 'spbu' | 'gas' | 'oli' | 'snb'
  category?: string
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  search?: string
}

/**
 * Product Service
 */
export class ProductService extends BaseService {
  private readonly endpoint = '/products'

  /**
   * Get all products with pagination and filters
   */
  async getProducts(
    params?: PaginationParams & ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    return this.list<Product>(this.endpoint, params)
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<Product> {
    return this.getById<Product>(this.endpoint, id)
  }

  /**
   * Get products by module
   */
  async getProductsByModule(
    module: 'spbu' | 'gas' | 'oli' | 'snb'
  ): Promise<Product[]> {
    const response = await this.client.get<{ data: Product[] }>(
      this.buildEndpoint(this.endpoint, { module })
    )
    return response.data.data || response.data
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    const response = await this.client.get<{ data: Product[] }>(
      this.buildEndpoint(`${this.endpoint}/search`, { q: query })
    )
    return response.data.data || response.data
  }

  /**
   * Create product
   */
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return this.create(product, this.endpoint)
  }

  /**
   * Update product
   */
  async updateProduct(
    id: string,
    product: Partial<Product>
  ): Promise<Product> {
    return this.update<Product>(this.endpoint, id, product)
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    return this.delete(this.endpoint, id)
  }

  /**
   * Update product stock
   */
  async updateStock(
    id: string,
    quantity: number,
    operation: 'add' | 'subtract' | 'set'
  ): Promise<Product> {
    const response = await this.client.patch<Product>(
      `${this.endpoint}/${id}/stock`,
      { quantity, operation }
    )
    return response.data
  }

  /**
   * Bulk update stock
   */
  async bulkUpdateStock(
    items: Array<{ id: string; quantity: number; operation: 'add' | 'subtract' | 'set' }>
  ): Promise<Product[]> {
    const response = await this.client.post<{ data: Product[] }>(
      `${this.endpoint}/stock/bulk`,
      { items }
    )
    return response.data.data || response.data
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<Product[]> {
    const response = await this.client.get<{ data: Product[] }>(
      `${this.endpoint}/low-stock`
    )
    return response.data.data || response.data
  }

  /**
   * Get product categories
   */
  async getCategories(module?: string): Promise<string[]> {
    const response = await this.client.get<{ data: string[] }>(
      this.buildEndpoint(`${this.endpoint}/categories`, { module })
    )
    return response.data.data || response.data
  }
}

/**
 * Singleton instance
 */
export const productService = new ProductService()
