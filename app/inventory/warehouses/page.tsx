"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Warehouse, MapPin, User, ArrowRight } from "lucide-react"
import { getWarehouses } from "@/lib/api/services"
import { Warehouse as WarehouseType } from "@/lib/api/mock-data"
import { formatNumber } from "@/lib/utils/formatters"

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWarehouses()
  }, [])

  const loadWarehouses = async () => {
    try {
      const data = await getWarehouses()
      setWarehouses(data)
    } catch (error) {
      console.error("Failed to load warehouses:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Gudang</h1>
          <p className="text-muted-foreground">Kelola gudang dan kapasitas</p>
        </div>
        <Button>Tambah Gudang</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((warehouse) => {
          const usagePercentage = (warehouse.used / warehouse.capacity) * 100

          return (
            <Card key={warehouse.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {warehouse.location}
                    </div>
                  </div>
                  <Badge variant={usagePercentage > 80 ? "warning" : "success"}>
                    {usagePercentage > 80 ? "Hampir Penuh" : "Tersedia"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Capacity */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Kapasitas</span>
                    <span className="font-medium">
                      {formatNumber(warehouse.used)} / {formatNumber(warehouse.capacity)}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {usagePercentage.toFixed(1)}% terpakai
                  </p>
                </div>

                {/* Manager */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Manager:</span>
                  <span className="font-medium">{warehouse.manager}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Lihat Stok
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
