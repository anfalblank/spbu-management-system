/**
 * AI Prediction Engine
 * Provides machine learning-based predictions for stock and sales forecasting
 */

import { usePOSStore } from '@/store'
import { useSPBUStore } from '@/store'
import { useLPGStore } from '@/store'
import type { FuelType, LPGProductType } from '@/store'

// Types for predictions
export interface StockPrediction {
  itemId: string
  itemName: string
  currentStock: number
  dailyUsageRate: number
  predictedDaysRemaining: number
  predictedDepletionDate: Date
  confidence: number // 0-1
  trend: 'increasing' | 'stable' | 'decreasing'
  recommendation: string
}

export interface SalesPrediction {
  date: string
  predictedRevenue: number
  predictedVolume: number
  confidence: number
  breakdown: {
    module: string
    amount: number
  }[]
}

export interface Anomaly {
  id: string
  type: 'sales_spike' | 'sales_drop' | 'high_selisih' | 'unusual_pattern' | 'stock_critical'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  detectedAt: string
  metadata: Record<string, any>
  suggestedAction: string
}

export interface Recommendation {
  id: string
  type: 'restock' | 'shift_optimization' | 'product_focus' | 'quota_adjustment'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  expectedImpact: string
  actionable: boolean
}

/**
 * Calculate stock depletion prediction using linear regression
 */
export function predictStockDepletion(
  itemId: string,
  itemName: string,
  currentStock: number,
  salesHistory: { date: string; quantity: number }[]
): StockPrediction {
  // Use last 7-30 days of sales data
  const recentSales = salesHistory.slice(-30)

  if (recentSales.length < 3) {
    return {
      itemId,
      itemName,
      currentStock,
      dailyUsageRate: 0,
      predictedDaysRemaining: Infinity,
      predictedDepletionDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      confidence: 0,
      trend: 'stable',
      recommendation: 'Insufficient data for prediction'
    }
  }

  // Calculate daily usage rate (weighted average - recent days have higher weight)
  let weightedSum = 0
  let weightTotal = 0

  recentSales.forEach((sale, index) => {
    const weight = (index + 1) / recentSales.length // Linear weight increase
    weightedSum += sale.quantity * weight
    weightTotal += weight
  })

  const dailyUsageRate = weightedSum / weightTotal

  // Calculate trend
  const firstHalfAvg = recentSales.slice(0, Math.floor(recentSales.length / 2))
    .reduce((sum, s) => sum + s.quantity, 0) / Math.floor(recentSales.length / 2)
  const secondHalfAvg = recentSales.slice(Math.floor(recentSales.length / 2))
    .reduce((sum, s) => sum + s.quantity, 0) / Math.ceil(recentSales.length / 2)

  let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
  if (secondHalfAvg > firstHalfAvg * 1.2) trend = 'increasing'
  else if (secondHalfAvg < firstHalfAvg * 0.8) trend = 'decreasing'

  // Adjust prediction based on trend
  let adjustedDailyRate = dailyUsageRate
  if (trend === 'increasing') adjustedDailyRate *= 1.1
  if (trend === 'decreasing') adjustedDailyRate *= 0.9

  // Calculate days remaining
  const daysRemaining = adjustedDailyRate > 0 ? Math.floor(currentStock / adjustedDailyRate) : Infinity
  const predictedDepletionDate = daysRemaining !== Infinity
    ? new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

  // Calculate confidence based on data consistency
  const variance = calculateVariance(recentSales.map(s => s.quantity))
  const mean = recentSales.reduce((sum, s) => sum + s.quantity, 0) / recentSales.length
  const coefficientOfVariation = mean > 0 ? variance / mean : 0
  const confidence = Math.max(0, Math.min(1, 1 - coefficientOfVariation))

  // Generate recommendation
  let recommendation = 'Stock level is healthy'
  if (daysRemaining <= 3) {
    recommendation = 'CRITICAL: Restock immediately! Stock will be depleted in less than 3 days.'
  } else if (daysRemaining <= 7) {
    recommendation = 'URGENT: Plan restock within the next week.'
  } else if (daysRemaining <= 14) {
    recommendation = 'Warning: Consider placing a restock order soon.'
  } else if (trend === 'increasing' && daysRemaining <= 21) {
    recommendation = 'Note: Sales are trending up. Consider restocking earlier than predicted.'
  }

  return {
    itemId,
    itemName,
    currentStock,
    dailyUsageRate: Math.round(adjustedDailyRate * 100) / 100,
    predictedDaysRemaining: daysRemaining,
    predictedDepletionDate,
    confidence: Math.round(confidence * 100) / 100,
    trend,
    recommendation
  }
}

/**
 * Predict tomorrow's sales using moving average and trend analysis
 */
export function predictSales(
  historicalSales: { date: string; revenue: number; volume: number }[]
): SalesPrediction {
  const last7Days = historicalSales.slice(-7)
  const last30Days = historicalSales.slice(-30)

  if (last7Days.length < 3) {
    return {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      predictedRevenue: 0,
      predictedVolume: 0,
      confidence: 0,
      breakdown: []
    }
  }

  // Calculate weighted average (more weight on recent days)
  let weightedRevenue = 0
  let weightedVolume = 0
  let weightTotal = 0

  last7Days.forEach((sale, index) => {
    const weight = (index + 1) / last7Days.length
    weightedRevenue += sale.revenue * weight
    weightedVolume += sale.volume * weight
    weightTotal += weight
  })

  const avgRevenue = weightedRevenue / weightTotal
  const avgVolume = weightedVolume / weightTotal

  // Detect day-of-week patterns
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const tomorrowDayOfWeek = tomorrow.getDay()

  const sameDaySales = historicalSales.filter(s => {
    const saleDate = new Date(s.date)
    return saleDate.getDay() === tomorrowDayOfWeek
  })

  let dayOfWeekMultiplier = 1
  if (sameDaySales.length >= 4) {
    const sameDayAvg = sameDaySales.reduce((sum, s) => sum + s.revenue, 0) / sameDaySales.length
    dayOfWeekMultiplier = sameDayAvg / avgRevenue
  }

  // Apply trend adjustment
  const trend = calculateTrend(last30Days)
  const trendMultiplier = 1 + trend

  const predictedRevenue = avgRevenue * dayOfWeekMultiplier * trendMultiplier
  const predictedVolume = avgVolume * dayOfWeekMultiplier * trendMultiplier

  // Calculate confidence
  const revenueVariance = calculateVariance(last7Days.map(s => s.revenue))
  const revenueMean = last7Days.reduce((sum, s) => sum + s.revenue, 0) / last7Days.length
  const confidence = Math.max(0.3, Math.min(0.95, 1 - (revenueVariance / revenueMean) * 0.5))

  return {
    date: tomorrow.toISOString().split('T')[0],
    predictedRevenue: Math.round(predictedRevenue),
    predictedVolume: Math.round(predictedVolume),
    confidence: Math.round(confidence * 100) / 100,
    breakdown: [
      { module: 'SPBU', amount: predictedRevenue * 0.5 },
      { module: 'LPG', amount: predictedRevenue * 0.2 },
      { module: 'OLI', amount: predictedRevenue * 0.15 },
      { module: 'SnB', amount: predictedRevenue * 0.15 }
    ]
  }
}

/**
 * Detect anomalies in sales and transaction patterns
 */
export function detectAnomalies(
  salesHistory: { date: string; revenue: number; volume: number }[],
  currentShiftData?: {
    nozzleData: Array<{ nozzleNumber: number; systemVolume: number; actualVolume: number }>
  },
  stockData?: Array<{ id: string; name: string; currentStock: number; minStock: number }>
): Anomaly[] {
  const anomalies: Anomaly[] = []
  const today = new Date().toISOString().split('T')[0]

  // Detect sales spike or drop
  if (salesHistory.length >= 7) {
    const recentSales = salesHistory.slice(-7)
    const avgRevenue = recentSales.reduce((sum, s) => sum + s.revenue, 0) / recentSales.length
    const stdDev = Math.sqrt(
      recentSales.reduce((sum, s) => sum + Math.pow(s.revenue - avgRevenue, 2), 0) / recentSales.length
    )

    const yesterday = salesHistory[salesHistory.length - 2]
    const todaySales = salesHistory[salesHistory.length - 1]

    if (todaySales && stdDev > 0) {
      const zScore = (todaySales.revenue - avgRevenue) / stdDev

      if (zScore > 2.5) {
        anomalies.push({
          id: `sales-spike-${Date.now()}`,
          type: 'sales_spike',
          severity: zScore > 3.5 ? 'high' : 'medium',
          title: 'Unusual Sales Spike Detected',
          description: `Today's sales (${formatCurrency(todaySales.revenue)}) are ${zScore.toFixed(1)}σ above average`,
          detectedAt: today,
          metadata: { zScore, todayRevenue: todaySales.revenue, averageRevenue: avgRevenue },
          suggestedAction: 'Verify if this is due to a promotion or special event. Consider increasing stock if trend continues.'
        })
      } else if (zScore < -2.5) {
        anomalies.push({
          id: `sales-drop-${Date.now()}`,
          type: 'sales_drop',
          severity: zScore < -3.5 ? 'high' : 'medium',
          title: 'Unusual Sales Drop Detected',
          description: `Today's sales (${formatCurrency(todaySales.revenue)}) are ${Math.abs(zScore).toFixed(1)}σ below average`,
          detectedAt: today,
          metadata: { zScore, todayRevenue: todaySales.revenue, averageRevenue: avgRevenue },
          suggestedAction: 'Investigate potential causes: competition, pricing issues, or operational problems.'
        })
      }
    }
  }

  // Detect high selisih in SPBU
  if (currentShiftData && currentShiftData.nozzleData) {
    currentShiftData.nozzleData.forEach(nozzle => {
      const selisih = Math.abs(nozzle.actualVolume - nozzle.systemVolume)
      const selisihPercentage = nozzle.systemVolume > 0
        ? (selisih / nozzle.systemVolume) * 100
        : 0

      if (selisihPercentage > 5) {
        anomalies.push({
          id: `selisih-${nozzle.nozzleNumber}-${Date.now()}`,
          type: 'high_selisih',
          severity: selisihPercentage > 10 ? 'critical' : selisihPercentage > 7 ? 'high' : 'medium',
          title: `High Selisih Detected - Nozzle ${nozzle.nozzleNumber}`,
          description: `Selisih of ${selisihPercentage.toFixed(1)}% detected (${selisah.toFixed(2)} liters)`,
          detectedAt: today,
          metadata: {
            nozzleNumber: nozzle.nozzleNumber,
            systemVolume: nozzle.systemVolume,
            actualVolume: nozzle.actualVolume,
            selisih,
            selisihPercentage
          },
          suggestedAction: 'Investigate immediately: check for leaks, calibration issues, or theft.'
        })
      }
    })
  }

  // Detect critical stock levels
  if (stockData) {
    stockData.forEach(item => {
      if (item.currentStock <= item.minStock * 0.5) {
        anomalies.push({
          id: `stock-critical-${item.id}`,
          type: 'stock_critical',
          severity: 'critical',
          title: `Critical Stock Level - ${item.name}`,
          description: `Stock (${item.currentStock}) is below 50% of minimum threshold (${item.minStock})`,
          detectedAt: today,
          metadata: {
            itemId: item.id,
            itemName: item.name,
            currentStock: item.currentStock,
            minStock: item.minStock,
            percentage: (item.currentStock / item.minStock) * 100
          },
          suggestedAction: 'URGENT: Place restock order immediately. Consider emergency procurement.'
        })
      } else if (item.currentStock <= item.minStock) {
        anomalies.push({
          id: `stock-low-${item.id}`,
          type: 'stock_critical',
          severity: 'medium',
          title: `Low Stock Level - ${item.name}`,
          description: `Stock (${item.currentStock}) is at or below minimum threshold`,
          detectedAt: today,
          metadata: {
            itemId: item.id,
            itemName: item.name,
            currentStock: item.currentStock,
            minStock: item.minStock
          },
          suggestedAction: 'Plan restock within the next few days.'
        })
      }
    })
  }

  return anomalies
}

/**
 * Generate actionable recommendations
 */
export function generateRecommendations(
  stockPredictions: StockPrediction[],
  salesData: { date: string; revenue: number; volume: number }[],
  shiftData?: { number: number; revenue: number; transactions: number }[]
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Restock recommendations based on predictions
  stockPredictions.forEach(prediction => {
    if (prediction.predictedDaysRemaining <= 7 && prediction.predictedDaysRemaining > 0) {
      recommendations.push({
        id: `restock-${prediction.itemId}`,
        type: 'restock',
        priority: prediction.predictedDaysRemaining <= 3 ? 'high' : 'medium',
        title: `Restock ${prediction.itemName}`,
        description: `${prediction.itemName} will be depleted in ${prediction.predictedDaysRemaining} days (by ${prediction.predictedDepletionDate.toLocaleDateString('id-ID')})`,
        expectedImpact: `Prevent stockout, avoid ${Math.round(prediction.dailyUsageRate * 7)} unit loss over next week`,
        actionable: true
      })
    }
  })

  // Shift optimization recommendations
  if (shiftData && shiftData.length >= 2) {
    const avgRevenue = shiftData.reduce((sum, s) => sum + s.revenue, 0) / shiftData.length
    const underperformingShifts = shiftData.filter(s => s.revenue < avgRevenue * 0.8)

    underperformingShifts.forEach(shift => {
      recommendations.push({
        id: `shift-opt-${shift.number}`,
        type: 'shift_optimization',
        priority: 'low',
        title: `Review Shift ${shift.number} Performance`,
        description: `Shift ${shift.number} revenue (${formatCurrency(shift.revenue)}) is below average`,
        expectedImpact: `Potential ${formatCurrency((avgRevenue - shift.revenue) * 30)} monthly improvement`,
        actionable: true
      })
    })
  }

  // Product focus recommendations
  if (salesData.length >= 14) {
    const last7Days = salesData.slice(-7)
    const previous7Days = salesData.slice(-14, -7)

    // Find products with significant growth
    // This would require per-product sales data - simplified version here
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// Helper functions

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
}

function calculateTrend(data: Array<{ revenue: number }>): number {
  if (data.length < 2) return 0

  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / secondHalf.length

  return (secondAvg - firstAvg) / firstAvg
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
