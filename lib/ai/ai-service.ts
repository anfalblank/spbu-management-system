/**
 * AI Service
 * Provides real-time AI-powered insights for the dashboard
 */

import {
  predictStockDepletion,
  predictSales,
  detectAnomalies,
  generateRecommendations,
  type StockPrediction,
  type SalesPrediction,
  type Anomaly,
  type Recommendation,
} from './predictions'
import { usePOSStore } from '@/store'
import { useSPBUStore } from '@/store'
import { useLPGStore } from '@/store'
import { formatCurrency } from '@/lib/utils'

export interface AIMonitoringData {
  timestamp: string
  stockPredictions: StockPrediction[]
  salesPrediction: SalesPrediction
  anomalies: Anomaly[]
  recommendations: Recommendation[]
  insights: {
    overallHealth: 'excellent' | 'good' | 'warning' | 'critical'
    summary: string
    keyMetrics: {
      totalStockItems: number
      criticalStockItems: number
      activeAnomalies: number
      todayVsPrediction: number // percentage
    }
  }
}

class AIService {
  private monitoringInterval: NodeJS.Timeout | null = null
  private listeners: Set<(data: AIMonitoringData) => void> = new Set()
  private readonly POLLING_INTERVAL = 30000 // 30 seconds

  /**
   * Start real-time monitoring
   */
  startMonitoring() {
    if (this.monitoringInterval) return

    // Initial fetch
    this.fetchMonitoringData()

    // Set up polling
    this.monitoringInterval = setInterval(() => {
      this.fetchMonitoringData()
    }, this.POLLING_INTERVAL)

    console.log('🤖 AI Monitoring started')
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      console.log('🤖 AI Monitoring stopped')
    }
  }

  /**
   * Subscribe to monitoring updates
   */
  subscribe(callback: (data: AIMonitoringData) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Fetch current monitoring data and notify listeners
   */
  private async fetchMonitoringData() {
    try {
      const data = await this.generateMonitoringData()
      this.listeners.forEach(callback => callback(data))
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    }
  }

  /**
   * Public method to fetch monitoring data (returns data directly)
   */
  async getMonitoringData(): Promise<AIMonitoringData> {
    return this.generateMonitoringData()
  }

  /**
   * Generate comprehensive AI monitoring data
   */
  async generateMonitoringData(): Promise<AIMonitoringData> {
    const { transactions } = usePOSStore.getState()
    const { tanks, settlements, currentShift } = useSPBUStore.getState()
    const { products, salesAgreements, realisasi } = useLPGStore.getState()

    // Prepare sales history
    const salesHistory = this.generateMockSalesHistory()
    const today = new Date().toISOString().split('T')[0]

    // Generate stock predictions for BBM tanks
    const stockPredictions: StockPrediction[] = []

    tanks.forEach(tank => {
      const tankSalesHistory = salesHistory
        .filter(s => s.fuelType === tank.fuelType)
        .map(s => ({ date: s.date, quantity: s.volume }))

      const prediction = predictStockDepletion(
        tank.id,
        `${tank.fuelType} (Tank ${tank.number})`,
        tank.currentVolume,
        tankSalesHistory
      )
      stockPredictions.push(prediction)
    })

    // Generate stock predictions for LPG products
    products.forEach(product => {
      const productSalesHistory = salesHistory
        .filter(s => s.module === 'LPG' && s.productType === product.type)
        .map(s => ({ date: s.date, quantity: s.quantity }))

      if (productSalesHistory.length > 0) {
        const prediction = predictStockDepletion(
          product.id,
          product.name,
          product.stock,
          productSalesHistory
        )
        stockPredictions.push(prediction)
      }
    })

    // Generate sales prediction
    const salesPrediction = predictSales(
      salesHistory.map(s => ({ date: s.date, revenue: s.revenue, volume: s.volume }))
    )

    // Detect anomalies
    const currentShiftData = currentShift && settlements.find(s => s.shiftId === currentShift.id)
      ? {
          nozzleData: settlements
            .filter(s => s.shiftId === currentShift!.id)
            .flatMap(s => s.nozzleData.map(n => ({
              nozzleNumber: n.nozzleNumber,
              systemVolume: n.volume,
              actualVolume: n.volume + (Math.random() * 5 - 2.5) // Simulate slight variation
            })))
        }
      : undefined

    const stockDataForAnomalies = [
      ...tanks.map(t => ({
        id: t.id,
        name: `${t.fuelType} (Tank ${t.number})`,
        currentStock: t.currentVolume,
        minStock: t.minStock
      })),
      ...products.map(p => ({
        id: p.id,
        name: p.name,
        currentStock: p.stock,
        minStock: 50 // Default minimum
      }))
    ]

    const anomalies = detectAnomalies(
      salesHistory.map(s => ({ date: s.date, revenue: s.revenue, volume: s.volume })),
      currentShiftData,
      stockDataForAnomalies
    )

    // Generate recommendations
    const shiftData = this.generateMockShiftData()
    const recommendations = generateRecommendations(stockPredictions, salesHistory, shiftData)

    // Calculate overall health
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length
    const highAnomalies = anomalies.filter(a => a.severity === 'high').length
    const criticalStock = stockPredictions.filter(p => p.predictedDaysRemaining <= 3).length

    let overallHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent'
    if (criticalAnomalies > 0 || criticalStock > 2) {
      overallHealth = 'critical'
    } else if (highAnomalies > 2 || criticalStock > 0) {
      overallHealth = 'warning'
    } else if (anomalies.length > 0) {
      overallHealth = 'good'
    }

    // Generate summary
    const summary = this.generateSummary(overallHealth, anomalies, stockPredictions, salesPrediction)

    // Calculate key metrics
    const todaySales = salesHistory[salesHistory.length - 1]
    const todayVsPrediction = todaySales && salesPrediction.predictedRevenue > 0
      ? ((todaySales.revenue - salesPrediction.predictedRevenue) / salesPrediction.predictedRevenue) * 100
      : 0

    return {
      timestamp: new Date().toISOString(),
      stockPredictions,
      salesPrediction,
      anomalies,
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      insights: {
        overallHealth,
        summary,
        keyMetrics: {
          totalStockItems: tanks.length + products.length,
          criticalStockItems: stockPredictions.filter(p => p.predictedDaysRemaining <= 7).length,
          activeAnomalies: anomalies.length,
          todayVsPrediction
        }
      }
    }
  }

  /**
   * Generate mock sales history for demonstration
   * In production, this would fetch actual historical data from the API
   */
  private generateMockSalesHistory(): Array<{
    date: string
    revenue: number
    volume: number
    fuelType?: string
    module?: string
    productType?: string
    quantity?: number
  }> {
    const history = []
    const today = new Date()

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Add some randomness and patterns
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const baseMultiplier = isWeekend ? 0.7 : 1
      const randomFactor = 0.8 + Math.random() * 0.4

      const revenue = 15000000 * baseMultiplier * randomFactor
      const volume = 1500 * baseMultiplier * randomFactor

      history.push({
        date: date.toISOString().split('T')[0],
        revenue,
        volume,
        fuelType: 'Pertalite',
        module: 'SPBU',
        quantity: Math.round(volume)
      })
    }

    return history
  }

  /**
   * Generate mock shift data for demonstration
   */
  private generateMockShiftData(): Array<{ number: number; revenue: number; transactions: number }> {
    return [
      { number: 1, revenue: 12500000, transactions: 145 },
      { number: 2, revenue: 15800000, transactions: 189 },
      { number: 3, revenue: 9800000, transactions: 112 }
    ]
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(
    health: 'excellent' | 'good' | 'warning' | 'critical',
    anomalies: Anomaly[],
    stockPredictions: StockPrediction[],
    salesPrediction: SalesPrediction
  ): string {
    const criticalStock = stockPredictions.filter(p => p.predictedDaysRemaining <= 7)
    const highAnomalies = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical')

    switch (health) {
      case 'excellent':
        return 'Sistem beroperasi dengan optimal. Semua stok dalam batas aman, tidak ada anomali terdeteksi.'
      case 'good':
        return 'Sistem beroperasi dengan baik. Terdapat beberapa hal perlu diperhatikan untuk menjaga performa optimal.'
      case 'warning':
        return `${criticalStock.length} item stok memerlukan perhatian. ${highAnomalies.length} anomali terdeteksi yang perlu ditinjau.`
      case 'critical':
        return `⚠️ KRITIS: ${criticalStock.length} item stok hampir habis. ${highAnomalies.length} anomali serius memerlukan tindakan segera.`
      default:
        return 'Status sistem tidak dapat ditentukan.'
    }
  }
}

// Singleton instance
export const aiService = new AIService()

/**
 * React hook for AI monitoring data
 */
export function useAIMonitoring() {
  const [data, setData] = useState<AIMonitoringData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Subscribe to AI monitoring updates
    const unsubscribe = aiService.subscribe((monitoringData) => {
      if (mounted) {
        setData(monitoringData)
        setIsLoading(false)
      }
    })

    // Start monitoring if not already started
    aiService.startMonitoring()

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  return { data, isLoading }
}
