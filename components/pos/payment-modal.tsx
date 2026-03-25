/**
 * Payment Modal Component
 * Handles payment processing with all payment methods
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, Smartphone, CreditCard, Receipt, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useCartSummary } from '@/store'
import { usePOSCheckout, usePOSPayment } from '@/lib/pos'
import { motion } from 'framer-motion'
import type { PaymentMethod } from '@/store/types'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  onComplete: (result: { success: boolean; transactionId?: string }) => void
}

export function PaymentModal({ open, onClose, onComplete }: PaymentModalProps) {
  const { items, subtotal, tax, discount, total } = useCartSummary()
  const {
    startTransaction,
    isProcessing,
    isSuccess,
    error,
    resetTransaction,
  } = usePOSCheckout()

  const {
    paymentMethod,
    paidAmount,
    change,
    remainingAmount,
    isAmountSufficient,
    selectPaymentMethod,
    updatePaidAmount,
  } = usePOSPayment()

  const [amountInput, setAmountInput] = useState('')

  // Auto-set paid amount for non-cash payments
  useEffect(() => {
    if (paymentMethod && paymentMethod !== 'cash') {
      updatePaidAmount(total)
      setAmountInput(total.toString())
    }
  }, [paymentMethod, total])

  const handlePayment = async () => {
    const result = await startTransaction()
    onComplete(result)
  }

  const handleClose = () => {
    if (!isProcessing) {
      resetTransaction()
      setAmountInput('')
      onClose()
    }
  }

  const handleQuickAmount = (amount: number) => {
    const newAmount = total + amount
    const rounded = Math.ceil(newAmount / 1000) * 1000
    setAmountInput(rounded.toString())
    updatePaidAmount(rounded)
  }

  const canComplete = isAmountSufficient && !isProcessing

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {!isSuccess ? (
          <>
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>Pembayaran</DialogTitle>
              <DialogDescription>
                <div className="flex items-center justify-between">
                  <span>Total pembayaran:</span>
                  <span className="ml-2 text-xl font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="px-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col gap-4 px-6">
              {/* Payment Method Tabs */}
              <Tabs value={paymentMethod} onValueChange={(v) => selectPaymentMethod(v as PaymentMethod)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cash" className="gap-2">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">Tunai</span>
                  </TabsTrigger>
                  <TabsTrigger value="qris" className="gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="hidden sm:inline">QRIS</span>
                  </TabsTrigger>
                  <TabsTrigger value="transfer" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden sm:inline">Transfer</span>
                  </TabsTrigger>
                  <TabsTrigger value="voucher" className="gap-2">
                    <Receipt className="h-4 w-4" />
                    <span className="hidden sm:inline">Voucher</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cash" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cash-amount">Jumlah Uang Diterima</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cash-amount"
                        type="number"
                        placeholder="0"
                        value={amountInput}
                        onChange={(e) => {
                          setAmountInput(e.target.value)
                          updatePaidAmount(parseFloat(e.target.value) || 0)
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAmountInput('')
                          updatePaidAmount(0)
                        }}
                      >
                        Reset
                      </Button>
                    </div>

                    {/* Quick amount buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {[10000, 20000, 50000, 100000].map((amt) => (
                        <Button
                          key={amt}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAmount(amt)}
                        >
                          {formatCurrency(amt)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Change display */}
                  {paidAmount > 0 && (
                    <div className={cn(
                      "rounded-lg p-4 border",
                      isAmountSufficient
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-amber-500/10 border-amber-500/20"
                    )}>
                      <p className="text-sm text-muted-foreground">
                        {isAmountSufficient ? 'Kembalian:' : 'Kekurangan:'}
                      </p>
                      <p className={cn(
                        "text-2xl font-bold",
                        isAmountSufficient ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {formatCurrency(Math.abs(change))}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="qris" className="mt-4">
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-4 border-black">
                      <div className="text-center">
                        <Smartphone className="h-16 w-16 mx-auto mb-2" />
                        <p className="font-bold text-sm">QRIS</p>
                        <p className="text-xs text-muted-foreground">Scan untuk bayar</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan QR code menggunakan aplikasi e-wallet atau mobile banking Anda
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="transfer" className="space-y-4 mt-4">
                  <Alert>
                    <Smartphone className="h-4 w-4" />
                    <AlertDescription>
                      Transfer bank ke rekening berikut:
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    <div className="rounded-lg border p-4 space-y-2">
                      <p className="text-sm font-bold">Bank BCA</p>
                      <p className="text-lg font-mono">123-456-7890</p>
                      <p className="text-xs text-muted-foreground">a.n. SPBU Management</p>
                    </div>
                    <div className="rounded-lg border p-4 space-y-2">
                      <p className="text-sm font-bold">Bank Mandiri</p>
                      <p className="text-lg font-mono">987-654-3210</p>
                      <p className="text-xs text-muted-foreground">a.n. SPBU Management</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="voucher" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="voucher-code">Kode Voucher</Label>
                    <Input
                      id="voucher-code"
                      placeholder="Masukkan kode voucher"
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Masukkan kode voucher untuk redeem
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Ringkasan Pesanan</h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2 pr-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="flex-1">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Diskon</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">PPN (11%)</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter className="gap-2 px-6 pb-6">
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Batal
              </Button>
              <Button onClick={handlePayment} disabled={!canComplete || isProcessing} className="min-w-[140px]">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  `Bayar ${formatCurrency(total)}`
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle2 className="h-20 w-20 text-emerald-500" />
            </motion.div>
            <h2 className="text-2xl font-bold mt-4">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground mt-2">Transaksi telah selesai diproses</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
