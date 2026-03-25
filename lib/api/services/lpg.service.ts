/**
 * LPG Service
 * Handles all LPG module API calls
 */

import { BaseService } from './base-service'
import type { PaginationParams } from '../types/common'

/**
 * Sales Agreement interface
 */
export interface SalesAgreement {
  id: string
  customerName: string
  customerAddress: string
  quota: number
  realized: number
  periodStart: string
  periodEnd: string
  status: 'active' | 'completed' | 'suspended'
  agent: string
  customerId?: string
  notes?: string
}

/**
 * Create Sales Agreement request
 */
export interface CreateSalesAgreementRequest {
  customerId: string
  quota: number
  periodStart: string
  periodEnd: string
  agentId: string
  notes?: string
}

/**
 * Distribution interface
 */
export interface Distribution {
  id: string
  date: string
  agreementId: string
  customerName: string
  quantity: number
  driver: string
  vehiclePlate: string
  notes?: string
  status: 'pending' | 'delivered' | 'cancelled'
}

/**
 * Create Distribution request
 */
export interface CreateDistributionRequest {
  agreementId: string
  quantity: number
  driver: string
  vehiclePlate: string
  notes?: string
}

/**
 * LPG Product (non-subsidized)
 */
export interface LPGProduct {
  id: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
  isSubsidized: boolean
}

/**
 * LPG Order (non-subsidized)
 */
export interface LPGOrder {
  id: string
  customerId: string
  customerName: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  total: number
  status: 'pending' | 'processing' | 'delivered' | 'cancelled'
  orderDate: string
  deliveryDate?: string
}

/**
 * LPG Sales Analytics
 */
export interface LPGAnalytics {
  period: string
  totalSales: number
  totalVolume: number
  totalQuota: number
  quotaUtilization: number
  topCustomers: Array<{
    customerId: string
    customerName: string
    volume: number
  }>
  byStatus: {
    active: number
    completed: number
    suspended: number
  }
}

/**
 * LPG Service
 */
export class LPGService extends BaseService {
  private readonly endpoint = '/lpg'

  // ========== Sales Agreement (Subsidized) ==========

  /**
   * Get all sales agreements
   */
  async getSalesAgreements(
    params?: PaginationParams & {
      status?: SalesAgreement['status']
      customerId?: string
      agentId?: string
      startDate?: string
      endDate?: string
    }
  ): Promise<{ data: SalesAgreement[]; total: number }> {
    const response = await this.client.get<{ data: SalesAgreement[]; total: number }>(
      this.buildEndpoint(`${this.endpoint}/sales-agreements`, params)
    )
    return response.data
  }

  /**
   * Get sales agreement by ID
   */
  async getSalesAgreement(id: string): Promise<SalesAgreement> {
    const response = await this.client.get<{ data: SalesAgreement }>(
      `${this.endpoint}/sales-agreements/${id}`
    )
    return response.data.data || response.data
  }

  /**
   * Create sales agreement
   */
  async createSalesAgreement(
    request: CreateSalesAgreementRequest
  ): Promise<SalesAgreement> {
    const response = await this.client.post<{ data: SalesAgreement }>(
      `${this.endpoint}/sales-agreements`,
      request
    )
    return response.data.data || response.data
  }

  /**
   * Update sales agreement
   */
  async updateSalesAgreement(
    id: string,
    data: Partial<SalesAgreement>
  ): Promise<SalesAgreement> {
    const response = await this.client.patch<{ data: SalesAgreement }>(
      `${this.endpoint}/sales-agreements/${id}`,
      data
    )
    return response.data.data || response.data
  }

  /**
   * Suspend/activate sales agreement
   */
  async setSalesAgreementStatus(
    id: string,
    status: 'active' | 'suspended'
  ): Promise<SalesAgreement> {
    return this.updateSalesAgreement(id, { status })
  }

  // ========== Distributions ==========

  /**
   * Get distributions
   */
  async getDistributions(
    params?: PaginationParams & {
      agreementId?: string
      customerId?: string
      status?: Distribution['status']
      startDate?: string
      endDate?: string
    }
  ): Promise<{ data: Distribution[]; total: number }> {
    const response = await this.client.get<{ data: Distribution[]; total: number }>(
      this.buildEndpoint(`${this.endpoint}/distributions`, params)
    )
    return response.data
  }

  /**
   * Create distribution
   */
  async createDistribution(
    request: CreateDistributionRequest
  ): Promise<Distribution> {
    const response = await this.client.post<{ data: Distribution }>(
      `${this.endpoint}/distributions`,
      request
    )
    return response.data.data || response.data
  }

  /**
   * Update distribution status
   */
  async updateDistributionStatus(
    id: string,
    status: Distribution['status']
  ): Promise<Distribution> {
    const response = await this.client.patch<{ data: Distribution }>(
      `${this.endpoint}/distributions/${id}/status`,
      { status }
    )
    return response.data.data || response.data
  }

  /**
   * Get distributions by agreement
   */
  async getAgreementDistributions(agreementId: string): Promise<Distribution[]> {
    const response = await this.client.get<{ data: Distribution[] }>(
      `${this.endpoint}/sales-agreements/${agreementId}/distributions`
    )
    return response.data.data || response.data
  }

  // ========== Analytics ==========

  /**
   * Get LPG sales analytics
   */
  async getAnalytics(params: {
    startDate: string
    endDate: string
  }): Promise<LPGAnalytics> {
    const response = await this.client.get<{ data: LPGAnalytics }>(
      this.buildEndpoint(`${this.endpoint}/analytics`, params)
    )
    return response.data.data || response.data
  }

  /**
   * Get quota vs realization report
   */
  async getQuotaRealizationReport(params: {
    startDate: string
    endDate: string
  }): Promise<Array<{
    agreementId: string
    customerName: string
    quota: number
    realized: number
    remaining: number
    utilization: number
  }>> {
    const response = await this.client.get<{ data: any[] }>(
      this.buildEndpoint(`${this.endpoint}/reports/quota-realization`, params)
    )
    return response.data.data || response.data
  }

  // ========== Non-Subsidized Products ==========

  /**
   * Get LPG products (non-subsidized)
   */
  async getProducts(): Promise<LPGProduct[]> {
    const response = await this.client.get<{ data: LPGProduct[] }>(
      `${this.endpoint}/products?subsidized=false`
    )
    return response.data.data || response.data
  }

  /**
   * Create product
   */
  async createProduct(product: Omit<LPGProduct, 'id'>): Promise<LPGProduct> {
    const response = await this.client.post<{ data: LPGProduct }>(
      `${this.endpoint}/products`,
      product
    )
    return response.data.data || response.data
  }

  // ========== Non-Subsidized Orders ==========

  /**
   * Get orders
   */
  async getOrders(
    params?: PaginationParams & {
      customerId?: string
      status?: LPGOrder['status']
      startDate?: string
      endDate?: string
    }
  ): Promise<{ data: LPGOrder[]; total: number }> {
    const response = await this.client.get<{ data: LPGOrder[]; total: number }>(
      this.buildEndpoint(`${this.endpoint}/orders`, params)
    )
    return response.data
  }

  /**
   * Create order
   */
  async createOrder(data: {
    customerId: string
    items: Array<{
      productId: string
      quantity: number
    }>
  }): Promise<LPGOrder> {
    const response = await this.client.post<{ data: LPGOrder }>(
      `${this.endpoint}/orders`,
      data
    )
    return response.data.data || response.data
  }

  /**
   * Get sales report (non-subsidized)
   */
  async getSalesReport(params: {
    startDate: string
    endDate: string
  }): Promise<Array<{
    date: string
    totalSales: number
    totalVolume: number
    orders: number
  }>> {
    const response = await this.client.get<{ data: any[] }>(
      this.buildEndpoint(`${this.endpoint}/reports/sales`, params)
    )
    return response.data.data || response.data
  }
}

/**
 * Singleton instance
 */
export const lpgService = new LPGService()
