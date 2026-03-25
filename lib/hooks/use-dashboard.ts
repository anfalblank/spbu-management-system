/**
 * Dashboard Hook
 * Handles all dashboard-related API calls with loading and error states
 */

'use client'

import { useCallback } from 'react'
import { dashboardService } from '@/lib/api'
import type { KPIData, SalesData, SalesPrediction, StockPrediction, Notification } from '@/lib/api'
import { useApi, useApiLazy } from './use-api'

/**
 * Hook for fetching KPI data
 */
export function useKPIs(period: 'today' | 'week' | 'month' = 'today') {
  return useApi<KPIData>(
    () => dashboardService.getKPIs(period),
    { enabled: !!period }
  )
}

/**
 * Hook for fetching sales data
 */
export function useSalesData(period: 'today' | 'week' | 'month' = 'week') {
  return useApi<SalesData[]>(
    () => dashboardService.getSalesData(period),
    { enabled: !!period }
  )
}

/**
 * Hook for fetching sales per module
 */
export function useSalesPerModule(period: 'today' | 'week' | 'month' = 'today') {
  return useApi(
    () => dashboardService.getSalesPerModule(period),
    { enabled: !!period }
  )
}

/**
 * Hook for fetching sales predictions
 */
export function useSalesPredictions(days: number = 14) {
  return useApi<SalesPrediction[]>(
    () => dashboardService.getSalesPredictions(days),
    { enabled: true }
  )
}

/**
 * Hook for fetching stock predictions
 */
export function useStockPredictions() {
  return useApi<StockPrediction[]>(
    () => dashboardService.getStockPredictions(),
    { enabled: true }
  )
}

/**
 * Hook for fetching notifications
 */
export function useNotifications(unreadOnly = false) {
  const { data, isLoading, isError, error, refetch } = useApi<Notification[]>(
    () => dashboardService.getNotifications(unreadOnly),
    { enabled: true }
  )

  const markAsRead = useCallback(async (id: string) => {
    await dashboardService.markNotificationRead(id)
    refetch()
  }, [refetch])

  const markAllAsRead = useCallback(async () => {
    await dashboardService.markAllNotificationsRead()
    refetch()
  }, [refetch])

  return {
    notifications: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  }
}

/**
 * Hook for fetching notification count
 */
export function useNotificationCount() {
  return useApi(
    () => dashboardService.getNotificationCount(),
    { enabled: true }
  )
}

/**
 * Hook for fetching hourly sales
 */
export function useHourlySales() {
  return useApi(
    () => dashboardService.getHourlySales(),
    { enabled: true }
  )
}

/**
 * Hook for fetching top products
 */
export function useTopProducts(
  period: 'today' | 'week' | 'month' = 'week',
  limit: number = 10
) {
  return useApi(
    () => dashboardService.getTopProducts(period, limit),
    { enabled: true }
  )
}

/**
 * Hook for fetching low stock products
 */
export function useLowStockProducts() {
  return useApi(
    () => dashboardService.getLowStockProducts(),
    { enabled: true }
  )
}

/**
 * Hook for fetching revenue comparison
 */
export function useRevenueComparison(period: 'week' | 'month' = 'month') {
  return useApi(
    () => dashboardService.getRevenueComparison(period),
    { enabled: true }
  )
}

/**
 * Hook for fetching recent activities
 */
export function useRecentActivities(limit: number = 10) {
  return useApi(
    () => dashboardService.getRecentActivities(limit),
    { enabled: true }
  )
}

/**
 * Hook for fetching quick stats
 */
export function useQuickStats() {
  return useApi(
    () => dashboardService.getQuickStats(),
    { enabled: true }
  )
}

/**
 * Hook for lazy loading performance metrics
 */
export function usePerformanceMetrics(period: 'week' | 'month' = 'month') {
  return useApiLazy(
    () => dashboardService.getPerformanceMetrics(period)
  )
}
