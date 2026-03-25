"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, TrendingDown, Building2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/formatters"

export default function CashFlowPage() {
  // Mock cash flow data
  const cashFlowData = {
    operating: {
      received: 450000000,
      paid: 350000000,
    },
    investing: {
      received: 0,
      paid: 50000000,
    },
    financing: {
      received: 100000000,
      paid: 150000000,
    },
  }

  const netCash = cashFlowData.operating.received - cashFlowData.operating.paid +
    cashFlowData.investing.received - cashFlowData.investing.paid +
    cashFlowData.financing.received - cashFlowData.financing.paid

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Arus Kas</h1>
        <p className="text-muted-foreground">Cash Flow Statement</p>
      </div>

      {/* Net Cash Position */}
      <Card className={`bg-gradient-to-br ${netCash >= 0 ? "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" : "from-destructive/10 to-destructive/5 border-destructive/20"}`}>
        <CardHeader>
          <CardTitle>Posisi Kas Bersih</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${netCash >= 0 ? "text-emerald-600" : "text-destructive"}`}>
            {formatCurrency(Math.abs(netCash))}
          </div>
          <p className="text-muted-foreground mt-2">
            {netCash >= 0 ? "Surplus kas" : "Defisit kas"}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Operating Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              Aktivitas Operasional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Penerimaan dari Pelanggan</span>
              <span className="font-medium text-emerald-600">+{formatCurrency(cashFlowData.operating.received)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Pembayaran ke Pemasok</span>
              <span className="font-medium text-destructive">-{formatCurrency(cashFlowData.operating.paid)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Arus Kas Bersih Operasional</span>
              <span className={`font-bold text-lg ${(cashFlowData.operating.received - cashFlowData.operating.paid) >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {formatCurrency(Math.abs(cashFlowData.operating.received - cashFlowData.operating.paid))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Investing Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Aktivitas Investasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Pembelian Aset Tetap</span>
              <span className="font-medium text-destructive">-{formatCurrency(cashFlowData.investing.paid)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Arus Kas Bersih Investasi</span>
              <span className={`font-bold text-lg ${(cashFlowData.investing.received - cashFlowData.investing.paid) >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {formatCurrency(Math.abs(cashFlowData.investing.received - cashFlowData.investing.paid))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Financing Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-amber-500" />
              Aktivitas Pendanaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Penerimaan Pinjaman</span>
              <span className="font-medium text-emerald-600">+{formatCurrency(cashFlowData.financing.received)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Pembayaran Pinjaman</span>
              <span className="font-medium text-destructive">-{formatCurrency(cashFlowData.financing.paid)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Arus Kas Bersih Pendanaan</span>
              <span className={`font-bold text-lg ${(cashFlowData.financing.received - cashFlowData.financing.paid) >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {formatCurrency(Math.abs(cashFlowData.financing.received - cashFlowData.financing.paid))}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
