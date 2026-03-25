/**
 * SPBU Hook
 * Handles all SPBU-related API calls with loading and error states
 */

'use client'

import { useCallback } from 'react'
import { spbuService } from '@/lib/api'
import type { Dispenser, Tank, ShiftSettlement, FuelStock, SPBUSalesReport } from '@/lib/api'
import { useApi, useApiLazy } from './use-api'

/**
 * Hook for fetching all dispensers
 */
export function useDispensers() {
  return useApi<Dispenser[]>(
    () => spbuService.getDispensers(),
    { enabled: true }
  )
}

/**
 * Hook for fetching a single dispenser
 */
export function useDispenser(id: string) {
  return useApi<Dispenser>(
    () => spbuService.getDispenser(id),
    { enabled: !!id }
  )
}

/**
 * Hook for updating dispenser status
 */
export function useUpdateDispenserStatus() {
  const { execute, isLoading, isError, error } = useApiLazy<Dispenser>(
    ({ id, status }: { id: string; status: Dispenser['status'] }) =>
      spbuService.updateDispenserStatus(id, status)
  )

  const updateStatus = useCallback(async (id: string, status: Dispenser['status']): Promise<Dispenser | null> => {
    return execute()
  }, [execute])

  return {
    updateStatus,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for fetching all tanks
 */
export function useTanks() {
  return useApi<Tank[]>(
    () => spbuService.getTanks(),
    { enabled: true }
  )
}

/**
 * Hook for fetching a single tank
 */
export function useTank(id: string) {
  return useApi<Tank>(
    () => spbuService.getTank(id),
    { enabled: !!id }
  )
}

/**
 * Hook for fetching fuel stock
 */
export function useFuelStock() {
  return useApi<FuelStock[]>(
    () => spbuService.getFuelStock(),
    { enabled: true }
  )
}

/**
 * Hook for submitting shift settlement
 */
export function useSubmitShiftSettlement() {
  const { execute, isLoading, isError, error } = useApiLazy<ShiftSettlement>(
    (data: {
      dispenserId: string
      openingMeter: number
      closingMeter: number
      shift: string
      cashier: string
    }) => spbuService.submitShiftSettlement(data)
  )

  const submit = useCallback(async (data: {
    dispenserId: string
    openingMeter: number
    closingMeter: number
    shift: string
    cashier: string
  }): Promise<ShiftSettlement | null> => {
    return execute()
  }, [execute])

  return {
    submit,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for fetching shift settlements
 */
export function useShiftSettlements(params?: {
  page?: number
  pageSize?: number
  dispenserId?: string
  cashier?: string
  startDate?: string
  endDate?: string
}) {
  return useApi(
    () => spbuService.getShiftSettlements(params),
    { enabled: true }
  )
}

/**
 * Hook for fetching sales report
 */
export function useSalesReport(params: {
  startDate: string
  endDate: string
  product?: string
}) {
  return useApi<SPBUSalesReport[]>(
    () => spbuService.getSalesReport(params),
    { enabled: !!params.startDate && !!params.endDate }
  )
}

/**
 * Hook for fetching daily summary
 */
export function useDailySummary(date?: string) {
  return useApi(
    () => spbuService.getDailySummary(date),
    { enabled: true }
  )
}

/**
 * Hook for recording fuel delivery
 */
export function useRecordDelivery() {
  const { execute, isLoading, isError, error } = useApiLazy<void>(
    (data: {
      tankId: string
      volume: number
      supplier: string
      deliveryNote: string
    }) => spbuService.recordDelivery(data)
  )

  const record = useCallback(async (data: {
    tankId: string
    volume: number
    supplier: string
    deliveryNote: string
  }): Promise<void> => {
    return execute()
  }, [execute])

  return {
    record,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for fetching delivery history
 */
export function useDeliveryHistory(params?: {
  tankId?: string
  startDate?: string
  endDate?: string
}) {
  return useApi(
    () => spbuService.getDeliveryHistory(params),
    { enabled: true }
  )
}
