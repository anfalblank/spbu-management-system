/**
 * LPG Hook
 * Handles all LPG-related API calls with loading and error states
 */

'use client'

import { useCallback } from 'react'
import { lpgService } from '@/lib/api'
import type {
  SalesAgreement,
  CreateSalesAgreementRequest,
  Distribution,
  CreateDistributionRequest,
  LPGProduct,
  LPGOrder,
  LPGAnalytics,
} from '@/lib/api'
import { useApi, useApiLazy } from './use-api'

// ========== Sales Agreements ==========

/**
 * Hook for fetching all sales agreements
 */
export function useSalesAgreements(params?: {
  page?: number
  pageSize?: number
  status?: SalesAgreement['status']
  customerId?: string
  agentId?: string
  startDate?: string
  endDate?: string
}) {
  return useApi(
    () => lpgService.getSalesAgreements(params),
    { enabled: true }
  )
}

/**
 * Hook for fetching a single sales agreement
 */
export function useSalesAgreement(id: string) {
  return useApi<SalesAgreement>(
    () => lpgService.getSalesAgreement(id),
    { enabled: !!id }
  )
}

/**
 * Hook for creating a sales agreement
 */
export function useCreateSalesAgreement() {
  const { execute, isLoading, isError, error } = useApiLazy<SalesAgreement>(
    (request: CreateSalesAgreementRequest) => lpgService.createSalesAgreement(request)
  )

  const create = useCallback(async (request: CreateSalesAgreementRequest): Promise<SalesAgreement | null> => {
    return execute()
  }, [execute])

  return {
    create,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for updating sales agreement status
 */
export function useUpdateSalesAgreementStatus() {
  const { execute, isLoading, isError, error } = useApiLazy<SalesAgreement>(
    ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      lpgService.setSalesAgreementStatus(id, status)
  )

  const updateStatus = useCallback(async (id: string, status: 'active' | 'suspended'): Promise<SalesAgreement | null> => {
    return execute()
  }, [execute])

  return {
    updateStatus,
    isLoading,
    isError,
    error,
  }
}

// ========== Distributions ==========

/**
 * Hook for fetching distributions
 */
export function useDistributions(params?: {
  page?: number
  pageSize?: number
  agreementId?: string
  customerId?: string
  status?: Distribution['status']
  startDate?: string
  endDate?: string
}) {
  return useApi(
    () => lpgService.getDistributions(params),
    { enabled: true }
  )
}

/**
 * Hook for creating a distribution
 */
export function useCreateDistribution() {
  const { execute, isLoading, isError, error } = useApiLazy<Distribution>(
    (request: CreateDistributionRequest) => lpgService.createDistribution(request)
  )

  const create = useCallback(async (request: CreateDistributionRequest): Promise<Distribution | null> => {
    return execute()
  }, [execute])

  return {
    create,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for updating distribution status
 */
export function useUpdateDistributionStatus() {
  const { execute, isLoading, isError, error } = useApiLazy<Distribution>(
    ({ id, status }: { id: string; status: Distribution['status'] }) =>
      lpgService.updateDistributionStatus(id, status)
  )

  const updateStatus = useCallback(async (id: string, status: Distribution['status']): Promise<Distribution | null> => {
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
 * Hook for fetching distributions by agreement
 */
export function useAgreementDistributions(agreementId: string) {
  return useApi<Distribution[]>(
    () => lpgService.getAgreementDistributions(agreementId),
    { enabled: !!agreementId }
  )
}

// ========== Analytics ==========

/**
 * Hook for fetching LPG analytics
 */
export function useLPGAnalytics(params: {
  startDate: string
  endDate: string
}) {
  return useApi<LPGAnalytics>(
    () => lpgService.getAnalytics(params),
    { enabled: !!params.startDate && !!params.endDate }
  )
}

/**
 * Hook for fetching quota vs realization report
 */
export function useQuotaRealizationReport(params: {
  startDate: string
  endDate: string
}) {
  return useApi(
    () => lpgService.getQuotaRealizationReport(params),
    { enabled: !!params.startDate && !!params.endDate }
  )
}

// ========== Non-Subsidized Products ==========

/**
 * Hook for fetching LPG products (non-subsidized)
 */
export function useLPGProducts() {
  return useApi<LPGProduct[]>(
    () => lpgService.getProducts(),
    { enabled: true }
  )
}

/**
 * Hook for creating LPG product
 */
export function useCreateLPGProduct() {
  const { execute, isLoading, isError, error } = useApiLazy<LPGProduct>(
    (product: Omit<LPGProduct, 'id'>) => lpgService.createProduct(product)
  )

  const create = useCallback(async (product: Omit<LPGProduct, 'id'>): Promise<LPGProduct | null> => {
    return execute()
  }, [execute])

  return {
    create,
    isLoading,
    isError,
    error,
  }
}

// ========== Non-Subsidized Orders ==========

/**
 * Hook for fetching LPG orders
 */
export function useLPGOrders(params?: {
  page?: number
  pageSize?: number
  customerId?: string
  status?: LPGOrder['status']
  startDate?: string
  endDate?: string
}) {
  return useApi(
    () => lpgService.getOrders(params),
    { enabled: true }
  )
}

/**
 * Hook for creating LPG order
 */
export function useCreateLPGOrder() {
  const { execute, isLoading, isError, error } = useApiLazy<LPGOrder>(
    (data: { customerId: string; items: Array<{ productId: string; quantity: number }> }) =>
      lpgService.createOrder(data)
  )

  const create = useCallback(async (data: {
    customerId: string
    items: Array<{ productId: string; quantity: number }>
  }): Promise<LPGOrder | null> => {
    return execute()
  }, [execute])

  return {
    create,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for fetching LPG sales report (non-subsidized)
 */
export function useLPGSalesReport(params: {
  startDate: string
  endDate: string
}) {
  return useApi(
    () => lpgService.getSalesReport(params),
    { enabled: !!params.startDate && !!params.endDate }
  )
}
