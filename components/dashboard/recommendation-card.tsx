'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, ShoppingCart, ArrowRight } from 'lucide-react'
import { StockPrediction } from '@/lib/api/mock-data'
import { formatCurrency, formatNumber, formatVolume } from '@/lib/utils/formatters'

interface RecommendationCardProps {
  predictions: StockPrediction[]
  onCreateOrder?: (product: string, quantity: number) => void
  className?: string
}

export function RecommendationCard({ predictions, onCreateOrder, className }: RecommendationCardProps) {
  const highPriorityItems = predictions.filter(p => p.priority === 'high').slice(0, 3)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Rekomendasi Pembelian
        </CardTitle>
      </CardHeader>
      <CardContent>
        {highPriorityItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Semua stok dalam kondisi aman</p>
          </div>
        ) : (
          <div className="space-y-4">
            {highPriorityItems.map((item) => {
              const suggestedQty = Math.ceil(item.dailyUsage * 7) // Suggest 7 days supply
              const estimatedCost = suggestedQty * (item.currentStock > 0
                ? (item.dailyUsage > 0 ? (item.dailyUsage * 10000 / item.currentStock) : 10000)
                : 10000) // Rough estimation

              return (
                <div
                  key={item.productId}
                  className="p-4 rounded-xl border bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{item.productName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Stok: {item.unit === 'Liter' || item.unit === 'L'
                          ? formatVolume(item.currentStock)
                          : formatNumber(item.currentStock)} {item.unit}
                        {' '}• Sisa: {item.daysUntilEmpty} hari
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Estimasi Biaya</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(estimatedCost)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Saran pesan: </span>
                      <span className="font-semibold">
                        {item.unit === 'Liter' || item.unit === 'L'
                          ? formatVolume(suggestedQty)
                          : formatNumber(suggestedQty)} {item.unit}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1"
                      onClick={() => onCreateOrder?.(item.productId, suggestedQty)}
                    >
                      Buat PO
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
