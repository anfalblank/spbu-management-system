/**
 * SPBU Monitoring Panel Component
 * Real-time monitoring of SPBU operations
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Gauge, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useSPBUStore } from '@/store'
import type { DispenserStatus, FuelType } from '@/store'

export function SPBUMonitoringPanel() {
  const {
    dispensers,
    tanks,
    tankAlerts,
    currentShift,
    settlements,
    todaySettlements
  } = useSPBUStore()

  const today = new Date().toISOString().split('T')[0]
  const todaySettlementsData = settlements.filter((s) => s.date === today && s.status === 'approved')

  // Calculate totals
  const totalVolume = todaySettlementsData.reduce((sum, s) => sum + s.totalVolume, 0)
  const totalRevenue = todaySettlementsData.reduce((sum, s) => sum + s.totalNetRevenue, 0)

  // Per fuel type breakdown
  const fuelTypes: FuelType[] = ['Pertalite', 'Pertamax', 'Pertamax Turbo', 'Solar', 'Dexlite', 'Dex']
  const fuelColors: Record<FuelType, string> = {
    'Pertalite': 'bg-sky-500',
    'Pertamax': 'bg-teal-500',
    'Pertamax Turbo': 'bg-purple-500',
    'Solar': 'bg-amber-500',
    'Dexlite': 'bg-green-500',
    'Dex': 'bg-emerald-500',
  }

  const fuelData = fuelTypes.map(fuelType => {
    const tank = tanks.find((t) => t.fuelType === fuelType)
    const fuelSettlements = todaySettlementsData.filter(s =>
      s.nozzleData.some(n => n.fuelType === fuelType)
    )
    const volume = fuelSettlements.reduce((sum, s) => {
      const nozzleData = s.nozzleData.find(n => n.fuelType === fuelType)
      return sum + (nozzleData?.volume || 0)
    }, 0)

    return {
      fuelType,
      volume,
      revenue: fuelSettlements.reduce((sum, s) => {
        const nozzleData = s.nozzleData.find(n => n.fuelType === fuelType)
        return sum + (nozzleData?.total || 0)
      }, 0),
      tankLevel: tank ? (tank.currentVolume / tank.capacity) * 100 : 0,
      isAlert: tank ? tankAlerts.includes(tank.id) : false
    }
  })

  // Active dispenser count
  const activeDispensers = dispensers.filter((d) => d.status === 'active').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Monitoring SPBU</h3>
          <p className="text-sm text-muted-foreground">
            {currentShift ? `Shift ${currentShift.number} Aktif` : 'Tidak ada shift aktif'}
          </p>
        </div>
        <Badge variant={currentShift ? 'default' : 'secondary'}>
          {activeDispensers}/{dispensers.length} Dispenser Aktif
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Volume Hari Ini</p>
                <p className="text-lg font-bold">{totalVolume.toFixed(0)} L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pendapatan</p>
                <p className="text-lg font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per Fuel Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Penjualan per Jenis BBM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fuelData.map((fuel) => {
            if (fuel.volume === 0 && fuel.tankLevel === 0) return null

            return (
              <div key={fuel.fuelType} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", fuelColors[fuel.fuelType])} />
                    <span className="font-medium">{fuel.fuelType}</span>
                    {fuel.isAlert && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{fuel.volume.toFixed(0)} L</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(fuel.revenue)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Level Tangki</span>
                    <span className={cn(fuel.tankLevel <= 20 && "text-red-500")}>
                      {fuel.tankLevel.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={fuel.tankLevel} className="h-1" />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Dispenser Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status Dispenser</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {dispensers.map((dispenser) => {
              const isActive = dispenser.status === 'active'
              return (
                <div
                  key={dispenser.id}
                  className={cn(
                    "p-3 rounded-lg border text-center",
                    isActive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/30"
                  )}
                >
                  <p className="font-medium text-sm">{dispenser.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {dispenser.nozzles.length} Nozzle
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-2",
                      isActive ? "bg-emerald-500 text-white border-emerald-500" : ""
                    )}
                  >
                    {isActive ? 'Aktif' : 'Non-Aktif'}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
