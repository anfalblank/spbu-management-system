/**
 * Smart Control Dashboard Panel
 * Displays fraud detection, performance metrics, and AI recommendations
 */

'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, Users, Clock, Award, AlertCircle, CheckCircle2, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/lib/utils/formatters'
import { smartControlService } from '@/lib/smart-control'
import type { FraudCase, PerformanceMetrics, BusinessInsights } from '@/lib/smart-control'

const severityConfig = {
  low: { label: 'Rendah', variant: 'secondary', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
  medium: { label: 'Sedang', variant: 'warning', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  high: { label: 'Tinggi', variant: 'destructive', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  critical: { label: 'Kritis', variant: 'destructive', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950' },
}

const healthConfig = {
  healthy: { label: 'Sehat', variant: 'default', icon: CheckCircle2, color: 'text-green-500' },
  attention_needed: { label: 'Perlu Perhatian', variant: 'warning', icon: AlertCircle, color: 'text-yellow-500' },
  critical: { label: 'Kritis', variant: 'destructive', icon: AlertTriangle, color: 'text-red-500' },
}

export function SmartControlPanel() {
  const [insights, setInsights] = useState<BusinessInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFraudCase, setSelectedFraudCase] = useState<FraudCase | null>(null)

  useEffect(() => {
    loadInsights()

    // Set up periodic refresh
    const interval = setInterval(() => {
      loadInsights()
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [])

  const loadInsights = async () => {
    setLoading(true)
    try {
      const data = await smartControlService.runAnalysis()
      setInsights(data)
    } catch (error) {
      console.error('Failed to load smart control insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !insights) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 animate-pulse" />
            <p>Memuat analisis Smart Control...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const health = healthConfig[insights.summary.overallHealth]
  const criticalFraud = insights.fraudCases.filter((fc) => fc.severity === 'critical')
  const highFraud = insights.fraudCases.filter((fc) => fc.severity === 'high')

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card className={cn("border-2", health.color.replace('text-', 'border-'))}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <health.icon className={cn("h-5 w-5", health.color)} />
                Status Kesehatan Bisnis
              </CardTitle>
              <CardDescription>Analisis AI terakhir: {formatRelativeTime(new Date())}</CardDescription>
            </div>
            <Badge variant={health.variant} className="text-sm px-3 py-1">
              {health.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Key Issues */}
            {insights.summary.keyIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Isu Kunci
                </h4>
                <ul className="space-y-1">
                  {insights.summary.keyIssues.map((issue, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opportunities */}
            {insights.summary.opportunities.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Peluang
                </h4>
                <ul className="space-y-1">
                  {insights.summary.opportunities.map((opp, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="fraud" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fraud">
            Deteksi Kecurangan
            {criticalFraud.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1 text-xs">
                {criticalFraud.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="performance">
            Performa
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Rekomendasi AI
            {insights.recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                {insights.recommendations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud" className="space-y-4">
          {insights.fraudCases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Tidak ada kasus kecurangan terdeteksi</p>
                <p className="text-sm">Sistem beroperasi dengan normal</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {insights.fraudCases.map((fraudCase) => (
                <FraudCaseCard
                  key={fraudCase.id}
                  fraudCase={fraudCase}
                  onViewDetail={() => setSelectedFraudCase(fraudCase)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Low Performing Shifts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  Shift dengan Performa Rendah
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.performance.lowPerformingShifts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Semua shift performa baik
                  </p>
                ) : (
                  <div className="space-y-3">
                    {insights.performance.lowPerformingShifts.map((shift, i) => (
                      <div key={i} className="p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Shift {shift.shiftNumber}</span>
                          <Badge variant="outline">Gap: {formatCurrency(shift.gapToBest)}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                          <div>
                            <p>Pendapatan</p>
                            <p className="font-medium text-foreground">{formatCurrency(shift.revenue)}</p>
                          </div>
                          <div>
                            <p>Transaksi</p>
                            <p className="font-medium text-foreground">{shift.transactions}</p>
                          </div>
                          <div>
                            <p>Rata-rata</p>
                            <p className="font-medium text-foreground">{formatCurrency(shift.avgPerTransaction)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Best Selling Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Produk Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.performance.bestSellingProducts.map((product, i) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} terjual</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Jam Sibuk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  {insights.performance.peakHours.map((peak, i) => (
                    <div key={i} className="text-center">
                      <div className="relative pt-4">
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-muted rounded-t-lg overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-primary transition-all"
                            style={{
                              height: `${(peak.revenue / insights.performance.peakHours[0].revenue) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="relative z-10 pb-2">
                          <p className="text-2xl font-bold">{peak.hour}:00</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(peak.revenue)}</p>
                          <p className="text-xs text-muted-foreground">{peak.transactionCount} transaksi</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profit Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Tren Keuntungan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tren 7 Hari Terakhir</p>
                    <div className="flex items-center gap-2 mt-1">
                      {insights.performance.profitTrend === 'increasing' && (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      )}
                      {insights.performance.profitTrend === 'decreasing' && (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                      {insights.performance.profitTrend === 'stable' && (
                        <span className="text-2xl">→</span>
                      )}
                      <span className="text-lg font-semibold capitalize">
                        {insights.performance.profitTrend === 'increasing' && 'Meningkat'}
                        {insights.performance.profitTrend === 'decreasing' && 'Menurun'}
                        {insights.performance.profitTrend === 'stable' && 'Stabil'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Perbandingan Mingguan</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      insights.performance.weeklyComparison >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {insights.performance.weeklyComparison >= 0 ? '+' : ''}
                      {insights.performance.weeklyComparison.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                Rekomendasi AI
              </CardTitle>
              <CardDescription>Saran tindakan berdasarkan analisis data</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.recommendations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Tidak ada rekomendasi saat ini
                </p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {insights.recommendations.map((recommendation, i) => (
                      <div key={i} className="p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {i + 1}
                          </div>
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fraud Case Detail Modal */}
      {selectedFraudCase && (
        <Card className="fixed inset-4 z-50 overflow-auto shadow-lg max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Detail Kasus Kecurangan</CardTitle>
                <CardDescription>ID: {selectedFraudCase.id}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFraudCase(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant={severityConfig[selectedFraudCase.severity].variant}>
                {severityConfig[selectedFraudCase.severity].label}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Deskripsi</p>
              <p className="font-medium">{selectedFraudCase.description}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Waktu Terdeteksi</p>
              <p>{formatRelativeTime(selectedFraudCase.detectedAt)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Tindakan yang Disarankan</p>
              <ul className="space-y-1">
                {selectedFraudCase.suggestedActions.map((action, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedFraudCase.metadata.shiftId && (
              <div>
                <p className="text-sm text-muted-foreground">Shift Terkait</p>
                <p className="font-medium">Shift {selectedFraudCase.metadata.shiftNumber}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedFraudCase(null)}>
                Tutup
              </Button>
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                Investigasi Lebih Lanjut
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function FraudCaseCard({
  fraudCase,
  onViewDetail,
}: {
  fraudCase: FraudCase
  onViewDetail: () => void
}) {
  const severity = severityConfig[fraudCase.severity]

  return (
    <Card className={cn("border-l-4", severity.bg.replace('bg-', 'border-l-'))}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Severity Icon */}
          <div className={cn("p-2 rounded-lg", severity.bg)}>
            <AlertTriangle className={cn("h-5 w-5", severity.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{fraudCase.type.replace(/_/g, ' ').toUpperCase()}</h4>
                <p className="text-sm text-muted-foreground mt-1">{fraudCase.description}</p>
              </div>
              <Badge variant={severity.variant}>{severity.label}</Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Terdeteksi: {formatRelativeTime(fraudCase.detectedAt)}</span>
              {fraudCase.metadata.shiftNumber && (
                <span>Shift {fraudCase.metadata.shiftNumber}</span>
              )}
            </div>

            {/* Suggested Actions */}
            <div className="flex flex-wrap gap-1">
              {fraudCase.suggestedActions.slice(0, 2).map((action, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {action}
                </Badge>
              ))}
              {fraudCase.suggestedActions.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{fraudCase.suggestedActions.length - 2} lagi
                </Badge>
              )}
            </div>
          </div>

          {/* Action */}
          <Button size="sm" variant="outline" onClick={onViewDetail}>
            Lihat Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
