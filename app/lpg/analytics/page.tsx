"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesChart } from "@/components/charts/sales-chart"
import { ModuleBarChart } from "@/components/charts/bar-chart"
import { TrendingUp, Users, Award } from "lucide-react"
import { getSalesAgreements, getDistributions } from "@/lib/api/services"
import { mockSalesAgreements, mockDistributions } from "@/lib/api/mock-data"
import { formatNumber, formatCurrency } from "@/lib/utils/formatters"

export default function LPGAnalyticsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [])

  // Calculate analytics
  const totalQuota = mockSalesAgreements.reduce((sum, sa) => sum + sa.quota, 0)
  const totalRealized = mockSalesAgreements.reduce((sum, sa) => sum + sa.realized, 0)
  const utilizationRate = (totalRealized / totalQuota) * 100

  const topCustomers = [...mockSalesAgreements]
    .sort((a, b) => b.realized - a.realized)
    .slice(0, 5)

  const dailyDistributions = mockDistributions.reduce((acc, dist) => {
    const date = dist.date.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + dist.quantity
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(dailyDistributions).map(([date, quantity]) => ({
    date,
    total: quantity * 16000, // 16k per tabung
    quantity,
  }))

  const productDistribution = {
    "3kg": mockDistributions.filter(d => d.quantity <= 15).reduce((sum, d) => sum + d.quantity, 0) * 16000,
    "5.5kg": mockDistributions.filter(d => d.quantity > 15 && d.quantity <= 20).reduce((sum, d) => sum + d.quantity, 0) * 65000,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics LPG</h1>
        <p className="text-muted-foreground">Analisis performa penjualan LPG</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Kuota
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalQuota)}</div>
            <p className="text-xs text-muted-foreground mt-1">Tabung</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Terealisasi
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalRealized)}</div>
            <p className="text-xs text-muted-foreground mt-1">Tabung ({utilizationRate.toFixed(1)}%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SA Aktif
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSalesAgreements.filter(sa => sa.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari {mockSalesAgreements.length} total SA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata per SA
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalRealized / mockSalesAgreements.length)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tabung per pelanggan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <SalesChart
          data={chartData}
          title="Distribusi Harian"
          description="Jumlah tabung yang didistribusikan"
        />
        <Card>
          <CardHeader>
            <CardTitle>Top Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{customer.customerName}</p>
                    <p className="text-sm text-muted-foreground">{customer.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatNumber(customer.realized)} tabung</p>
                    <p className="text-xs text-muted-foreground">
                      {((customer.realized / customer.quota) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
