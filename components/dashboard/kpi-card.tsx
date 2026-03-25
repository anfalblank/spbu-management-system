'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label?: string
  }
  iconColor?: string
  iconBgColor?: string
  className?: string
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  className,
}: KPICardProps) {
  const TrendIcon = trend && trend.value > 0 ? TrendingUp : trend && trend.value < 0 ? TrendingDown : Minus
  const trendColor = trend && trend.value > 0 ? 'text-emerald-500' : trend && trend.value < 0 ? 'text-red-500' : 'text-muted-foreground'

  return (
    <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">
              {typeof value === 'number' && title.toLowerCase().includes('penjualan')
                ? formatCurrency(value)
                : typeof value === 'number'
                ? formatNumber(value)
                : value}
            </h3>

            {trend && (
              <div className={cn('flex items-center gap-1 mt-2 text-sm', trendColor)}>
                <TrendIcon className="h-4 w-4" />
                <span className="font-medium">
                  {trend.value > 0 ? '+' : ''}
                  {Math.abs(trend.value).toFixed(1)}%
                </span>
                {trend.label && (
                  <span className="text-muted-foreground ml-1">{trend.label}</span>
                )}
              </div>
            )}
          </div>

          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
