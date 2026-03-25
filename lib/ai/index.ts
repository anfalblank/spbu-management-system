/**
 * AI Module Barrel Export
 * Centralized export of AI-powered features
 */

// Prediction utilities and types
export {
  predictStockDepletion,
  predictSales,
  detectAnomalies,
  generateRecommendations,
} from './predictions'

export type {
  StockPrediction,
  SalesPrediction,
  Anomaly,
  Recommendation,
} from './predictions'

// AI Service
export {
  aiService,
  useAIMonitoring,
} from './ai-service'

export type {
  AIMonitoringData,
} from './ai-service'
