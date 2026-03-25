/**
 * Stock Store
 * Manages stock alerts and warehouse selection
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StockAlert, Warehouse, StockState, StockAlertLevel } from './types'

interface StockActions {
  // Alert management
  setAlerts: (alerts: StockAlert[]) => void
  addAlert: (alert: StockAlert) => void
  removeAlert: (id: string) => void
  acknowledgeAlert: (id: string) => void
  acknowledgeAllAlerts: () => void
  clearAlerts: () => void

  // Warehouse management
  setWarehouses: (warehouses: Warehouse[]) => void
  setSelectedWarehouse: (warehouseId: string | null) => void
  addWarehouse: (warehouse: Warehouse) => void
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void
  removeWarehouse: (id: string) => void

  // Threshold management
  setThresholds: (thresholds: Partial<StockState['alertThresholds']>) => void
  setThreshold: (level: StockAlertLevel, value: number) => void

  // Sync management
  setLastSync: (timestamp: string) => void
  setAutoRefresh: (enabled: boolean) => void
  syncAlerts: () => Promise<void>

  // Computed
  getCriticalAlerts: () => StockAlert[]
  getAlertsByWarehouse: (warehouseId: string) => StockAlert[]
  getAlertCount: () => { critical: number; low: number; warning: number; total: number }
}

interface StockStore extends StockState, StockActions {}

/**
 * Default stock state
 */
const defaultState: StockState = {
  alerts: [],
  selectedWarehouse: null,
  warehouses: [],
  alertThresholds: {
    critical: 10, // 10% remaining
    low: 25, // 25% remaining
    warning: 50, // 50% remaining
  },
  lastSync: null,
  autoRefreshEnabled: true,
}

/**
 * Create stock store with persistence
 */
export const useStockStore = create<StockStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Alert management
      setAlerts: (alerts) => {
        set({ alerts })
      },

      addAlert: (alert) => {
        set((state) => {
          const exists = state.alerts.find((a) => a.id === alert.id)
          if (exists) {
            return {
              alerts: state.alerts.map((a) => (a.id === alert.id ? alert : a)),
            }
          }
          return { alerts: [alert, ...state.alerts] }
        })
      },

      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }))
      },

      acknowledgeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true } : a
          ),
        }))
      },

      acknowledgeAllAlerts: () => {
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, acknowledged: true })),
        }))
      },

      clearAlerts: () => {
        set({ alerts: [] })
      },

      // Warehouse management
      setWarehouses: (warehouses) => {
        set({ warehouses })

        // Set selected warehouse if not set
        const state = get()
        if (!state.selectedWarehouse && warehouses.length > 0) {
          set({ selectedWarehouse: warehouses[0].id })
        }
      },

      setSelectedWarehouse: (warehouseId) => {
        set({ selectedWarehouse: warehouseId })
      },

      addWarehouse: (warehouse) => {
        set((state) => ({
          warehouses: [...state.warehouses, warehouse],
        }))
      },

      updateWarehouse: (id, updates) => {
        set((state) => ({
          warehouses: state.warehouses.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }))
      },

      removeWarehouse: (id) => {
        set((state) => ({
          warehouses: state.warehouses.filter((w) => w.id !== id),
          selectedWarehouse:
            state.selectedWarehouse === id ? null : state.selectedWarehouse,
        }))
      },

      // Threshold management
      setThresholds: (thresholds) => {
        set((state) => ({
          alertThresholds: { ...state.alertThresholds, ...thresholds },
        }))
      },

      setThreshold: (level, value) => {
        set((state) => ({
          alertThresholds: { ...state.alertThresholds, [level]: value },
        }))
      },

      // Sync management
      setLastSync: (timestamp) => {
        set({ lastSync: timestamp })
      },

      setAutoRefresh: (enabled) => {
        set({ autoRefreshEnabled: enabled })
      },

      syncAlerts: async () => {
        try {
          // TODO: Fetch alerts from API
          // const alerts = await stockApi.getAlerts()
          // get().setAlerts(alerts)

          set({ lastSync: new Date().toISOString() })
        } catch (error) {
          console.error('Failed to sync stock alerts:', error)
        }
      },

      // Computed
      getCriticalAlerts: () => {
        return get().alerts.filter((a) => a.level === 'critical' && !a.acknowledged)
      },

      getAlertsByWarehouse: (warehouseId) => {
        return get().alerts.filter((a) => a.warehouseId === warehouseId)
      },

      getAlertCount: () => {
        const alerts = get().alerts.filter((a) => !a.acknowledged)
        return {
          critical: alerts.filter((a) => a.level === 'critical').length,
          low: alerts.filter((a) => a.level === 'low').length,
          warning: alerts.filter((a) => a.level === 'warning').length,
          total: alerts.length,
        }
      },
    }),
    {
      name: 'stock-storage',
      partialize: (state) => ({
        selectedWarehouse: state.selectedWarehouse,
        alertThresholds: state.alertThresholds,
        autoRefreshEnabled: state.autoRefreshEnabled,
        // Don't persist alerts and warehouses - fetch from API
        alerts: [],
        warehouses: [],
        lastSync: null,
      }),
    }
  )
)

// Selectors for optimized reads
export const selectStockAlerts = (state: StockStore) => state.alerts
export const selectSelectedWarehouse = (state: StockStore) => state.selectedWarehouse
export const selectWarehouses = (state: StockStore) => state.warehouses
export const selectUnacknowledgedAlerts = (state: StockStore) =>
  state.alerts.filter((a) => !a.acknowledged)

/**
 * Hook to get stock alerts
 */
export const useStockAlerts = () => {
  const alerts = useStockStore((state) => state.alerts)
  const acknowledgeAlert = useStockStore((state) => state.acknowledgeAlert)
  const acknowledgeAllAlerts = useStockStore((state) => state.acknowledgeAllAlerts)
  const clearAlerts = useStockStore((state) => state.clearAlerts)

  const unacknowledged = alerts.filter((a) => !a.acknowledged)
  const criticalAlerts = unacknowledged.filter((a) => a.level === 'critical')

  return {
    alerts,
    unacknowledged,
    criticalAlerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    clearAlerts,
    hasCriticalAlerts: criticalAlerts.length > 0,
  }
}

/**
 * Hook to get warehouse state
 */
export const useWarehouseState = () => {
  const warehouses = useStockStore((state) => state.warehouses)
  const selectedWarehouse = useStockStore((state) => state.selectedWarehouse)
  const setSelectedWarehouse = useStockStore((state) => state.setSelectedWarehouse)

  const selectedWarehouseData = warehouses.find((w) => w.id === selectedWarehouse)

  return {
    warehouses,
    selectedWarehouse,
    selectedWarehouseData,
    setSelectedWarehouse,
  }
}

/**
 * Hook to get alert thresholds
 */
export const useAlertThresholds = () => {
  const thresholds = useStockStore((state) => state.alertThresholds)
  const setThresholds = useStockStore((state) => state.setThresholds)
  const setThreshold = useStockStore((state) => state.setThreshold)

  return {
    thresholds,
    setThresholds,
    setThreshold,
  }
}

/**
 * Hook to get alert summary
 */
export const useAlertSummary = () => {
  const alerts = useStockStore((state) => state.alerts)
  const getAlertCount = useStockStore((state) => state.getAlertCount)

  const count = getAlertCount()

  return {
    ...count,
    hasAlerts: count.total > 0,
    hasCriticalAlerts: count.critical > 0,
  }
}
