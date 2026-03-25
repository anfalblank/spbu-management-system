/**
 * POS Module Barrel Export
 */

// Transaction processing
export {
  processTransaction,
  validateStockBeforeTransaction,
  formatTransactionForReceipt,
  resetCartAfterTransaction,
  getLastTransaction,
  clearLastTransaction,
} from './transaction'
export type { TransactionStatus, TransactionResult, TransactionRequest } from './transaction'

// Validation
export {
  validateCartItem,
  validateCart,
  validatePaymentMethod,
  validatePaymentAmount,
  validateCheckout,
  formatValidationError,
  getValidationMessage,
} from './validation'
export type { ValidationResult } from './validation'

// Hooks
export {
  usePOSCart,
  usePOSCheckout,
  usePOSPayment,
  usePOSTransactionReceipt,
  usePOSProductActions,
} from './hooks'
