/**
 * Dashboard Store
 * Manages UI-level dashboard state only
 * IMPORTANT: Does NOT duplicate API data - use React Query hooks for data fetching
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DashboardState } from './types'

interface DashboardActions {
  setPeriod: (period: DashboardState['period']) => void
  setCustomDateRange: (startDate: string, endDate: string) => void
  setModule: (module: DashboardState['module']) => void
  setActiveTab: (tab: string) => void
  togglePredictions: () => void
  setChartTimeRange: (range: DashboardState['chartTimeRange']) => void
  pinWidget: (widgetId: string) => void
  unpinWidget: (widgetId: string) => void
  setRefreshInterval: (interval: number | null) => void
  resetDashboard: () => void
}

interface DashboardStore extends DashboardState, DashboardActions {}

/**
 * Default dashboard state
 */
const defaultState: DashboardState = {
  filters: {
    period: 'today',
    module: 'all',
  },
  selectedKpiPeriod: 'today',
  activeTab: 'overview',
  showPredictions: true,
  chartTimeRange: '7d',
  pinnedWidgets: ['kpi-cards', 'sales-chart'],
  refreshInterval: null, // null = manual, number = seconds
}

/**
 * Create dashboard store with persistence
 */
export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setPeriod: (period) => {
        set((state) => ({
          filters: { ...state.filters, period },
          selectedKpiPeriod: period === 'custom' ? 'today' : period,
        }))
      },

      setCustomDateRange: (startDate, endDate) => {
        set((state) => ({
          filters: {
            ...state.filters,
            period: 'custom',
            startDate,
            endDate,
          },
        }))
      },

      setModule: (module) => {
        set((state) => ({
          filters: { ...state.filters, module },
        }))
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab })
      },

      togglePredictions: () => {
        set((state) => ({ showPredictions: !state.showPredictions }))
      },

      setChartTimeRange: (range) => {
        set({ chartTimeRange: range })
      },

      pinWidget: (widgetId) => {
        set((state) => ({
          pinnedWidgets: state.pinnedWidgets.includes(widgetId)
            ? state.pinnedWidgets
            : [...state.pinnedWidgets, widgetId],
        }))
      },

      unpinWidget: (widgetId) => {
        set((state) => ({
          pinnedWidgets: state.pinnedWidgets.filter((id) => id !== widgetId),
        }))
      },

      setRefreshInterval: (interval) => {
        set({ refreshInterval: interval })
      },

      resetDashboard: () => {
        set(defaultState)
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        filters: state.filters,
        selectedKpiPeriod: state.selectedKpiPeriod,
        activeTab: state.activeTab,
        showPredictions: state.showPredictions,
        chartTimeRange: state.chartTimeRange,
        pinnedWidgets: state.pinnedWidgets,
        // Don't persist refresh interval
        refreshInterval: null,
      }),
    }
  )
)

// Selectors for optimized reads
export const selectDashboardFilters = (state: DashboardStore) => state.filters
export const selectDashboardPeriod = (state: DashboardStore) => state.filters.period
export const selectDashboardModule = (state: DashboardStore) => state.filters.module
export const selectShowPredictions = (state: DashboardStore) => state.showPredictions
export const selectChartTimeRange = (state: DashboardStore) => state.chartTimeRange
export const selectPinnedWidgets = (state: DashboardStore) => state.pinnedWidgets

/**
 * Hook to get dashboard filters
 */
export const useDashboardFilters = () => {
  const filters = useDashboardStore((state) => state.filters)
  const setPeriod = useDashboardStore((state) => state.setPeriod)
  const setCustomDateRange = useDashboardStore((state) => state.setCustomDateRange)
  const setModule = useDashboardStore((state) => state.setModule)

  return {
    ...filters,
    setPeriod,
    setCustomDateRange,
    setModule,
  }
}

/**
 * Hook to get chart settings
 */
export const useChartSettings = () => {
  const chartTimeRange = useDashboardStore((state) => state.chartTimeRange)
  const showPredictions = useDashboardStore((state) => state.showPredictions)
  const setChartTimeRange = useDashboardStore((state) => state.setChartTimeRange)
  const togglePredictions = useDashboardStore((state) => state.togglePredictions)

  return {
    chartTimeRange,
    showPredictions,
    setChartTimeRange,
    togglePredictions,
  }
}

/**
 * Hook to get widget layout
 */
export const useWidgetLayout = () => {
  const pinnedWidgets = useDashboardStore((state) => state.pinnedWidgets)
  const pinWidget = useDashboardStore((state) => state.pinWidget)
  const unpinWidget = useDashboardStore((state) => state.unpinWidget)

  return {
    pinnedWidgets,
    isPinned: (widgetId: string) => pinnedWidgets.includes(widgetId),
    pinWidget,
    unpinWidget,
  }
}

/**
 * Hook to get active tab
 */
export const useDashboardTab = () => {
  const activeTab = useDashboardStore((state) => state.activeTab)
  const setActiveTab = useDashboardStore((state) => state.setActiveTab)

  return {
    activeTab,
    setActiveTab,
  }
}
