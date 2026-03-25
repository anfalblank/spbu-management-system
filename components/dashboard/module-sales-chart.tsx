'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SalesData } from '@/lib/api/mock-data'
import { formatCurrency } from '@/lib/utils/formatters'

interface ModuleSalesChartProps {
  data: SalesData[]
  title?: string
  description?: string
  className?: string
}

const moduleColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
]

const moduleNames = {
  spbuSales: 'SPBU',
  gasSales: 'Gas Elpiji',
  oliSales: 'Oli',
  snbSales: 'SnB',
}

export function ModuleSalesChart({
  data,
  title = 'Penjualan per Modul',
  description,
  className,
}: ModuleSalesChartProps) {
  // Calculate totals by module
  const moduleTotals = data.reduce(
    (acc, item) => ({
      spbuSales: acc.spbuSales + item.spbuSales,
      gasSales: acc.gasSales + item.gasSales,
      oliSales: acc.oliSales + item.oliSales,
      snbSales: acc.snbSales + item.snbSales,
    }),
    { spbuSales: 0, gasSales: 0, oliSales: 0, snbSales: 0 }
  )

  const chartData = Object.entries(moduleTotals).map(([key, value], index) => ({
    name: moduleNames[key as keyof typeof moduleNames],
    value: value,
    color: moduleColors[index],
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            Total: {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
