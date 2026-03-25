/**
 * SPBU Dispenser Management Page
 * Manages dispensers, nozzles, and tank levels
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Gauge, Droplets, AlertTriangle, CheckCircle2, XCircle, Wrench, Plus } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useSPBUStore } from '@/store'
import type { Dispenser, DispenserStatus, NozzleStatus, FuelType } from '@/store'

const statusConfig: Record<DispenserStatus, { label: string; variant: any; icon: any }> = {
  active: { label: 'Aktif', variant: 'default', icon: CheckCircle2 },
  inactive: { label: 'Tidak Aktif', variant: 'secondary', icon: XCircle },
  maintenance: { label: 'Perawatan', variant: 'warning', icon: Wrench },
}

const nozzleStatusConfig: Record<NozzleStatus, { label: string; variant: any }> = {
  active: { label: 'Aktif', variant: 'default' },
  inactive: { label: 'Tidak Aktif', variant: 'secondary' },
  error: { label: 'Error', variant: 'destructive' },
}

const fuelColors: Record<FuelType, string> = {
  'Pertalite': 'bg-sky-500',
  'Pertamax': 'bg-teal-500',
  'Pertamax Turbo': 'bg-purple-500',
  'Solar': 'bg-amber-500',
  'Dexlite': 'bg-green-500',
  'Dex': 'bg-emerald-500',
}

const fuelGradients: Record<FuelType, string> = {
  'Pertalite': 'from-sky-500 to-sky-600',
  'Pertamax': 'from-teal-500 to-teal-600',
  'Pertamax Turbo': 'from-purple-500 to-purple-600',
  'Solar': 'from-amber-500 to-amber-600',
  'Dexlite': 'from-green-500 to-green-600',
  'Dex': 'from-emerald-500 to-emerald-600',
}

export default function DispenserPage() {
  const { dispensers, tanks, tankAlerts, selectedDispenser, setSelectedDispenser } = useSPBUStore()

  const getTankLevel = (fuelType: FuelType) => {
    const tank = tanks.find((t) => t.fuelType === fuelType)
    if (!tank) return null
    const percentage = (tank.currentVolume / tank.capacity) * 100
    return {
      percentage,
      volume: tank.currentVolume,
      capacity: tank.capacity,
      isLow: percentage <= 20,
      isAlert: tankAlerts.includes(tank.id),
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Dispenser</h1>
          <p className="text-muted-foreground mt-1">
            Pantau status dispenser, nozzle, dan level tangki BBM
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Dispenser
        </Button>
      </div>

      {/* Tank Levels */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tanks.map((tank) => {
          const level = getTankLevel(tank.fuelType)
          if (!level) return null

          return (
            <Card key={tank.id} className={cn("relative overflow-hidden", level.isAlert && "border-destructive")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tank.fuelType}</CardTitle>
                  {level.isAlert && (
                    <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
                  )}
                </div>
                <CardDescription>Tangki {tank.number}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tank visualization */}
                <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 bg-gradient-to-t transition-all duration-500",
                      fuelGradients[tank.fuelType]
                    )}
                    style={{ height: `${level.percentage}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg drop-shadow-lg">
                        {level.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tank info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Saat Ini</span>
                    <span className="font-medium">{level.volume.toLocaleString()} Liter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kapasitas</span>
                    <span className="font-medium">{level.capacity.toLocaleString()} Liter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batas Minimum</span>
                    <span className="font-medium">{tank.minVolume.toLocaleString()} Liter</span>
                  </div>
                </div>

                {/* Progress bar */}
                <Progress value={level.percentage} className="h-2" />

                {level.isLow && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Level BBM rendah. Segera lakukan pengisian!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dispensers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dispensers.map((dispenser) => {
          const status = statusConfig[dispenser.status]

          return (
            <Card
              key={dispenser.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                selectedDispenser?.id === dispenser.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedDispenser(dispenser)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className={cn("h-5 w-5", dispenser.status === 'active' ? 'text-primary' : 'text-muted-foreground')} />
                    {dispenser.name}
                  </CardTitle>
                  <Badge variant={status.variant} className="gap-1">
                    <status.icon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
                <CardDescription>
                  {dispenser.location} • {dispenser.nozzles.length} Nozzle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dispenser.nozzles.map((nozzle) => {
                    const nozzleStatus = nozzleStatusConfig[nozzle.status]
                    const tankLevel = getTankLevel(nozzle.fuelType)

                    return (
                      <div
                        key={nozzle.id}
                        className="p-3 rounded-lg border bg-muted/30 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", fuelColors[nozzle.fuelType])} />
                            <span className="font-medium text-sm">Nozzle {nozzle.number}</span>
                          </div>
                          <Badge variant={nozzleStatus.variant} className="text-xs">
                            {nozzleStatus.label}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Jenis BBM</p>
                            <p className="font-medium">{nozzle.fuelType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Harga</p>
                            <p className="font-medium">{formatCurrency(nozzle.pricePerLiter)}</p>
                          </div>
                        </div>
                        {tankLevel && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Level Tangki</span>
                              <span className={cn("font-medium", tankLevel.isLow && "text-destructive")}>
                                {tankLevel.percentage.toFixed(0)}%
                              </span>
                            </div>
                            <Progress value={tankLevel.percentage} className="h-1" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Dispensers */}
      {dispensers.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Gauge className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Belum Ada Dispenser</h3>
              <p className="text-muted-foreground mt-2">
                Tambahkan dispenser untuk memulai operasional SPBU
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
