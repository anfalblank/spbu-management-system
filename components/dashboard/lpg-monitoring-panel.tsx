/**
 * LPG Monitoring Panel Component
 * Real-time monitoring of LPG operations and quota
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Package, TrendingUp, AlertTriangle, Users } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useLPGStore } from '@/store'
import type { LPGProductType } from '@/store'

export function LPGMonitoringPanel() {
  const {
    activeSalesAgreements,
    realisasi,
    products,
    todayDeliveries
  } = useLPGStore()

  const today = new Date().toISOString().split('T')[0]
  const todayRealisasi = realisasi.filter((r) => r.deliveryDate === today && r.status === 'delivered')

  // Calculate totals
  const totalQuota = activeSalesAgreements.reduce((sum, sa) => sum + sa.quota, 0)
  const totalRealized = activeSalesAgreements.reduce((sum, sa) => sum + sa.realizedQuota, 0)
  const utilizationRate = totalQuota > 0 ? (totalRealized / totalQuota) * 100 : 0

  const todayVolume = todayRealisasi.reduce((sum, r) => sum + r.quantity, 0)
  const todayRevenue = todayRealisasi.reduce((sum, r) => sum + r.totalPrice, 0)

  // Product type breakdown
  const productTypes: LPGProductType[] = ['3kg', '5.5kg', '12kg', '50kg']
  const productColors: Record<LPGProductType, string> = {
    '3kg': 'bg-sky-500',
    '5.5kg': 'bg-teal-500',
    '12kg': 'bg-purple-500',
    '50kg': 'bg-amber-500',
  }

  const productData = productTypes.map(productType => {
    const product = products.find((p) => p.type === productType)
    const productSAs = activeSalesAgreements.filter((sa) => sa.productType === productType)
    const productRealisasi = todayRealisasi.filter((r) => r.productType === productType)

    const saQuota = productSAs.reduce((sum, sa) => sum + sa.quota, 0)
    const saRealized = productSAs.reduce((sum, sa) => sum + sa.realizedQuota, 0)
    const volume = productRealisasi.reduce((sum, r) => sum + r.quantity, 0)
    const revenue = productRealisasi.reduce((sum, r) => sum + r.totalPrice, 0)

    return {
      productType,
      stock: product?.stock || 0,
      saQuota,
      saRealized,
      utilizationRate: saQuota > 0 ? (saRealized / saQuota) * 100 : 0,
      volume,
      revenue
    }
  })

  // Top customers
  const customerMap = new Map<string, { name: string; volume: number; revenue: number }>()
  realisasi.filter((r) => r.status === 'delivered').forEach((r) => {
    const existing = customerMap.get(r.customerId)
    if (existing) {
      existing.volume += r.quantity
      existing.revenue += r.totalPrice
    } else {
      customerMap.set(r.customerId, { name: r.customerName, volume: r.quantity, revenue: r.totalPrice })
    }
  })

  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Monitoring LPG</h3>
          <p className="text-sm text-muted-foreground">
            {activeSalesAgreements.length} SA Aktif
          </p>
        </div>
        <Badge variant={utilizationRate > 80 ? 'default' : 'secondary'}>
          {utilizationRate.toFixed(1)}% Quota Terpakai
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Pengiriman Hari Ini</p>
                <p className="text-lg font-bold">{todayVolume} unit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pendapatan</p>
                <p className="text-lg font-bold">{formatCurrency(todayRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quota Utilization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Utilisasi Quota SA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Quota</span>
              <span className="font-medium">{totalQuota} unit</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Terealisasi</span>
              <span className="font-medium">{totalRealized} unit</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sisa</span>
              <span className="font-medium">{totalQuota - totalRealized} unit</span>
            </div>
          </div>
          <Progress value={utilizationRate} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {utilizationRate.toFixed(1)}% terpakai
          </p>
        </CardContent>
      </Card>

      {/* Per Product Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Per Jenis Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {productData.map((product) => {
            if (product.saQuota === 0 && product.stock === 0) return null

            return (
              <div key={product.productType} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", productColors[product.productType])} />
                    <span className="font-medium">{product.productType}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.volume} unit</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
                {product.saQuota > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Quota SA</span>
                      <span className={cn(product.utilizationRate >= 90 && "text-amber-600")}>
                        {product.saRealized} / {product.saQuota}
                      </span>
                    </div>
                    <Progress value={product.utilizationRate} className="h-1" />
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Top Pelanggan Bulan Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topCustomers.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-4">
                Belum ada data
              </p>
            ) : (
              topCustomers.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.volume} unit</p>
                  </div>
                  <p className="font-medium ml-2">{formatCurrency(customer.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
