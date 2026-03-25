'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { SalesPrediction } from '@/lib/api/mock-data'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils/cn'

interface SalesPredictionCardProps {
  predictions: SalesPrediction[]
  nextDayPrediction?: number
  nextWeekPrediction?: number
  className?: string
}

export function SalesPredictionCard({
  predictions,
  nextDayPrediction,
  nextWeekPrediction,
  className,
}: SalesPredictionCardProps) {
  const today = new Date().toISOString().split('T')[0]
  const chartData = predictions
    .filter(p => p.date <= today || new Date(p.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    .map(p => ({
      date: new Date(p.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      prediksi: p.predicted,
      actual: p.actual,
      isPrediction: !p.actual,
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium mb-1">{data.date}</p>
          <p className="text-sm text-primary">
            Prediksi: {formatCurrency(data.prediksi)}
          </p>
          {data.actual && (
            <p className="text-sm text-emerald-500">
              Aktual: {formatCurrency(data.actual)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Prediksi Penjualan AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {nextDayPrediction && (
            <div className="bg-primary/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Besok</span>
              </div>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(nextDayPrediction)}
              </p>
            </div>
          )}
          {nextWeekPrediction && (
            <div className="bg-accent rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Minggu depan</span>
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(nextWeekPrediction)}
              </p>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="prediksi"
                stroke="hsl(var(--primary))"
                fill="url(#colorPrediction)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Aktual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Prediksi</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
