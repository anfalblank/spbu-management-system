/**
 * LPG Reports Page
 * Displays comprehensive LPG reports and analytics
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, Download, Filter, FileText } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useLPGStore } from '@/store'
import type { LPGProductType, LPGCategory } from '@/store'

const productColors: Record<LPGProductType, string> = {
  '3kg': '#0ea5e9',
  '5.5kg': '#14b8a6',
  '12kg': '#a855f7',
  '50kg': '#f59e0b',
}

const COLORS = ['#0ea5e9', '#14b8a6', '#a855f7', '#f59e0b']

export default function LPGReportsPage() {
  const {
    salesAgreements,
    activeSalesAgreements,
    realisasi,
    reports,
    generateReport,
  } = useLPGStore()

  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [selectedCategory, setSelectedCategory] = useState<LPGCategory>('subsidi')
  const [selectedReport, setSelectedReport] = useState<'overview' | 'quota' | 'sales' | 'customers'>('overview')

  // Generate report when period or category changes
  const handleGenerateReport = () => {
    generateReport(selectedPeriod, selectedCategory)
  }

  // Get delivered realisasi for stats
  const deliveredRealisasi = realisasi.filter((r) => r.status === 'delivered')
  const today = new Date().toISOString().split('T')[0]
  const todayDeliveries = deliveredRealisasi.filter((r) => r.deliveryDate === today)

  // Calculate stats
  const totalVolume = deliveredRealisasi.reduce((sum, r) => sum + r.quantity, 0)
  const totalRevenue = deliveredRealisasi.reduce((sum, r) => sum + r.totalPrice, 0)

  // Calculate quota utilization
  const totalQuota = activeSalesAgreements.reduce((sum, sa) => sum + sa.quota, 0)
  const totalRealized = activeSalesAgreements.reduce((sum, sa) => sum + sa.realizedQuota, 0)
  const utilizationRate = totalQuota > 0 ? (totalRealized / totalQuota) * 100 : 0

  // Per product breakdown
  const productTypes: LPGProductType[] = ['3kg', '5.5kg', '12kg', '50kg']
  const perProductData = productTypes.map((type) => {
    const productRealisasi = deliveredRealisasi.filter((r) => r.productType === type)
    const volume = productRealisasi.reduce((sum, r) => sum + r.quantity, 0)
    const revenue = productRealisasi.reduce((sum, r) => sum + r.totalPrice, 0)
    return {
      name: type,
      volume,
      revenue,
    }
  })

  // Top customers
  const customerMap = new Map<string, { name: string; volume: number; revenue: number }>()
  deliveredRealisasi.forEach((r) => {
    const existing = customerMap.get(r.customerId)
    if (existing) {
      existing.volume += r.quantity
      existing.revenue += r.totalPrice
    } else {
      customerMap.set(r.customerId, {
        name: r.customerName,
        volume: r.quantity,
        revenue: r.totalPrice,
      })
    }
  })
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Mock data for charts
  const monthlyTrend = [
    { month: 'Jan', volume: 450, revenue: 7200000 },
    { month: 'Feb', volume: 520, revenue: 8320000 },
    { month: 'Mar', volume: 580, revenue: 9280000 },
    { month: 'Apr', volume: 610, revenue: 9760000 },
    { month: 'Mei', volume: 650, revenue: 10400000 },
    { month: 'Jun', volume: 720, revenue: 11520000 },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan LPG</h1>
          <p className="text-muted-foreground mt-1">
            Analisis penjualan, quota, dan distribusi LPG
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          <Button variant="outline" onClick={handleGenerateReport}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalVolume}</p>
                <p className="text-xs text-muted-foreground">Unit terkirim</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">Semua waktu</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisasi Quota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{totalRealized} / {totalQuota} unit</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengiriman Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{todayDeliveries.length}</p>
                <p className="text-xs text-muted-foreground">Pengiriman</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={selectedReport} onValueChange={(v) => setSelectedReport(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="quota">Quota</TabsTrigger>
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="customers">Pelanggan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tren Penjualan Bulanan</CardTitle>
                <CardDescription>6 bulan terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="volume" stroke={productColors['3kg']} strokeWidth={2} name="Volume (Unit)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi per Produk</CardTitle>
                <CardDescription>Persentase volume per jenis LPG</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={perProductData.filter((p) => p.volume > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="volume"
                    >
                      {perProductData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quota" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Quota per Sales Agreement</CardTitle>
              <CardDescription>Monitoring quota pelanggan aktif</CardDescription>
            </CardHeader>
            <CardContent>
              {activeSalesAgreements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada Sales Agreement aktif
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4 pr-4">
                    {activeSalesAgreements.map((sa) => {
                      const product = productColors[sa.productType]
                      const utilizationPercentage = (sa.realizedQuota / sa.quota) * 100
                      const isHigh = utilizationPercentage >= 90

                      return (
                        <div key={sa.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{sa.customerName}</p>
                              <p className="text-sm text-muted-foreground">{sa.number} • {sa.productType}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{sa.realizedQuota} / {sa.quota}</p>
                              <p className={cn("text-sm", isHigh ? "text-amber-600" : "text-muted-foreground")}>
                                {utilizationPercentage.toFixed(1)}% terpakai
                              </p>
                            </div>
                          </div>
                          <Progress value={utilizationPercentage} className="h-2" />
                          {isHigh && (
                            <p className="text-xs text-amber-600">
                              ⚠️ Quota hampir habis! Sisa {sa.remainingQuota} unit
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Penjualan per Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis LPG</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Pendapatan</TableHead>
                    <TableHead className="text-right">% Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perProductData.map((product) => {
                    const percentage = totalVolume > 0 ? (product.volume / totalVolume) * 100 : 0
                    return (
                      <TableRow key={product.name}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.volume} unit</TableCell>
                        <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                        <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pelanggan</CardTitle>
              <CardDescription>Berdasarkan nilai transaksi</CardDescription>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada data pelanggan
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Pelanggan</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">Total Transaksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-right">{customer.volume} unit</TableCell>
                        <TableCell className="text-right">{formatCurrency(customer.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengiriman</CardTitle>
          <CardDescription>Pengiriman yang sudah selesai</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveredRealisasi.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada pengiriman selesai
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveredRealisasi.slice(0, 50).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.deliveryDate).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>{item.productType}</TableCell>
                      <TableCell className="text-right">{item.quantity} unit</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
