"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBalanceSheet } from "@/lib/api/services"
import { formatCurrency } from "@/lib/utils/formatters"

export default function BalanceSheetPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const result = await getBalanceSheet()
    setData(result)
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Neraca</h1>
        <p className="text-muted-foreground">Balance Sheet</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle>Aset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Assets */}
            <div>
              <h3 className="font-semibold mb-3">Aset Lancar</h3>
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kas</span>
                  <span>{formatCurrency(data.assets.currentAssets.kas)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bank</span>
                  <span>{formatCurrency(data.assets.currentAssets.bank)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Piutang</span>
                  <span>{formatCurrency(data.assets.currentAssets.piutang)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Persediaan</span>
                  <span>{formatCurrency(data.assets.currentAssets.persediaan)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Aset Lancar</span>
                  <span>{formatCurrency(data.assets.currentAssets.total)}</span>
                </div>
              </div>
            </div>

            {/* Fixed Assets */}
            <div>
              <h3 className="font-semibold mb-3">Aset Tetap</h3>
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tanah</span>
                  <span>{formatCurrency(data.assets.fixedAssets.tanah)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bangunan</span>
                  <span>{formatCurrency(data.assets.fixedAssets.bangunan)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peralatan</span>
                  <span>{formatCurrency(data.assets.fixedAssets.peralatan)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kendaraan</span>
                  <span>{formatCurrency(data.assets.fixedAssets.kendaraan)}</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span className="text-muted-foreground">Akum. Penyusutan</span>
                  <span>({formatCurrency(Math.abs(data.assets.fixedAssets.akumPenyusutan))})</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Aset Tetap</span>
                  <span>{formatCurrency(data.assets.fixedAssets.total)}</span>
                </div>
              </div>
            </div>

            {/* Total Assets */}
            <div className="flex justify-between items-center pt-4 border-t-2">
              <span className="font-bold text-lg">Total Aset</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(data.assets.total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Liabilities & Equity */}
        <Card>
          <CardHeader>
            <CardTitle>Kewajiban & Ekuitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Liabilities */}
            <div>
              <h3 className="font-semibold mb-3">Kewajiban Lancar</h3>
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hutang Dagang</span>
                  <span>{formatCurrency(data.liabilities.currentLiabilities.hutangDagang)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hutang Bank</span>
                  <span>{formatCurrency(data.liabilities.currentLiabilities.hutangBank)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Kewajiban Lancar</span>
                  <span>{formatCurrency(data.liabilities.currentLiabilities.total)}</span>
                </div>
              </div>
            </div>

            {/* Long Term Liabilities */}
            <div>
              <h3 className="font-semibold mb-3">Kewajiban Jangka Panjang</h3>
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hutang Bank JKP</span>
                  <span>{formatCurrency(data.liabilities.longTermLiabilities.hutangBankJangkaPanjang)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Kewajiban JKP</span>
                  <span>{formatCurrency(data.liabilities.longTermLiabilities.total)}</span>
                </div>
              </div>
            </div>

            {/* Equity */}
            <div>
              <h3 className="font-semibold mb-3">Ekuitas</h3>
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Modal</span>
                  <span>{formatCurrency(data.equity.modal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Laba Ditahan</span>
                  <span>{formatCurrency(data.equity.labaDitahan)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total Ekuitas</span>
                  <span>{formatCurrency(data.equity.total)}</span>
                </div>
              </div>
            </div>

            {/* Total Liabilities & Equity */}
            <div className="flex justify-between items-center pt-4 border-t-2">
              <span className="font-bold text-lg">Total Kewajiban & Ekuitas</span>
              <span className="font-bold text-xl text-primary">{formatCurrency(data.liabilities.total + data.equity.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
