/**
 * Stock Alerts Component
 * Displays active stock alerts with severity indicators and order actions
 */

'use client'

import { useState } from 'react'
import { AlertTriangle, Package, TrendingDown, Clock, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { useAutoOrderStore } from '@/store'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import type { StockAlert, AlertSeverity } from '@/store'

const severityConfig: Record<AlertSeverity, { label: string; variant: any; color: string }> = {
  info: { label: 'Info', variant: 'secondary', color: 'bg-blue-500' },
  warning: { label: 'Peringatan', variant: 'warning', color: 'bg-yellow-500' },
  critical: { label: 'Kritis', variant: 'destructive', color: 'bg-red-500' },
}

export function StockAlerts() {
  const {
    stockAlerts,
    orders,
    generateOrderFromAlert,
    dismissStockAlert,
    recalculateOrderQuantities,
  } = useAutoOrderStore()

  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const activeAlerts = stockAlerts.filter((a) => !a.dismissed)

  const handleGenerateOrder = async (alert: StockAlert) => {
    await generateOrderFromAlert(alert.id)
    setShowDetail(false)
  }

  const handleDismiss = (alertId: string) => {
    dismissStockAlert(alertId)
  }

  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length
  const warningCount = activeAlerts.filter((a) => a.severity === 'warning').length
  const infoCount = activeAlerts.filter((a) => a.severity === 'info').length

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Kritis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCount}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Peringatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{warningCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{infoCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Stok Aktif</CardTitle>
          <CardDescription>
            Item dengan stok menipis atau prediksi habis segera
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Tidak ada alert stok aktif</p>
              <p className="text-sm">Semua stok dalam kondisi aman</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {activeAlerts
                  .sort((a, b) => {
                    const severityOrder = { critical: 0, warning: 1, info: 2 }
                    return severityOrder[a.severity] - severityOrder[b.severity]
                  })
                  .map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      hasOrder={!!alert.orderId}
                      onViewDetail={() => {
                        setSelectedAlert(alert)
                        setShowDetail(true)
                      }}
                      onGenerateOrder={() => handleGenerateOrder(alert)}
                      onDismiss={() => handleDismiss(alert.id)}
                    />
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {showDetail && selectedAlert && (
        <Card className="fixed inset-4 z-50 overflow-auto shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Detail Alert Stok</CardTitle>
                <CardDescription>{selectedAlert.itemName}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDetail(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Stok Saat Ini</p>
                <p className="text-lg font-semibold">{formatNumber(selectedAlert.currentStock)} unit</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tingkat Bahaya</p>
                <Badge variant={severityConfig[selectedAlert.severity].variant}>
                  {severityConfig[selectedAlert.severity].label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prediksi Habis Dalam</p>
                <p className="text-lg font-semibold">
                  {selectedAlert.predictedDaysRemaining !== null
                    ? `${selectedAlert.predictedDaysRemaining} hari`
                    : 'Tidak dapat memprediksi'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Penjualan Harian</p>
                <p className="text-lg font-semibold">{formatNumber(selectedAlert.avgDailySales)} unit</p>
              </div>
            </div>

            {/* Recommended Order */}
            {selectedAlert.recommendedOrderQty && selectedAlert.estimatedCost && (
              <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-medium mb-2">Rekomendasi Order</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah yang Disarankan:</span>
                    <span className="font-medium">{formatNumber(selectedAlert.recommendedOrderQty)} unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimasi Biaya:</span>
                    <span className="font-medium">{formatCurrency(selectedAlert.estimatedCost)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {selectedAlert.orderId ? (
                <Button variant="outline" disabled>
                  <Package className="h-4 w-4 mr-2" />
                  Order Sudah Dibuat
                </Button>
              ) : (
                <Button onClick={() => handleGenerateOrder(selectedAlert)}>
                  <Package className="h-4 w-4 mr-2" />
                  Buat Order
                </Button>
              )}
              <Button variant="outline" onClick={() => handleDismiss(selectedAlert.id)}>
                Tutup Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AlertCard({
  alert,
  hasOrder,
  onViewDetail,
  onGenerateOrder,
  onDismiss,
}: {
  alert: StockAlert
  hasOrder: boolean
  onViewDetail: () => void
  onGenerateOrder: () => void
  onDismiss: () => void
}) {
  const severity = severityConfig[alert.severity]

  // Calculate stock percentage for visualization
  const stockPercentage = Math.min(100, (alert.currentStock / (alert.recommendedOrderQty || alert.currentStock * 2)) * 100)

  return (
    <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Severity Indicator */}
        <div className={cn("w-1 h-full min-h-[80px] rounded-full", severity.color)} />

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">{alert.itemName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={severity.variant} className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {severity.label}
                </Badge>
                {alert.predictedDaysRemaining !== null && alert.predictedDaysRemaining <= 3 && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    <Clock className="h-3 w-3 mr-1" />
                    Segera Habis
                  </Badge>
                )}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Stock Info */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Stok Saat Ini</p>
              <p className="font-medium">{formatNumber(alert.currentStock)} unit</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rata-rata Harian</p>
              <p className="font-medium">
                <TrendingDown className="h-3 w-3 inline mr-1" />
                {formatNumber(alert.avgDailySales)} unit
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Prediksi Habis</p>
              <p className="font-medium">
                {alert.predictedDaysRemaining !== null
                  ? `${alert.predictedDaysRemaining} hari`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={stockPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {hasOrder
                ? 'Order sudah dibuat untuk item ini'
                : alert.recommendedOrderQty
                ? `Disarankan order: ${formatNumber(alert.recommendedOrderQty)} unit`
                : 'Data tidak cukup untuk rekomendasi'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button size="sm" variant="outline" onClick={onViewDetail}>
            Detail
          </Button>
          {!hasOrder && (
            <Button size="sm" onClick={onGenerateOrder}>
              <Package className="h-3 w-3 mr-1" />
              Buat Order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
