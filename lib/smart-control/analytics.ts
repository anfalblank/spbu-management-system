/**
 * Smart Control Analytics Service
 * Provides fraud detection, performance monitoring, and business insights
 */

import { usePOSStore } from '@/store'
import { useSPBUStore } from '@/store'
import { useLPGStore } from '@/store'
import { notificationService } from '@/lib/notifications/notification-service'

export interface FraudCase {
  id: string
  type: 'high_selisih' | 'unusual_pattern' | 'suspicious_transaction' | 'staff_misconduct'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  detectedAt: string
  metadata: {
    transactionId?: string
    shiftId?: string
    userId?: string
    details: Record<string, any>
  }
  suggestedActions: string[]
}

export interface PerformanceMetrics {
  lowPerformingShifts: Array<{
    shiftNumber: number
    revenue: number
    transactions: number
    avgPerTransaction: number
    gapToBest: number
  }>
  bestSellingProducts: Array<{
    id: string
    name: string
    category: string
    sales: number
    revenue: number
    profitMargin: number
  }>
  peakHours: Array<{
    hour: number
    sales: number
    revenue: number
    transactionCount: number
  }>
  profitTrend: 'increasing' | 'stable' | 'decreasing'
  weeklyComparison: number // percentage change
}

export interface BusinessInsights {
  fraudCases: FraudCase[]
  performance: PerformanceMetrics
  recommendations: string[]
  summary: {
    overallHealth: 'healthy' | 'attention_needed' | 'critical'
    keyIssues: string[]
    opportunities: string[]
  }
}

class SmartControlService {
  private monitoringInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 60000 // Check every minute

  /**
   * Start smart control monitoring
   */
  startMonitoring() {
    if (this.monitoringInterval) return

    // Initial analysis
    this.runAnalysis()

    // Set up periodic analysis
    this.monitoringInterval = setInterval(() => {
      this.runAnalysis()
    }, this.CHECK_INTERVAL)

    console.log('🔍 Smart Control monitoring started')
  }

  /**
   * Stop smart control monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      console.log('🔍 Smart Control monitoring stopped')
    }
  }

  /**
   * Run comprehensive analysis
   */
  async runAnalysis(): Promise<BusinessInsights> {
    const fraudCases = this.detectFraud()
    const performance = this.analyzePerformance()
    const summary = this.generateSummary(fraudCases, performance)

    // Send notifications for critical issues
    fraudCases.filter((fc) => fc.severity === 'critical').forEach((fraudCase) => {
      notificationService.sendNotification({
        type: 'fraud_detected',
        title: `⚠️ ${fraudCase.type.replace('_', ' ').toUpperCase()} Terdeteksi`,
        message: fraudCase.description,
        severity: fraudCase.severity === 'critical' ? 'critical' : 'warning',
        channels: ['in_app'],
        read: false,
        metadata: { fraudCase }
      })
    })

    return {
      fraudCases,
      performance,
      recommendations: this.generateRecommendations(fraudCases, performance),
      summary
    }
  }

  /**
   * Detect fraudulent activities
   */
  private detectFraud(): FraudCase[] {
    const fraudCases: FraudCase[] = []
    const { transactions } = usePOSStore.getState()
    const { settlements, currentShift } = useSPBUStore.getState()
    const today = new Date().toISOString().split('T')[0]

    // Check for high selisih in SPBU
    const todaySettlements = settlements.filter((s) => s.date === today && s.status === 'approved')
    todaySettlements.forEach((settlement) => {
      settlement.nozzleData.forEach((nozzle) => {
        const selisihPercentage = Math.abs(
          (settlement.selisih.volume / settlement.totalVolume) * 100
        )

        if (selisihPercentage > 5) {
          fraudCases.push({
            id: `fraud-selisih-${nozzle.nozzleId}-${Date.now()}`,
            type: 'high_selisih',
            description: `Selisih tinggi terdeteksi pada Nozzle ${nozzle.nozzleNumber}: ${selisihPercentage.toFixed(1)}%`,
            severity: selisihPercentage > 10 ? 'critical' : selisihPercentage > 7 ? 'high' : 'medium',
            detectedAt: new Date().toISOString(),
            metadata: {
              settlementId: settlement.id,
              dispenserId: settlement.dispenserId,
              nozzleId: nozzle.nozzleId,
              details: {
                selisihPercentage,
                systemVolume: nozzle.volume,
                selisih: settlement.selisih.volume
              }
            },
            suggestedActions: [
              'Investigasi dispenser dan nozzle',
              'Cek kalibrasi',
              'Review CCTV jika tersedia'
            ]
          })
        }
      })
    })

    // Check for unusual transaction patterns
    const todayTransactions = transactions.filter((t) => t.createdAt.startsWith(today))
    const transactionCounts = new Map<string, number>()

    todayTransactions.forEach((t) => {
      const key = `${t.paymentMethod}-${t.items[0]?.module}`
      transactionCounts.set(key, (transactionCounts.get(key) || 0) + 1)
    })

    // Detect rapid void transactions (potential fraud)
    const voidTransactions = todayTransactions.filter((t) =>
      t.paymentMethod === 'cash' && t.total < 50000 && t.items.some(i => i.quantity === 0)
    )

    if (voidTransactions.length > 10) {
      fraudCases.push({
        id: `fraud-void-${Date.now()}`,
        type: 'suspicious_transaction',
        description: `Pola transaksi mencurigakan: ${voidTransactions.length} transaksi void kecil terdeteksi`,
        severity: voidTransactions.length > 20 ? 'high' : 'medium',
        detectedAt: new Date().toISOString(),
        metadata: {
          details: {
            voidTransactionCount: voidTransactions.length,
            transactionIds: voidTransactions.map((t) => t.id)
          }
        },
        suggestedActions: [
          'Review transaksi void',
          'Periksa petugas kasir',
          'Analisis pola transaksi'
        ]
      })
    }

    // Check for staff performance anomalies
    if (currentShift) {
      const shiftTransactions = todayTransactions.filter((t) =>
        t.createdAt >= currentShift.startTime && t.createdAt <= (currentShift.endTime || new Date().toISOString())
      )

      if (shiftTransactions.length > 0) {
        const avgTransaction = shiftTransactions.reduce((sum, t) => sum + t.total, 0) / shiftTransactions.length
        const veryLowTransactions = shiftTransactions.filter((t) => t.total < avgTransaction * 0.5)

        if (veryLowTransactions.length > shiftTransactions.length * 0.3) {
          fraudCases.push({
            id: `fraud-staff-${Date.now()}`,
            type: 'staff_misconduct',
            description: `Pola transaksi tidak wajar pada Shift ${currentShift.number}: Banyak transaksi bernilai sangat rendah`,
            severity: 'medium',
            detectedAt: new Date().toISOString(),
            metadata: {
              shiftId: currentShift.id,
              shiftNumber: currentShift.number,
              details: {
                totalTransactions: shiftTransactions.length,
                lowValueTransactions: veryLowTransactions.length,
                avgTransaction,
                threshold: avgTransaction * 0.5
              }
            },
            suggestedActions: [
              'Review transaksi shift ini',
              'Periksa petugas shift',
              'Analisis CCTV jika tersedia'
            ]
          })
        }
      }
    }

    return fraudCases
  }

  /**
   * Analyze performance metrics
   */
  private analyzePerformance(): PerformanceMetrics {
    const { transactions } = usePOSStore.getState()
    const { settlements } = useSPBUStore.getState()
    const { realisasi, products } = useLPGStore.getState()

    // Analyze shift performance
    const shiftPerformance = this.analyzeShiftPerformance(settlements)
    const lowPerformingShifts = shiftPerformance
      .sort((a, b) => a.avgPerTransaction - b.avgPerTransaction)
      .slice(0, 2)

    // Analyze product performance
    const productSales = new Map<string, { sales: number; revenue: number }>()
    transactions.forEach((t) => {
      t.items.forEach((item) => {
        const existing = productSales.get(item.id) || { sales: 0, revenue: 0 }
        productSales.set(item.id, {
          sales: existing.sales + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity)
        })
      })
    })

    const bestSellingProducts = Array.from(productSales.entries())
      .map(([id, data]) => {
        const product = products.find((p) => p.id === id)
        return {
          id,
          name: product?.name || id,
          category: product?.category || 'Unknown',
          sales: data.sales,
          revenue: data.revenue,
          profitMargin: 0.1 // Would be calculated from actual costs
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Analyze peak hours
    const hourlySales = new Map<number, { sales: number; revenue: number; count: number }>()
    transactions.forEach((t) => {
      const hour = new Date(t.createdAt).getHours()
      const existing = hourlySales.get(hour) || { sales: 0, revenue: 0, count: 0 }
      hourlySales.set(hour, {
        sales: existing.sales + t.items.reduce((sum, i) => sum + i.quantity, 0),
        revenue: existing.revenue + t.total,
        count: existing.count + 1
      })
    })

    const peakHours = Array.from(hourlySales.entries())
      .map(([hour, data]) => ({
        hour,
        sales: data.sales,
        revenue: data.revenue,
        transactionCount: data.count
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Calculate profit trend (simplified)
    const last7DaysRevenue = this.calculateRevenueLastNDays(7)
    const previous7DaysRevenue = this.calculateRevenueLastNDays(14, 7)
    const profitTrend = last7DaysRevenue > previous7DaysRevenue * 1.05 ? 'increasing'
      : last7DaysRevenue < previous7DaysRevenue * 0.95 ? 'decreasing'
      : 'stable'

    const weeklyComparison = previous7DaysRevenue > 0
      ? ((last7DaysRevenue - previous7DaysRevenue) / previous7DaysRevenue) * 100
      : 0

    return {
      lowPerformingShifts: lowPerformingShifts.map((shift) => ({
        shiftNumber: shift.shiftNumber,
        revenue: shift.revenue,
        transactions: shift.transactions,
        avgPerTransaction: shift.avgPerTransaction,
        gapToBest: shiftPerformance[0].avgPerTransaction - shift.avgPerTransaction
      })),
      bestSellingProducts,
      peakHours,
      profitTrend,
      weeklyComparison
    }
  }

  /**
   * Analyze shift performance
   */
  private analyzeShiftPerformance(settlements: any[]): Array<{
    shiftNumber: number
    revenue: number
    transactions: number
    avgPerTransaction: number
  }> {
    const shiftData = new Map<number, { revenue: number; transactions: number }>()

    settlements.forEach((settlement) => {
      const existing = shiftData.get(settlement.shiftNumber) || { revenue: 0, transactions: 0 }
      shiftData.set(settlement.shiftNumber, {
        revenue: existing.revenue + settlement.totalRevenue,
        transactions: existing.transactions + (settlement.payments.length || 1)
      })
    })

    return Array.from(shiftData.entries()).map(([shiftNumber, data]) => ({
      shiftNumber,
      revenue: data.revenue,
      transactions: data.transactions,
      avgPerTransaction: data.transactions > 0 ? data.revenue / data.transactions : 0
    }))
  }

  /**
   * Calculate revenue for last N days
   */
  private calculateRevenueLastNDays(days: number, offset = 0): number {
    const { transactions } = usePOSStore.getState()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days - offset)

    return transactions
      .filter((t) => new Date(t.createdAt) >= cutoffDate)
      .reduce((sum, t) => sum + t.total, 0)
  }

  /**
   * Generate summary and recommendations
   */
  private generateSummary(fraudCases: FraudCase[], performance: PerformanceMetrics): BusinessInsights['summary'] {
    const criticalFraud = fraudCases.filter((fc) => fc.severity === 'critical')
    const highFraud = fraudCases.filter((fc) => fc.severity === 'high')
    const lowPerformingShifts = performance.lowPerformingShifts.length

    let overallHealth: 'healthy' | 'attention_needed' | 'critical' = 'healthy'
    if (criticalFraud.length > 0) {
      overallHealth = 'critical'
    } else if (highFraud.length > 2 || lowPerformingShifts > 0) {
      overallHealth = 'attention_needed'
    }

    const keyIssues: string[] = []
    const opportunities: string[] = []

    if (criticalFraud.length > 0) {
      keyIssues.push(`${criticalFraud.length} kasus kecurangan kritis terdeteksi`)
    }
    if (highFraud.length > 0) {
      keyIssues.push(`${highFraud.length} kasus kecurangan berat memerlukan perhatian`)
    }
    if (lowPerformingShifts > 0) {
      keyIssues.push(`${lowPerformingShifts} shift dengan performa rendah`)
    }

    if (performance.profitTrend === 'increasing') {
      opportunities.push('Tren keuntungan meningkat - pertimbangkan ekspansi')
    }
    if (performance.peakHours.length > 0) {
      const peakHour = performance.peakHours[0]
      opportunities.push(`Jam sibuk: ${peakHour.hour}:00 - tingkatkan staf di jam ini`)
    }

    return {
      overallHealth,
      keyIssues,
      opportunities
    }
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    fraudCases: FraudCase[],
    performance: PerformanceMetrics
  ): string[] {
    const recommendations: string[] = []

    // Fraud-related recommendations
    fraudCases.forEach((fc) => {
      fc.suggestedActions.forEach((action) => {
        if (!recommendations.includes(action)) {
          recommendations.push(action)
        }
      })
    })

    // Performance-related recommendations
    performance.lowPerformingShifts.forEach((shift) => {
      if (shift.gapToBest > 50000) {
        recommendations.push(
          `Latih dan evaluasi operator Shift ${shift.shiftNumber} - gap performa Rp ${shift.gapToBest.toLocaleString()}`
        )
      }
    })

    // Profit trend recommendations
    if (performance.profitTrend === 'decreasing') {
      recommendations.push('Investigasi penurunan tren keuntungan - evaluasi pricing dan biaya operasional')
    }

    return recommendations.slice(0, 10) // Limit to top 10 recommendations
  }
}

// Singleton instance
export const smartControlService = new SmartControlService()

/**
 * React hook for smart control insights
 */
export function useSmartControl() {
  const [insights, setInsights] = useState<BusinessInsights | null>(null)

  useEffect(() => {
    // Initial analysis
    smartControlService.runAnalysis().then(setInsights)

    // Set up periodic updates
    const interval = setInterval(() => {
      smartControlService.runAnalysis().then(setInsights)
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [])

  return insights
}
