"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Fuel, Gauge, Wrench, BarChart3, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"

const spbuModules = [
  {
    title: "Dispenser",
    description: "Kelola dispenser dan nozzle",
    icon: Gauge,
    href: "/spbu/dispenser",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Settlement Shift",
    description: "Input meter in/out dan hitung penjualan",
    icon: Wrench,
    href: "/spbu/settlement",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Stok BBM",
    description: "Monitoring level tangki BBM",
    icon: Fuel,
    href: "/spbu/stock",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Laporan",
    description: "Laporan penjualan dan analisis",
    icon: BarChart3,
    href: "/spbu/reports",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

export default function SPBUPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modul SPBU</h1>
        <p className="text-muted-foreground">Kelola operasional SPBU</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {spbuModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer h-full">
              <CardHeader>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", module.bgColor)}>
                  <module.icon className={cn("h-6 w-6", module.color)} />
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Penjualan Hari Ini
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 11.992.500</div>
            <p className="text-xs text-muted-foreground mt-1">+12.5% dari kemarin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volume Terjual
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.245 L</div>
            <p className="text-xs text-muted-foreground mt-1">Dari 5 dispenser aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transaksi
            </CardTitle>
            <Badge variant="secondary" className="text-xs">247</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-1">Transaksi SPBU hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata/Liter
            </CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 9.632</div>
            <p className="text-xs text-muted-foreground mt-1">Per liter terjual</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
