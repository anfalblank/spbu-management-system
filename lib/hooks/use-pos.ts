/**
 * POS Hook
 * Handles all POS-related API calls with loading and error states
 */

'use client'

import { useCallback } from 'react'
import { posService } from '@/lib/api'
import type {
  Transaction,
  CreateTransactionRequest,
  TransactionResponse,
  DailySalesSummary,
  PaymentMethod,
} from '@/lib/api'
import { useApi, useApiLazy } from './use-api'

/**
 * Hook for creating a transaction
 */
export function useCreateTransaction() {
  const { execute, isLoading, isError, error } = useApiLazy<TransactionResponse>(
    (request: CreateTransactionRequest) => posService.createTransaction(request)
  )

  const create = useCallback(async (
    request: CreateTransactionRequest
  ): Promise<TransactionResponse> => {
    const result = await execute()
    return result ?? { id: '', status: 'failed', error: 'Unknown error' }
  }, [execute])

  return {
    create,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for fetching a transaction by ID
 */
export function useTransaction(id: string) {
  return useApi<Transaction>(
    () => posService.getTransaction(id),
    { enabled: !!id }
  )
}

/**
 * Hook for fetching transactions with pagination
 */
export function useTransactions(params?: {
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  cashierId?: string
  paymentMethod?: PaymentMethod
}) {
  return useApi(
    () => posService.getTransactions(params),
    { enabled: true }
  )
}

/**
 * Hook for fetching today's sales summary
 */
export function useTodaySalesSummary() {
  return useApi<DailySalesSummary>(
    () => posService.getTodaySalesSummary(),
    { enabled: true }
  )
}

/**
 * Hook for cancelling a transaction
 */
export function useCancelTransaction() {
  const { execute, isLoading, isError, error } = useApiLazy<void>(
    ({ id, reason }: { id: string; reason: string }) =>
      posService.cancelTransaction(id, reason)
  )

  const cancel = useCallback(async (id: string, reason: string): Promise<void> => {
    return execute()
  }, [execute])

  return {
    cancel,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for refunding a transaction
 */
export function useRefundTransaction() {
  const { execute, isLoading, isError, error } = useApiLazy<Transaction>(
    ({ id, reason, items }: { id: string; reason: string; items?: Array<{ productId: string; quantity: number }> }) =>
      posService.refundTransaction(id, reason, items)
  )

  const refund = useCallback(async (
    id: string,
    reason: string,
    items?: Array<{ productId: string; quantity: number }>
  ): Promise<Transaction | null> => {
    return execute()
  }, [execute])

  return {
    refund,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for validating discount code
 */
export function useValidateDiscount() {
  const { execute, isLoading, isError, error } = useApiLazy(
    (code: string) => posService.validateDiscountCode(code)
  )

  const validate = useCallback(async (code: string) => {
    return execute()
  }, [execute])

  return {
    validate,
    isLoading,
    isError,
    error,
  }
}

/**
 * Hook for submitting shift settlement
 */
export function useSubmitShiftSettlement() {
  const { execute, isLoading, isError, error } = useApiLazy(
    (request: {
      cashierId: string
      shiftStart: string
      shiftEnd: string
      openingBalance: number
      expectedAmount: number
      actualAmount: number
      notes?: string
    }) => posService.submitShiftSettlement(request)
  )

  const submit = useCallback(async (request: {
    cashierId: string
    shiftStart: string
    shiftEnd: string
    openingBalance: number
    expectedAmount: number
    actualAmount: number
    notes?: string
  }) => {
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
  cashierId?: string
  startDate?: string
  endDate?: string
}) {
  return useApi(
    () => posService.getShiftSettlements(params),
    { enabled: true }
  )
}

/**
 * Hook for getting receipt
 */
export function useReceipt(transactionId: string) {
  return useApi(
    () => posService.getReceipt(transactionId),
    { enabled: !!transactionId }
  )
}

/**
 * Hook for sending receipt
 */
export function useSendReceipt() {
  const { execute, isLoading, isError, error } = useApiLazy<void>(
    ({ transactionId, method, destination }: {
      transactionId: string
      method: 'email' | 'whatsapp'
      destination: string
    }) => posService.sendReceipt(transactionId, method, destination)
  )

  const send = useCallback(async (
    transactionId: string,
    method: 'email' | 'whatsapp',
    destination: string
  ): Promise<void> => {
    return execute()
  }, [execute])

  return {
    send,
    isLoading,
    isError,
    error,
  }
}
