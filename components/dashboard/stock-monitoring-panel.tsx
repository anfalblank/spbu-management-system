/**
 * Stock Monitoring Panel Component
 * Real-time monitoring of all stock levels with alerts
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Package, Droplet, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSPBUStore } from '@/store'
import { useLPGStore } from '@/store'
import type { StockPrediction } from '@/lib/ai/predictions'

interface StockMonitoringPanelProps {
  stockPredictions?: StockPrediction[]
}

export function StockMonitoringPanel({ stockPredictions = [] }: StockMonitoringPanelProps) {
  const { tanks, tankAlerts } = useSPBUStore()
  const { products } = useLPGStore()

  // Combine BBM tanks and LPG products
  const stockItems = [
    ...tanks.map(tank => ({
      id: tank.id,
      name: `${tank.fuelType} (Tank ${tank.number})`,
      category: 'BBM' as const,
      currentStock: tank.currentVolume,
      capacity: tank.capacity,
      minStock: tank.minVolume,
      unit: 'Liter',
      fuelType: tank.fuelType,
      isAlert: tankAlerts.includes(tank.id)
    })),
    ...products.map(product => ({
      id: product.id,
      name: product.name,
      category: 'LPG' as const,
      currentStock: product.stock,
      capacity: product.stock * 2, // Estimated
      minStock: 50,
      unit: 'unit',
      productType: product.type,
      isAlert: product.stock <= 50
    }))
  ]

  // Sort by criticality (alert items first, then by stock percentage)
  const sortedItems = stockItems.sort((a, b) => {
    if (a.isAlert && !b.isAlert) return -1
    if (!a.isAlert && b.isAlert) return 1
    const aPercent = (a.currentStock / a.capacity) * 100
    const bPercent = (b.currentStock / b.capacity) * 100
    return aPercent - bPercent
  })

  const criticalItems = sortedItems.filter(item => item.isAlert)
  const warningItems = sortedItems.filter(item =>
    !item.isAlert && (item.currentStock / item.capacity) <= 0.3
  )

  // Get prediction for each item
  const getPrediction = (itemId: string) => {
    return stockPredictions.find(p => p.itemId === itemId)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Monitoring Stok</h3>
          <p className="text-sm text-muted-foreground">
            {criticalItems.length} Kritis • {warningItems.length} Peringatan
          </p>
        </div>
        <Badge variant={criticalItems.length > 0 ? 'destructive' : 'secondary'}>
          {sortedItems.length} Item
        </Badge>
      </div>

      {/* Critical Items Alert */}
      {criticalItems.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Stok Kritis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalItems.map(item => {
              const prediction = getPrediction(item.id)
              const percentage = (item.currentStock / item.capacity) * 100

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{item.currentStock.toLocaleString()} {item.unit}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                  {prediction && prediction.predictedDaysRemaining < Infinity && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-500/10 p-2 rounded">
                      <TrendingDown className="h-3 w-3" />
                      <span>Habis dalam {prediction.predictedDaysRemaining} hari</span>
                    </div>
                  )}
                  <Progress value={percentage} className="h-1" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Warning Items */}
      {warningItems.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
              <Package className="h-4 w-4" />
              Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warningItems.map(item => {
              const prediction = getPrediction(item.id)
              const percentage = (item.currentStock / item.capacity) * 100

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{item.currentStock.toLocaleString()} {item.unit}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                  {prediction && prediction.predictedDaysRemaining < Infinity && (
                    <p className="text-xs text-muted-foreground">
                      Habis dalam {prediction.predictedDaysRemaining} hari
                    </p>
                  )}
                  <Progress value={percentage} className="h-1" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Healthy Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Stok Aman
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedItems
            .filter(item => !item.isAlert && (item.currentStock / item.capacity) > 0.3)
            .map(item => {
              const prediction = getPrediction(item.id)
              const percentage = (item.currentStock / item.capacity) * 100

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.currentStock.toLocaleString()} {item.unit}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                  {prediction && prediction.predictedDaysRemaining < Infinity && (
                    <p className="text-xs text-muted-foreground">
                      Habis dalam {prediction.predictedDaysRemaining} hari
                    </p>
                  )}
                  <Progress value={percentage} className="h-1" />
                </div>
              )
            })}
        </CardContent>
      </Card>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>Belum ada data stok</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
