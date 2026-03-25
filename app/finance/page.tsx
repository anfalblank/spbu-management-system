import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, BookOpen, TrendingUp, Scale, Wallet } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { formatCurrency } from "@/lib/utils/formatters"
import { profitLossData, balanceSheetData } from "@/lib/api/mock-data"

const financeModules = [
  {
    title: "Jurnal Umum",
    description: "Catat transaksi keuangan",
    icon: BookOpen,
    href: "/finance/journal",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Buku Besar",
    description: "Ledger per akun",
    icon: FileText,
    href: "/finance/ledger",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Laporan Laba Rugi",
    description: "Profit & Loss statement",
    icon: TrendingUp,
    href: "/finance/profit-loss",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Neraca",
    description: "Scale sheet",
    icon: Scale,
    href: "/finance/balance-sheet",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Arus Kas",
    description: "Cash flow statement",
    icon: Wallet,
    href: "/finance/cash-flow",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
]

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
        <p className="text-muted-foreground">Kelola laporan dan transaksi keuangan</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {financeModules.map((module) => (
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
              Pendapatan Bersih
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitLossData.netProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">{profitLossData.grossMargin}% margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitLossData.revenue.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profitLossData.expenses.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Aset
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balanceSheetData.assets.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">Neraca</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
