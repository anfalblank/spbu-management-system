"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fuel, AlertTriangle, TrendingDown } from "lucide-react"
import { getTanks } from "@/lib/api/services"
import { Tank } from "@/lib/api/mock-data"
import { formatVolume } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils/cn"
import { Progress } from "@/components/ui/progress"

export default function StockPage() {
  const [tanks, setTanks] = useState<Tank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTanks()
  }, [])

  const loadTanks = async () => {
    try {
      const data = await getTanks()
      setTanks(data)
    } catch (error) {
      console.error("Failed to load tanks:", error)
    } finally {
      setLoading(false)
    }
  }

  const levelConfig = {
    critical: { label: "Kritis", variant: "destructive" as const, color: "bg-destructive" },
    low: { label: "Rendah", variant: "warning" as const, color: "bg-amber-500" },
    normal: { label: "Normal", variant: "success" as const, color: "bg-emerald-500" },
    full: { label: "Penuh", variant: "default" as const, color: "bg-primary" },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stok BBM</h1>
          <p className="text-muted-foreground">Monitoring level tangki BBM</p>
        </div>
        <Button>
          <Fuel className="h-4 w-4 mr-2" />
          Order BBM
        </Button>
      </div>

      {/* Alert Banner */}
      {tanks.filter((t) => t.level === "critical").length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Peringatan Stok Kritis!</p>
                <p className="text-sm text-muted-foreground">
                  {tanks.filter((t) => t.level === "critical").length} tangki berada pada level kritis.
                  Segera lakukan pemesanan.
                </p>
              </div>
              <Button size="sm" variant="destructive">
                Order Sekarang
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tanks.map((tank) => {
            const level = levelConfig[tank.level]
            const percentage = (tank.currentVolume / tank.capacity) * 100

            return (
              <Card
                key={tank.id}
                className={cn(
                  "transition-all duration-200",
                  tank.level === "critical" && "border-destructive/50 bg-destructive/5"
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tank.product}</CardTitle>
                      <CardDescription>Tangki {tank.id.toUpperCase()}</CardDescription>
                    </div>
                    <Badge variant={level.variant}>{level.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tank Visualization */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                  </div>

                  {/* Volume Info */}
                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Volume Saat Ini</span>
                      <span className="font-bold">{formatVolume(tank.currentVolume)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kapasitas</span>
                      <span>{formatVolume(tank.capacity)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tersedia</span>
                      <span className={cn(
                        "font-medium",
                        tank.level === "critical" && "text-destructive",
                        tank.level === "low" && "text-amber-600"
                      )}>
                        {formatVolume(tank.capacity - tank.currentVolume)}
                      </span>
                    </div>
                  </div>

                  {/* Last Delivery */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingDown className="h-3 w-3" />
                    <span>
                      Pengiriman terakhir: {new Date(tank.lastDelivery).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  {tank.level === "critical" && (
                    <Button size="sm" className="w-full" variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Order BBM
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
