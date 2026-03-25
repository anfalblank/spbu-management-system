"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils/formatters"

interface BarChartProps {
  data: Record<string, number | string>
  title?: string
  description?: string
  colors?: string[]
}

const defaultColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

const moduleLabels: Record<string, string> = {
  spbuSales: "SPBU",
  gasSales: "Gas Elpiji",
  oliSales: "Oli & Pelumas",
  snbSales: "SnB",
}

export function ModuleBarChart({ data, title, description, colors = defaultColors }: BarChartProps) {
  const chartData = Object.entries(data)
    .filter(([key]) => key !== "date" && key !== "total" && key !== "transactions")
    .map(([key, value]) => ({
      name: moduleLabels[key] || key,
      value: typeof value === "number" ? value : 0,
      originalKey: key,
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Total: {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Penjualan per Modul"}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
