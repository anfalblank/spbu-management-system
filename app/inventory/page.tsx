import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Warehouse, FileText, ClipboardList, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const inventoryModules = [
  {
    title: "Gudang",
    description: "Kelola multi-warehouse",
    icon: Warehouse,
    href: "/inventory/warehouses",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Pergerakan Stok",
    description: "Riwayat masuk/keluar stok",
    icon: FileText,
    href: "/inventory/movements",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Stock Opname",
    description: "Input hasil stock opname",
    icon: ClipboardList,
    href: "/inventory/stock-opname",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Laporan",
    description: "Laporan inventaris",
    icon: BarChart3,
    href: "/inventory/reports",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventaris</h1>
        <p className="text-muted-foreground">Kelola stok dan gudang</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {inventoryModules.map((module) => (
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
              Total Gudang
            </CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Lokasi aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14,500</div>
            <p className="text-xs text-muted-foreground mt-1">Unit di semua gudang</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 285.4jt</div>
            <p className="text-xs text-muted-foreground mt-1">Total aset inventaris</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Produk perlu restock</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
