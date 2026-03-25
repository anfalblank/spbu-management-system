/**
 * Main Dashboard Page
 * Comprehensive real-time dashboard with AI monitoring and predictions
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Activity, Brain, RefreshCw, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Shield } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { usePOSStore } from '@/store'
import { useSPBUStore } from '@/store'
import { useLPGStore } from '@/store'
import { aiService } from '@/lib/ai/ai-service'
import { initializeAllStores } from '@/lib/mock-data-initialization'
import {
  KPICard,
  AnomalyList,
  SPBUMonitoringPanel,
  LPGMonitoringPanel,
  StockMonitoringPanel,
  FinancialSnapshot,
  SalesPredictionCard,
  StockPredictionCard,
  RecommendationCard,
} from '@/components/dashboard'
import { StockAlerts } from '@/components/orders/stock-alerts'
import { OrderList } from '@/components/orders/order-list'
import { SmartControlPanel } from '@/components/dashboard/smart-control-panel'
import type { AIMonitoringData } from '@/lib/ai/ai-service'

export default function DashboardPage() {
  const [aiData, setAIData] = useState<AIMonitoringData | null>(null)
  const [aiLoading, setAiLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'spbu' | 'lpg' | 'stock' | 'financial' | 'ai' | 'auto-order' | 'smart-control'>('overview')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const { transactions, cartItems } = usePOSStore()
  const { currentShift, tanks, settlements } = useSPBUStore()
  const { activeSalesAgreements, products } = useLPGStore()

  // Initialize stores with mock data on first load
  useEffect(() => {
    initializeAllStores()

    // Subscribe to AI monitoring updates
    const unsubscribe = aiService.subscribe((data) => {
      setAIData(data)
      setAiLoading(false)
      setLastUpdate(new Date())
    })

    // Start AI monitoring
    aiService.startMonitoring()

    return () => {
      unsubscribe()
      aiService.stopMonitoring()
    }
  }, [])

  // Set up method reference for manual refresh
  const handleRefresh = async () => {
    const data = await aiService.getMonitoringData()
    setAIData(data)
    setLastUpdate(new Date())
  }

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = transactions.filter((t) => t.createdAt.startsWith(today))
  const totalSales = todayTransactions.reduce((sum, t) => sum + t.total, 0)
  const totalTransactions = todayTransactions.length

  // Per module sales
  const moduleSales = todayTransactions.reduce((acc, t) => {
    t.items.forEach(item => {
      const module = item.module || 'Other'
      acc[module] = (acc[module] || 0) + item.price * item.quantity
    })
    return acc
  }, {} as Record<string, number>)

  // Sales chart data (mock for now)
  const salesChartData = [
    { time: '00:00', SPBU: 1200000, LPG: 450000, OLI: 320000, SnB: 280000 },
    { time: '04:00', SPBU: 850000, LPG: 280000, OLI: 180000, SnB: 150000 },
    { time: '08:00', SPBU: 2800000, LPG: 920000, OLI: 680000, SnB: 450000 },
    { time: '12:00', SPBU: 3500000, LPG: 1150000, OLI: 890000, SnB: 620000 },
    { time: '16:00', SPBU: 3200000, LPG: 1050000, OLI: 750000, SnB: 580000 },
    { time: '20:00', SPBU: 2100000, LPG: 780000, OLI: 520000, SnB: 410000 },
  ]

  // Get health indicator color
  const getHealthColor = () => {
    if (!aiData) return 'bg-gray-500'
    switch (aiData.insights.overallHealth) {
      case 'excellent': return 'bg-emerald-500'
      case 'good': return 'bg-sky-500'
      case 'warning': return 'bg-amber-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Dashboard Monitoring</h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time AI-powered insights
                  </p>
                </div>
              </div>
              <div className={cn("h-3 w-3 rounded-full animate-pulse", getHealthColor())} />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Terakhir Update</p>
                <p className="font-medium">{lastUpdate.toLocaleTimeString('id-ID')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {/* AI Insights Banner */}
        {aiData && (
          <Card className={cn(
            "mb-6 border-l-4",
            aiData.insights.overallHealth === 'critical' && 'border-red-500 bg-red-500/5',
            aiData.insights.overallHealth === 'warning' && 'border-amber-500 bg-amber-500/5',
            aiData.insights.overallHealth === 'good' && 'border-sky-500 bg-sky-500/5',
            aiData.insights.overallHealth === 'excellent' && 'border-emerald-500 bg-emerald-500/5'
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Brain className={cn(
                  "h-6 w-6 mt-1",
                  aiData.insights.overallHealth === 'critical' && 'text-red-500',
                  aiData.insights.overallHealth === 'warning' && 'text-amber-500',
                  aiData.insights.overallHealth === 'good' && 'text-sky-500',
                  aiData.insights.overallHealth === 'excellent' && 'text-emerald-500'
                )} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">AI Insights Summary</h3>
                    <Badge variant="outline" className={
                      aiData.insights.overallHealth === 'critical' ? 'text-red-500 border-red-500' :
                      aiData.insights.overallHealth === 'warning' ? 'text-amber-500 border-amber-500' :
                      aiData.insights.overallHealth === 'good' ? 'text-sky-500 border-sky-500' :
                      'text-emerald-500 border-emerald-500'
                    }>
                      {aiData.insights.overallHealth.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm">{aiData.insights.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-8 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="spbu">
              SPBU
              {aiData?.insights.keyMetrics.activeAnomalies > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {aiData.insights.keyMetrics.activeAnomalies}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="lpg">LPG</TabsTrigger>
            <TabsTrigger value="stock">
              Stock
              {aiData?.insights.keyMetrics.criticalStockItems > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {aiData.insights.keyMetrics.criticalStockItems}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="h-4 w-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="auto-order">
              <Package className="h-4 w-4 mr-2" />
              Auto Order
            </TabsTrigger>
            <TabsTrigger value="smart-control">
              <Shield className="h-4 w-4 mr-2" />
              Smart Control
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Penjualan"
                value={totalSales}
                trend={{
                  value: aiData?.insights.keyMetrics.todayVsPrediction || 0,
                  label: 'vs prediksi'
                }}
                icon={<Activity className="h-5 w-5 text-primary" />}
                variant={totalSales > 10000000 ? 'success' : 'default'}
              />
              <KPICard
                title="Total Transaksi"
                value={totalTransactions}
                unit="transaksi"
                icon={<Activity className="h-5 w-5 text-amber-500" />}
              />
              <KPICard
                title="SPBU"
                value={moduleSales.SPBU || 0}
                trend={{ value: 5.2, label: 'vs kemarin' }}
                icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
              />
              <KPICard
                title="LPG"
                value={moduleSales.LPG || 0}
                trend={{ value: -2.1, label: 'vs kemarin' }}
                icon={<TrendingDown className="h-5 w-5 text-red-500" />}
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Sales Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Tren Penjualan Hari Ini</CardTitle>
                  <CardDescription>Penjualan per module sepanjang hari</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line type="monotone" dataKey="SPBU" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="LPG" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="OLI" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="SnB" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Module Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Penjualan per Module</CardTitle>
                  <CardDescription>Persentase pendapatan per module</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(moduleSales).map(([name, value]) => ({ name, value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Anomalies and Recommendations */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Active Anomalies */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Anomali Terdeteksi
                  {aiData && (
                    <Badge variant={aiData.anomalies.length > 0 ? 'destructive' : 'secondary'}>
                      {aiData.anomalies.length}
                    </Badge>
                  )}
                </h3>
                {aiData ? (
                  <AnomalyList anomalies={aiData.anomalies} maxDisplay={3} />
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center text-muted-foreground">
                        Loading...
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* AI Recommendations */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Rekomendasi AI
                  {aiData && (
                    <Badge variant="outline">
                      {aiData.recommendations.length}
                    </Badge>
                  )}
                </h3>
                {aiData ? (
                  <div className="space-y-3">
                    {aiData.recommendations.slice(0, 3).map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center text-muted-foreground">
                        Loading...
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* SPBU Tab */}
          <TabsContent value="spbu">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <SPBUMonitoringPanel />
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Settlement Hari Ini</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {currentShift ? (
                        <>
                          <p>Shift {currentShift.number} aktif</p>
                          <p className="mt-2">
                            {settlements.filter((s) =>
                              s.shiftId === currentShift.id &&
                              s.date === today
                            ).length} settlement
                          </p>
                        </>
                      ) : (
                        'Tidak ada shift aktif'
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* LPG Tab */}
          <TabsContent value="lpg">
            <LPGMonitoringPanel />
          </TabsContent>

          {/* Stock Tab */}
          <TabsContent value="stock">
            <div className="grid gap-6 lg:grid-cols-2">
              <StockMonitoringPanel stockPredictions={aiData?.stockPredictions} />
              {aiData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      Prediksi Stok
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4 pr-4">
                        {aiData.stockPredictions.slice(0, 10).map((prediction) => (
                          <StockPredictionCard key={prediction.itemId} prediction={prediction} />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <FinancialSnapshot />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai" className="space-y-6">
            {/* Sales Prediction */}
            {aiData && (
              <SalesPredictionCard prediction={aiData.salesPrediction} />
            )}

            {/* All Stock Predictions */}
            {aiData && (
              <Card>
                <CardHeader>
                  <CardTitle>Analisis Prediksi Stok Lengkap</CardTitle>
                  <CardDescription>
                    Prediksi berdasarkan data penjualan 30 hari terakhir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      {aiData.stockPredictions.map((prediction) => (
                        <StockPredictionCard key={prediction.itemId} prediction={prediction} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* All Anomalies */}
            {aiData && aiData.anomalies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Semua Anomali Terdeteksi</CardTitle>
                  <CardDescription>
                    {aiData.anomalies.length} anomali memerlukan perhatian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      <AnomalyList anomalies={aiData.anomalies} maxDisplay={50} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* All Recommendations */}
            {aiData && aiData.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Semua Rekomendasi</CardTitle>
                  <CardDescription>
                    Rekomendasi AI untuk optimisasi operasional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      {aiData.recommendations.map((rec) => (
                        <RecommendationCard key={rec.id} recommendation={rec} />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Auto Order Tab */}
          <TabsContent value="auto-order" className="space-y-6">
            <StockAlerts />
          </TabsContent>

          {/* Smart Control Tab */}
          <TabsContent value="smart-control" className="space-y-6">
            <SmartControlPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
