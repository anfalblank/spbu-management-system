import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ClipboardCheck, BarChart3, ShoppingCart, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils/cn"

const lpgModules = [
  {
    title: "Sales Agreement (Subsidi)",
    description: "Kelola kesepakatan jual pelanggan bersubsidi",
    icon: FileText,
    href: "/lpg/sales-agreement",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Realisasi",
    description: "Input distribusi harian",
    icon: ClipboardCheck,
    href: "/lpg/realization",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Analytics",
    description: "Analisis performa penjualan",
    icon: BarChart3,
    href: "/lpg/analytics",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Non-Subsidi",
    description: "Penjualan non-subsidi",
    icon: ShoppingCart,
    href: "/lpg/non-subsidi",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
]

export default function LPGPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modul Gas Elpiji</h1>
        <p className="text-muted-foreground">Kelola operasional penjualan LPG</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {lpgModules.map((module) => (
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
              SA Aktif
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Dari 5 total SA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Realisasi Hari Ini
            </CardTitle>
            <Badge variant="success" className="text-xs">45 tabung</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 720.000</div>
            <p className="text-xs text-muted-foreground mt-1">5 distribusi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata Harian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 tabung</div>
            <p className="text-xs text-muted-foreground mt-1">Per pelanggan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stok 3kg
            </CardTitle>
            <Badge variant="warning" className="text-xs">Menipis</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground mt-1">Tabung tersedia</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
