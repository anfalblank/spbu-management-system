'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Package, TrendingDown } from 'lucide-react'
import { StockPrediction } from '@/lib/api/mock-data'
import { cn } from '@/lib/utils'
import { formatNumber, formatVolume } from '@/lib/utils/formatters'

interface StockPredictionCardProps {
  predictions: StockPrediction[]
  className?: string
}

export function StockPredictionCard({ predictions, className }: StockPredictionCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50 dark:bg-red-950/20'
      case 'medium':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20'
      case 'low':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
      default:
        return 'text-muted-foreground'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Kritis'
      case 'medium':
        return 'Perhatian'
      case 'low':
        return 'Normal'
      default:
        return priority
    }
  }

  const getDaysColor = (days: number) => {
    if (days <= 7) return 'text-red-500'
    if (days <= 14) return 'text-amber-500'
    return 'text-emerald-500'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Prediksi Stok
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.slice(0, 5).map((prediction) => (
            <div
              key={prediction.productId}
              className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{prediction.productName}</h4>
                  <Badge variant="outline" className={cn('text-xs', getPriorityColor(prediction.priority))}>
                    {getPriorityLabel(prediction.priority)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Stok Saat Ini</p>
                    <p className="text-lg font-semibold">
                      {prediction.unit === 'Liter' || prediction.unit === 'L'
                        ? formatVolume(prediction.currentStock)
                        : formatNumber(prediction.currentStock)} {prediction.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pemakaian/Hari</p>
                    <p className="text-lg font-semibold">
                      {prediction.unit === 'Liter' || prediction.unit === 'L'
                        ? formatVolume(prediction.dailyUsage)
                        : formatNumber(prediction.dailyUsage)} {prediction.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <TrendingDown className={cn('h-4 w-4', getDaysColor(prediction.daysUntilEmpty))} />
                    <span className="text-sm">
                      <span className={cn('font-semibold', getDaysColor(prediction.daysUntilEmpty))}>
                        {prediction.daysUntilEmpty} hari
                      </span>
                      <span className="text-muted-foreground ml-1">sampai habis</span>
                    </span>
                  </div>
                </div>

                {prediction.recommendation && (
                  <div className="mt-3 p-2 bg-primary/5 rounded-lg">
                    <p className="text-xs text-primary">
                      💡 {prediction.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
