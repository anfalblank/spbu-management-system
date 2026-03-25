"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getStockMovements } from "@/lib/api/services"
import { StockMovement } from "@/lib/api/mock-data"
import { formatDateTime } from "@/lib/utils/formatters"
import { Search, ArrowDown, ArrowUp, ArrowRight } from "lucide-react"

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadMovements()
  }, [])

  const loadMovements = async () => {
    try {
      const data = await getStockMovements()
      setMovements(data)
    } catch (error) {
      console.error("Failed to load movements:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = movements.filter((m) =>
    m.productName.toLowerCase().includes(search.toLowerCase()) ||
    m.reference.toLowerCase().includes(search.toLowerCase())
  )

  const typeConfig = {
    in: { label: "Masuk", icon: ArrowDown, variant: "success" as const, color: "text-emerald-500" },
    out: { label: "Keluar", icon: ArrowUp, variant: "destructive" as const, color: "text-destructive" },
    transfer: { label: "Transfer", icon: ArrowRight, variant: "info" as const, color: "text-blue-500" },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pergerakan Stok</h1>
        <p className="text-muted-foreground">Riwayat pergerakan inventaris</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari produk atau referensi..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Movements List */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pergerakan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((movement) => {
              const config = typeConfig[movement.type]
              const Icon = config.icon

              return (
                <div
                  key={movement.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    movement.type === "in" ? "bg-emerald-500/10" :
                    movement.type === "out" ? "bg-destructive/10" :
                    "bg-blue-500/10"
                  }`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{movement.productName}</p>
                      <Badge variant={config.variant} className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ref: {movement.reference}
                      {movement.notes && ` • ${movement.notes}`}
                    </p>
                    {movement.type === "transfer" && (
                      <p className="text-xs text-muted-foreground">
                        {movement.from} → {movement.to}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${movement.type === "out" ? "text-destructive" : "text-emerald-500"}`}>
                      {movement.type === "out" ? "-" : movement.type === "in" ? "+" : ""}{movement.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(movement.date)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
