"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { getProfitLoss } from "@/lib/api/services"
import { formatCurrency } from "@/lib/utils/formatters"
import { useEffect, useState } from "react"

export default function ProfitLossPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const result = await getProfitLoss()
    setData(result)
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan Laba Rugi</h1>
        <p className="text-muted-foreground">Profit & Loss Statement</p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Laba Bersih</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{formatCurrency(data.netProfit)}</div>
          <p className="text-muted-foreground mt-2">
            Margin laba bersih: <span className="font-semibold">{data.grossMargin.toFixed(2)}%</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Penjualan BBM</span>
              <span className="font-medium">{formatCurrency(data.revenue.penjualanBBM)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Penjualan LPG</span>
              <span className="font-medium">{formatCurrency(data.revenue.penjualanLPG)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Penjualan Oli</span>
              <span className="font-medium">{formatCurrency(data.revenue.penjualanOli)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Penjualan SnB</span>
              <span className="font-medium">{formatCurrency(data.revenue.penjualanSnB)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Total Pendapatan</span>
              <span className="font-bold text-lg">{formatCurrency(data.revenue.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Beban
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Pembelian BBM</span>
              <span className="font-medium">{formatCurrency(data.expenses.pembelianBBM)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Pembelian LPG</span>
              <span className="font-medium">{formatCurrency(data.expenses.pembelianLPG)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Pembelian Oli</span>
              <span className="font-medium">{formatCurrency(data.expenses.pembelianOli)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Pembelian SnB</span>
              <span className="font-medium">{formatCurrency(data.expenses.pembelianSnB)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Gaji Karyawan</span>
              <span className="font-medium">{formatCurrency(data.expenses.gajiKaryawan)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Listrik & Air</span>
              <span className="font-medium">{formatCurrency(data.expenses.listrikDanAir)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Sewa</span>
              <span className="font-medium">{formatCurrency(data.expenses.sewa)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Total Beban</span>
              <span className="font-bold text-lg">{formatCurrency(data.expenses.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Profit */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Laba Rugi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Total Pendapatan</span>
              <span className="font-medium text-emerald-600">{formatCurrency(data.revenue.total)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Total Beban</span>
              <span className="font-medium text-destructive">({formatCurrency(data.expenses.total)})</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-lg">Laba Bersih</span>
              <span className={`font-bold text-2xl ${data.netProfit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {formatCurrency(data.netProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
