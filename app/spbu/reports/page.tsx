/**
 * SPBU Reports Page
 * Displays comprehensive SPBU reports and analytics
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Gauge, Calendar, Download, Filter } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useSPBUStore } from '@/store'
import type { FuelType } from '@/store'

const fuelColors: Record<FuelType, string> = {
  'Pertalite': '#0ea5e9',
  'Pertamax': '#14b8a6',
  'Pertamax Turbo': '#a855f7',
  'Solar': '#f59e0b',
  'Dexlite': '#22c55e',
  'Dex': '#10b981',
}

const COLORS = ['#0ea5e9', '#14b8a6', '#a855f7', '#f59e0b', '#22c55e', '#10b981']

export default function SPBUReportsPage() {
  const { settlements, shifts, dispensers, tanks } = useSPBUStore()

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [selectedReport, setSelectedReport] = useState<'sales' | 'shift' | 'dispenser' | 'fuel'>('sales')

  // Mock data for charts - in real app, this would come from API
  const salesData = [
    { date: '01', Pertalite: 450, Pertamax: 320, Solar: 280 },
    { date: '02', Pertalite: 520, Pertamax: 380, Solar: 310 },
    { date: '03', Pertalite: 480, Pertamax: 350, Solar: 290 },
    { date: '04', Pertalite: 550, Pertamax: 400, Solar: 330 },
    { date: '05', Pertalite: 600, Pertamax: 420, Solar: 350 },
    { date: '06', Pertalite: 580, Pertamax: 390, Solar: 340 },
    { date: '07', Pertalite: 620, Pertamax: 450, Solar: 370 },
  ]

  const fuelDistribution = [
    { name: 'Pertalite', value: 35, sales: 3800000 },
    { name: 'Pertamax', value: 25, sales: 2710000 },
    { name: 'Solar', value: 20, sales: 1700000 },
    { name: 'Pertamax Turbo', value: 12, sales: 1596000 },
    { name: 'Dexlite', value: 5, sales: 590000 },
    { name: 'Dex', value: 3, sales: 354000 },
  ]

  const shiftData = [
    { shift: 'Shift 1', volume: 1250, revenue: 13750000 },
    { shift: 'Shift 2', volume: 1580, revenue: 17380000 },
    { shift: 'Shift 3', volume: 980, revenue: 10780000 },
  ]

  const dispenserData = [
    { name: 'Dispenser 1', volume: 2680, revenue: 29480000 },
    { name: 'Dispenser 2', volume: 2340, revenue: 25740000 },
    { name: 'Dispenser 3', volume: 1890, revenue: 20790000 },
    { name: 'Dispenser 4', volume: 1560, revenue: 17160000 },
  ]

  const today = new Date().toISOString().split('T')[0]
  const todaySettlements = settlements.filter((s) => s.date === today && s.status === 'approved')

  const totalVolume = todaySettlements.reduce((sum, s) => sum + s.totalVolume, 0)
  const totalRevenue = todaySettlements.reduce((sum, s) => sum + s.totalNetRevenue, 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan SPBU</h1>
          <p className="text-muted-foreground mt-1">
            Analisis penjualan, performa shift, dan penggunaan BBM
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
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
                <p className="text-2xl font-bold">{totalVolume.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Liter hari ini</p>
              </div>
              <Gauge className="h-8 w-8 text-primary" />
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
                <p className="text-xs text-muted-foreground">Hari ini</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{todaySettlements.length}</p>
                <p className="text-xs text-muted-foreground">Settlement hari ini</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {totalVolume > 0 ? (totalRevenue / totalVolume).toFixed(0) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Rp/liter</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={selectedReport} onValueChange={(v) => setSelectedReport(v as any)}>
        <TabsList>
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="shift">Per Shift</TabsTrigger>
          <TabsTrigger value="dispenser">Per Dispenser</TabsTrigger>
          <TabsTrigger value="fuel">Jenis BBM</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tren Penjualan Harian</CardTitle>
              <CardDescription>7 hari terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Pertalite" stroke={fuelColors['Pertalite']} strokeWidth={2} />
                  <Line type="monotone" dataKey="Pertamax" stroke={fuelColors['Pertamax']} strokeWidth={2} />
                  <Line type="monotone" dataKey="Solar" stroke={fuelColors['Solar']} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shift" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performa per Shift</CardTitle>
                <CardDescription>Volume dan pendapatan per shift</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={shiftData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shift" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="volume" fill={fuelColors['Pertalite']} name="Volume (Liter)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pendapatan per Shift</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shift</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">Pendapatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shiftData.map((shift) => (
                      <TableRow key={shift.shift}>
                        <TableCell className="font-medium">{shift.shift}</TableCell>
                        <TableCell className="text-right">{shift.volume.toLocaleString()} L</TableCell>
                        <TableCell className="text-right">{formatCurrency(shift.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dispenser" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performa per Dispenser</CardTitle>
              <CardDescription>Perbandingan volume penjualan antar dispenser</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dispenserData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" fill={fuelColors['Pertamax']} name="Volume (Liter)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail per Dispenser</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dispenser</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Pendapatan</TableHead>
                    <TableHead className="text-right">% Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispenserData.map((dispenser) => {
                    const totalVolume = dispenserData.reduce((sum, d) => sum + d.volume, 0)
                    const percentage = (dispenser.volume / totalVolume) * 100

                    return (
                      <TableRow key={dispenser.name}>
                        <TableCell className="font-medium">{dispenser.name}</TableCell>
                        <TableCell className="text-right">{dispenser.volume.toLocaleString()} L</TableCell>
                        <TableCell className="text-right">{formatCurrency(dispenser.revenue)}</TableCell>
                        <TableCell className="text-right">{percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Jenis BBM</CardTitle>
                <CardDescription>Persentase penjualan per jenis BBM</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={fuelDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fuelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pendapatan per Jenis BBM</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis BBM</TableHead>
                      <TableHead className="text-right">% Vol</TableHead>
                      <TableHead className="text-right">Pendapatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fuelDistribution.map((fuel) => (
                      <TableRow key={fuel.name}>
                        <TableCell className="font-medium">{fuel.name}</TableCell>
                        <TableCell className="text-right">{fuel.value}%</TableCell>
                        <TableCell className="text-right">{formatCurrency(fuel.sales)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Settlement History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Settlement</CardTitle>
          <CardDescription>Settlement yang sudah disetujui</CardDescription>
        </CardHeader>
        <CardContent>
          {settlements.filter((s) => s.status === 'approved').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada settlement yang disetujui
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Dispenser</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Pendapatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements
                    .filter((s) => s.status === 'approved')
                    .slice(0, 20)
                    .map((settlement) => (
                      <TableRow key={settlement.id}>
                        <TableCell>{settlement.date}</TableCell>
                        <TableCell>Shift {settlement.shiftNumber}</TableCell>
                        <TableCell>{settlement.dispenserName}</TableCell>
                        <TableCell className="text-right">{settlement.totalVolume.toFixed(2)} L</TableCell>
                        <TableCell className="text-right">{formatCurrency(settlement.totalNetRevenue)}</TableCell>
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
