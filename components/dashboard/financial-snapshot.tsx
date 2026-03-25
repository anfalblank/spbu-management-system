/**
 * Financial Snapshot Component
 * Displays financial summary and payment breakdown
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Wallet, CreditCard, Smartphone, Receipt, TrendingUp } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { usePOSStore } from '@/store'

const paymentMethodColors = {
  cash: '#10b981',
  qris: '#3b82f6',
  transfer: '#8b5cf6',
  voucher: '#f59e0b'
}

const paymentMethodLabels = {
  cash: 'Tunai',
  qris: 'QRIS',
  transfer: 'Transfer',
  voucher: 'Voucher'
}

export function FinancialSnapshot() {
  const { transactions } = usePOSStore.getState()

  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = transactions.filter((t) =>
    t.createdAt.startsWith(today)
  )

  // Calculate totals
  const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0)

  // Payment method breakdown
  const paymentBreakdown = todayTransactions.reduce((acc, t) => {
    const method = t.paymentMethod
    acc[method] = (acc[method] || 0) + t.total
    return acc
  }, {} as Record<string, number>)

  const paymentData = Object.entries(paymentBreakdown).map(([method, amount]) => ({
    name: paymentMethodLabels[method as keyof typeof paymentMethodLabels] || method,
    value: amount,
    percentage: (amount / totalRevenue) * 100
  }))

  // Per module breakdown
  const moduleBreakdown = todayTransactions.reduce((acc, t) => {
    t.items.forEach(item => {
      const module = item.module || 'Other'
      acc[module] = (acc[module] || 0) + item.price * item.quantity
    })
    return acc
  }, {} as Record<string, number>)

  const moduleData = Object.entries(moduleBreakdown)
    .filter(([_, amount]) => amount > 0)
    .map(([module, amount]) => ({
      name: module.toUpperCase(),
      value: amount,
      percentage: (amount / totalRevenue) * 100
    }))
    .sort((a, b) => b.value - a.value)

  // Estimated profit (rough calculation - would need actual cost data)
  const estimatedMargin = 0.08 // 8% average margin
  const estimatedProfit = totalRevenue * estimatedMargin

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Snapshot Keuangan</h3>
          <p className="text-sm text-muted-foreground">Hari ini</p>
        </div>
      </div>

      {/* Total Revenue */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
              <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {todayTransactions.length} transaksi
              </p>
            </div>
            <Wallet className="h-12 w-12 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Estimated Profit */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estimasi Laba</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(estimatedProfit)}</p>
              <p className="text-xs text-muted-foreground">~8% margin</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentData.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">
              Belum ada transaksi
            </p>
          ) : (
            <div className="space-y-3">
              {paymentData.map((payment) => {
                const Icon = getPaymentIcon(payment.name)
                return (
                  <div key={payment.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{payment.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(payment.value)}</p>
                      <p className="text-xs text-muted-foreground">{payment.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per Module Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pendapatan per Module</CardTitle>
        </CardHeader>
        <CardContent>
          {moduleData.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">
              Belum ada transaksi
            </p>
          ) : (
            <div className="space-y-3">
              {moduleData.map((module) => (
                <div key={module.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{module.name}</span>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(module.value)}</p>
                      <p className="text-xs text-muted-foreground">{module.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${module.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash vs Non-Cash */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tunai vs Non-Tunai</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentData.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">
              Belum ada transaksi
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm">Tunai</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(paymentBreakdown.cash || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Non-Tunai</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(
                    (paymentBreakdown.qris || 0) +
                    (paymentBreakdown.transfer || 0) +
                    (paymentBreakdown.voucher || 0)
                  )}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rasio Tunai</span>
                  <span className="font-medium">
                    {totalRevenue > 0
                      ? ((paymentBreakdown.cash || 0) / totalRevenue * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getPaymentIcon(method: string) {
  switch (method.toLowerCase()) {
    case 'tunai':
      return Wallet
    case 'qris':
      return Smartphone
    case 'transfer':
      return CreditCard
    case 'voucher':
      return Receipt
    default:
      return Wallet
  }
}
