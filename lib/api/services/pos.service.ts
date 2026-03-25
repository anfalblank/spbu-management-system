/**
 * POS (Point of Sale) Service
 * Handles all POS-related API calls
 */

import { BaseService } from './base-service'
import type { PaginationParams } from '../types/common'

/**
 * Cart item interface
 */
export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  module: 'spbu' | 'gas' | 'oli' | 'snb'
  unit?: string
  stock?: number
}

/**
 * Discount interface
 */
export interface Discount {
  type: 'percentage' | 'fixed'
  value: number
  code?: string
}

/**
 * Payment method types
 */
export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'voucher'

/**
 * Transaction interface
 */
export interface Transaction {
  id: string
  date: Date
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  amountPaid: number
  change: number
  cashier: string
  module: 'spbu' | 'gas' | 'oli' | 'snb'
  status: 'completed' | 'cancelled' | 'refunded'
}

/**
 * Create transaction request
 */
export interface CreateTransactionRequest {
  items: CartItem[]
  paymentMethod: PaymentMethod
  amountPaid?: number
  discount?: Discount
  cashier: string
  moduleId?: string
}

/**
 * Transaction response
 */
export interface TransactionResponse {
  id: string
  status: 'success' | 'failed'
  transaction?: Transaction
  error?: string
  receiptUrl?: string
}

/**
 * Daily sales summary
 */
export interface DailySalesSummary {
  date: string
  total: number
  transactions: number
  spbuSales: number
  gasSales: number
  oliSales: number
  snbSales: number
  averageTransaction: number
  busiestHour: number
}

/**
 * Shift settlement request
 */
export interface ShiftSettlementRequest {
  cashierId: string
  shiftStart: string
  shiftEnd: string
  openingBalance: number
  expectedAmount: number
  actualAmount: number
  notes?: string
}

/**
 * POS Service
 */
export class POSService extends BaseService {
  private readonly endpoint = '/pos'

  /**
   * Create transaction
   */
  async createTransaction(
    request: CreateTransactionRequest
  ): Promise<TransactionResponse> {
    const response = await this.client.post<TransactionResponse>(
      `${this.endpoint}/transactions`,
      request
    )
    return response.data
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(id: string): Promise<Transaction> {
    const response = await this.client.get<{ data: Transaction }>(
      `${this.endpoint}/transactions/${id}`
    )
    return response.data.data || response.data
  }

  /**
   * Get transactions with pagination
   */
  async getTransactions(
    params?: PaginationParams & {
      startDate?: string
      endDate?: string
      cashierId?: string
      paymentMethod?: PaymentMethod
    }
  ): Promise<{ data: Transaction[]; total: number }> {
    const response = await this.client.get<{ data: Transaction[]; total: number }>(
      this.buildEndpoint(`${this.endpoint}/transactions`, params)
    )
    return response.data
  }

  /**
   * Get today's sales summary
   */
  async getTodaySalesSummary(): Promise<DailySalesSummary> {
    const response = await this.client.get<{ data: DailySalesSummary }>(
      `${this.endpoint}/sales/today`
    )
    return response.data.data || response.data
  }

  /**
   * Cancel transaction
   */
  async cancelTransaction(
    id: string,
    reason: string
  ): Promise<void> {
    await this.client.post(`${this.endpoint}/transactions/${id}/cancel`, { reason })
  }

  /**
   * Refund transaction
   */
  async refundTransaction(
    id: string,
    reason: string,
    items?: Array<{ productId: string; quantity: number }>
  ): Promise<Transaction> {
    const response = await this.client.post<{ data: Transaction }>(
      `${this.endpoint}/transactions/${id}/refund`,
      { reason, items }
    )
    return response.data.data || response.data
  }

  /**
   * Validate discount code
   */
  async validateDiscountCode(code: string): Promise<Discount | null> {
    try {
      const response = await this.client.post<{ data: Discount }>(
        `${this.endpoint}/discounts/validate`,
        { code }
      )
      return response.data.data
    } catch {
      return null
    }
  }

  /**
   * Submit shift settlement
   */
  async submitShiftSettlement(
    request: ShiftSettlementRequest
  ): Promise<{ id: string; status: string }> {
    const response = await this.client.post<{ id: string; status: string }>(
      `${this.endpoint}/shift-settlement`,
      request
    )
    return response.data
  }

  /**
   * Get shift settlements
   */
  async getShiftSettlements(
    params?: PaginationParams & {
      cashierId?: string
      startDate?: string
      endDate?: string
    }
  ): Promise<{ data: ShiftSettlementRequest[]; total: number }> {
    const response = await this.client.get<{ data: ShiftSettlementRequest[]; total: number }>(
      this.buildEndpoint(`${this.endpoint}/shift-settlements`, params)
    )
    return response.data
  }

  /**
   * Get receipt
   */
  async getReceipt(transactionId: string): Promise<{
    url: string
    data: string
  }> {
    const response = await this.client.get<{ url: string; data: string }>(
      `${this.endpoint}/transactions/${transactionId}/receipt`
    )
    return response.data
  }

  /**
   * Send receipt via email/WhatsApp
   */
  async sendReceipt(
    transactionId: string,
    method: 'email' | 'whatsapp',
    destination: string
  ): Promise<void> {
    await this.client.post(
      `${this.endpoint}/transactions/${transactionId}/receipt/send`,
      { method, destination }
    )
  }
}

/**
 * Singleton instance
 */
export const posService = new POSService()
