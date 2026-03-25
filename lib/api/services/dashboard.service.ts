/**
 * Dashboard Service
 * Handles all dashboard and analytics API calls
 */

import { BaseService } from './base-service'

/**
 * Sales data point
 */
export interface SalesData {
  date: string
  total: number
  transactions: number
  spbuSales: number
  gasSales: number
  oliSales: number
  snbSales: number
}

/**
 * KPI data
 */
export interface KPIData {
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  stockAlerts: number
  growth: {
    sales: number
    transactions: number
  }
}

/**
 * Sales prediction
 */
export interface SalesPrediction {
  date: string
  predicted: number
  confidence: number
  actual?: number
}

/**
 * Stock prediction
 */
export interface StockPrediction {
  productId: string
  productName: string
  currentStock: number
  dailyUsage: number
  daysUntilEmpty: number
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Notification
 */
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  date: string
  read: boolean
  actionUrl?: string
}

/**
 * Dashboard Service
 */
export class DashboardService extends BaseService {
  private readonly endpoint = '/dashboard'

  /**
   * Get KPI data
   */
  async getKPIs(period: 'today' | 'week' | 'month' = 'today'): Promise<KPIData> {
    const response = await this.client.get<{ data: KPIData }>(
      `${this.endpoint}/kpi?period=${period}`
    )
    return response.data.data || response.data
  }

  /**
   * Get sales data
   */
  async getSalesData(period: 'today' | 'week' | 'month' = 'week'): Promise<SalesData[]> {
    const response = await this.client.get<{ data: SalesData[] }>(
      `${this.endpoint}/sales?period=${period}`
    )
    return response.data.data || response.data
  }

  /**
   * Get sales per module
   */
  async getSalesPerModule(period: 'today' | 'week' | 'month' = 'today'): Promise<{
    spbuSales: number
    gasSales: number
    oliSales: number
    snbSales: number
  }> {
    const response = await this.client.get<{ data: any }>(
      `${this.endpoint}/sales/per-module?period=${period}`
    )
    return response.data.data || response.data
  }

  /**
   * Get sales predictions
   */
  async getSalesPredictions(days: number = 14): Promise<SalesPrediction[]> {
    const response = await this.client.get<{ data: SalesPrediction[] }>(
      `${this.endpoint}/predictions/sales?days=${days}`
    )
    return response.data.data || response.data
  }

  /**
   * Get stock predictions
   */
  async getStockPredictions(): Promise<StockPrediction[]> {
    const response = await this.client.get<{ data: StockPrediction[] }>(
      `${this.endpoint}/predictions/stock`
    )
    return response.data.data || response.data
  }

  /**
   * Get notifications
   */
  async getNotifications(unreadOnly?: boolean): Promise<Notification[]> {
    const response = await this.client.get<{ data: Notification[] }>(
      `${this.endpoint}/notifications${unreadOnly ? '?unread=true' : ''}`
    )
    return response.data.data || response.data
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: string): Promise<void> {
    await this.client.post(`${this.endpoint}/notifications/${id}/read`, {})
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<void> {
    await this.client.post(`${this.endpoint}/notifications/read-all`, {})
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<{ total: number; unread: number }> {
    const response = await this.client.get<{ data: { total: number; unread: number } }>(
      `${this.endpoint}/notifications/count`
    )
    return response.data.data || { total: 0, unread: 0 }
  }

  /**
   * Get hourly sales for today
   */
  async getHourlySales(): Promise<Array<{
    hour: number
    sales: number
    transactions: number
  }>> {
    const response = await this.client.get<{ data: any[] }>(
      `${this.endpoint}/sales/hourly`
    )
    return response.data.data || response.data
  }

  /**
   * Get top products
   */
  async getTopProducts(
    period: 'today' | 'week' | 'month' = 'week',
    limit: number = 10
  ): Promise<Array<{
    productId: string
    productName: string
    category: string
    quantity: number
    amount: number
  }>> {
    const response = await this.client.get<{ data: any[] }>(
      `${this.endpoint}/products/top?period=${period}&limit=${limit}`
    )
    return response.data.data || response.data
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<Array<{
    productId: string
    productName: string
    currentStock: number
    minStock: number
    daysUntilEmpty: number
  }>> {
    const response = await this.client.get<{ data: any[] }>(
      `${this.endpoint}/products/low-stock`
    )
    return response.data.data || response.data
  }

  /**
   * Get revenue comparison
   */
  async getRevenueComparison(
    period: 'week' | 'month' = 'month'
  ): Promise<{
    current: number
    previous: number
    growth: number
    byModule: {
      spbu: { current: number; previous: number; growth: number }
      gas: { current: number; previous: number; growth: number }
      oli: { current: number; previous: number; growth: number }
      snb: { current: number; previous: number; growth: number }
    }
  }> {
    const response = await this.client.get<{ data: any }>(
      `${this.endpoint}/revenue/comparison?period=${period}`
    )
    return response.data.data || response.data
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<Array<{
    id: string
    type: 'transaction' | 'restock' | 'adjustment' | 'alert'
    description: string
    timestamp: string
    user?: string
  }>> {
    const response = await this.client.get<{ data: any[] }>(
      `${this.endpoint}/activities/recent?limit=${limit}`
    )
    return response.data.data || response.data
  }

  /**
   * Get quick stats
   */
  async getQuickStats(): Promise<{
    todaySales: number
    todayTransactions: number
    activeCustomers: number
    lowStockItems: number
    pendingOrders: number
  }> {
    const response = await this.client.get<{ data: any }>(
      `${this.endpoint}/quick-stats`
    )
    return response.data.data || response.data
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    period: 'week' | 'month' = 'month'
  ): Promise<{
    averageTransaction: number
    peakHour: number
    busierDay: string
    conversionRate: number
    customerRetention: number
  }> {
    const response = await this.client.get<{ data: any }>(
      `${this.endpoint}/performance/metrics?period=${period}`
    )
    return response.data.data || response.data
  }
}

/**
 * Singleton instance
 */
export const dashboardService = new DashboardService()
