/**
 * Hooks Barrel Export
 * Centralized export of all custom hooks
 */

// Base hooks
export { useApi, useApiLazy, useApiPaginated } from './use-api'
export type { UseApiState, UseApiOptions } from './use-api'

// Dashboard hooks
export {
  useKPIs,
  useSalesData,
  useSalesPerModule,
  useSalesPredictions,
  useStockPredictions,
  useNotifications,
  useNotificationCount,
  useHourlySales,
  useTopProducts,
  useLowStockProducts,
  useRevenueComparison,
  useRecentActivities,
  useQuickStats,
  usePerformanceMetrics,
} from './use-dashboard'

// Product hooks
export {
  useProducts,
  useProduct,
  useProductsByModule,
  useProductSearch,
  useLowStockProducts as useLowStockProductsProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateStock,
  useProductCategories,
} from './use-products'

// POS hooks
export {
  useCreateTransaction,
  useTransaction,
  useTransactions,
  useTodaySalesSummary,
  useCancelTransaction,
  useRefundTransaction,
  useValidateDiscount,
  useSubmitShiftSettlement as useSubmitPosShiftSettlement,
  useShiftSettlements,
  useReceipt,
  useSendReceipt,
} from './use-pos'

// SPBU hooks
export {
  useDispensers,
  useDispenser,
  useUpdateDispenserStatus,
  useTanks,
  useTank,
  useFuelStock,
  useSubmitShiftSettlement,
  useShiftSettlements as useSPBUShiftSettlements,
  useSalesReport,
  useDailySummary,
  useRecordDelivery,
  useDeliveryHistory,
} from './use-spbu'

// LPG hooks
export {
  useSalesAgreements,
  useSalesAgreement,
  useCreateSalesAgreement,
  useUpdateSalesAgreementStatus,
  useDistributions,
  useCreateDistribution,
  useUpdateDistributionStatus,
  useAgreementDistributions,
  useLPGAnalytics,
  useQuotaRealizationReport,
  useLPGProducts,
  useCreateLPGProduct,
  useLPGOrders,
  useCreateLPGOrder,
  useLPGSalesReport,
} from './use-lpg'
