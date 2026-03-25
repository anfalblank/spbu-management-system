/**
 * SPBU Service
 * Handles all SPBU module API calls
 */

import { BaseService } from './base-service'
import type { PaginationParams } from '../types/common'

/**
 * Dispenser interface
 */
export interface Dispenser {
  id: string
  name: string
  product: string
  nozzleCount: number
  status: 'active' | 'inactive' | 'maintenance'
  lastCalibration: string
  totalVolume: number
  todaySales: number
}

/**
 * Tank interface
 */
export interface Tank {
  id: string
  product: string
  capacity: number
  currentVolume: number
  lastDelivery: string
  level: 'critical' | 'low' | 'normal' | 'full'
}

/**
 * Shift settlement data
 */
export interface ShiftSettlement {
  id: string
  dispenserId: string
  shiftStart: string
  shiftEnd: string
  openingMeter: number
  closingMeter: number
  productPrice: number
  volume: number
  amount: number
  cashier: string
  status: 'pending' | 'submitted' | 'approved'
}

/**
 * Fuel stock interface
 */
export interface FuelStock {
  productId: string
  productName: string
  capacity: number
  currentVolume: number
  level: 'critical' | 'low' | 'normal' | 'full'
  lastDelivery: string
  nextDelivery?: string
}

/**
 * SPBU sales report
 */
export interface SPBUSalesReport {
  date: string
  productName: string
  openingStock: number
  delivery: number
  sales: number
  closingStock: number
  amount: number
}

/**
 * SPBU Service
 */
export class SPBUService extends BaseService {
  private readonly endpoint = '/spbu'

  /**
   * Get all dispensers
   */
  async getDispensers(): Promise<Dispenser[]> {
    const response = await this.client.get<{ data: Dispenser[] }>(
      `${this.endpoint}/dispensers`
    )
    return response.data.data || response.data
  }

  /**
   * Get dispenser by ID
   */
  async getDispenser(id: string): Promise<Dispenser> {
    const response = await this.client.get<{ data: Dispenser }>(
      `${this.endpoint}/dispensers/${id}`
    )
    return response.data.data || response.data
  }

  /**
   * Update dispenser status
   */
  async updateDispenserStatus(
    id: string,
    status: Dispenser['status']
  ): Promise<Dispenser> {
    const response = await this.client.patch<{ data: Dispenser }>(
      `${this.endpoint}/dispensers/${id}/status`,
      { status }
    )
    return response.data.data || response.data
  }

  /**
   * Get all tanks
   */
  async getTanks(): Promise<Tank[]> {
    const response = await this.client.get<{ data: Tank[] }>(
      `${this.endpoint}/tanks`
    )
    return response.data.data || response.data
  }

  /**
   * Get tank by ID
   */
  async getTank(id: string): Promise<Tank> {
    const response = await this.client.get<{ data: Tank }>(
      `${this.endpoint}/tanks/${id}`
    )
    return response.data.data || response.data
  }

  /**
   * Get fuel stock
   */
  async getFuelStock(): Promise<FuelStock[]> {
    const response = await this.client.get<{ data: FuelStock[] }>(
      `${this.endpoint}/fuel-stock`
    )
    return response.data.data || response.data
  }

  /**
   * Submit shift settlement
   */
  async submitShiftSettlement(data: {
    dispenserId: string
    openingMeter: number
    closingMeter: number
    shift: string
    cashier: string
  }): Promise<ShiftSettlement> {
    const response = await this.client.post<{ data: ShiftSettlement }>(
      `${this.endpoint}/shift-settlements`,
      data
    )
    return response.data.data || response.data
  }

  /**
   * Get shift settlements
   */
  async getShiftSettlements(
    params?: PaginationParams & {
      dispenserId?: string
      cashier?: string
      startDate?: string
      endDate?: string
    }
  ): Promise<{ data: ShiftSettlement[]; total: number }> {
    const response = await this.client.get<{ data: ShiftSettlement[]; total: number }>(
      this.buildEndpoint(`${this.endpoint}/shift-settlements`, params)
    )
    return response.data
  }

  /**
   * Get sales report
   */
  async getSalesReport(params: {
    startDate: string
    endDate: string
    product?: string
  }): Promise<SPBUSalesReport[]> {
    const response = await this.client.get<{ data: SPBUSalesReport[] }>(
      this.buildEndpoint(`${this.endpoint}/reports/sales`, params)
    )
    return response.data.data || response.data
  }

  /**
   * Get daily summary
   */
  async getDailySummary(date?: string): Promise<{
    totalSales: number
    totalVolume: number
    totalTransactions: number
    byProduct: Array<{
      product: string
      volume: number
      amount: number
    }>
  }> {
    const response = await this.client.get<{ data: any }>(
      this.buildEndpoint(`${this.endpoint}/summary/daily`, { date })
    )
    return response.data.data || response.data
  }

  /**
   * Record fuel delivery
   */
  async recordDelivery(data: {
    tankId: string
    volume: number
    supplier: string
    deliveryNote: string
  }): Promise<void> {
    await this.client.post(`${this.endpoint}/fuel-deliveries`, data)
  }

  /**
   * Get delivery history
   */
  async getDeliveryHistory(params?: {
    tankId?: string
    startDate?: string
    endDate?: string
  }): Promise<Array<{
    id: string
    tankId: string
    productName: string
    volume: number
    supplier: string
    deliveryNote: string
    date: string
  }>> {
    const response = await this.client.get<{ data: any[] }>(
      this.buildEndpoint(`${this.endpoint}/fuel-deliveries`, params)
    )
    return response.data.data || response.data
  }
}

/**
 * Singleton instance
 */
export const spbuService = new SPBUService()
