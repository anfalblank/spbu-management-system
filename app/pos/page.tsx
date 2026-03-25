/**
 * POS Page
 * Complete POS interface with transaction flow
 */

'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ShoppingCart, X, Fuel, Zap, Droplet, Coffee } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useCartSummary, usePaymentState, useTransactionLock } from '@/store'
import { usePOSCart, usePOSCheckout, usePOSPayment } from '@/lib/pos'
import { ProductGrid } from '@/components/pos/product-grid'
import { CartSidebar } from '@/components/pos/cart-sidebar'
import { PaymentModal } from '@/components/pos/payment-modal'
import { ReceiptModal } from '@/components/pos/receipt-modal'

type POSModule = 'spbu' | 'gas' | 'oli' | 'snb'

const moduleConfig = {
  spbu: {
    label: 'SPBU',
    icon: Fuel,
  },
  gas: {
    label: 'Gas Elpiji',
    icon: Zap,
  },
  oli: {
    label: 'Oli & Pelumas',
    icon: Droplet,
  },
  snb: {
    label: 'SnB',
    icon: Coffee,
  },
}

export default function POSPage() {
  const { user } = useAuth()
  const { items, total, itemCount } = useCartSummary()
  const { canProcess } = usePaymentState()
  const { canModify } = useTransactionLock()

  const [activeModule, setActiveModule] = useState<POSModule>('spbu')
  const [cartOpen, setCartOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null)

  const {
    startTransaction,
    isProcessing,
    isSuccess,
    resetTransaction,
  } = usePOSCheckout()

  const handleCheckout = () => {
    setCartOpen(false)
    setPaymentOpen(true)
  }

  const handlePaymentComplete = async (result: { success: boolean; transactionId?: string }) => {
    setPaymentOpen(false)

    if (result.success && result.transactionId) {
      setLastTransactionId(result.transactionId)
      setReceiptOpen(true)
    }
  }

  const handleReceiptClose = () => {
    setReceiptOpen(false)
    setLastTransactionId(null)
    resetTransaction()
  }

  const currentModule = moduleConfig[activeModule]
  const ModuleIcon = currentModule.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">
            Kasir: {user?.name || 'Tamu'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Cart Summary */}
          <div className="hidden lg:flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl border">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">{itemCount} item</span>
              <span className="text-muted-foreground mx-2">•</span>
              <span className="font-bold">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Mobile Cart Button */}
          <Button
            size="lg"
            onClick={() => setCartOpen(true)}
            className="gap-2 lg:hidden"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Keranjang</span>
            {itemCount > 0 && (
              <span className="ml-1 rounded-full bg-primary-foreground px-2 py-0.5 text-xs font-bold text-primary">
                {itemCount}
              </span>
            )}
          </Button>

          {/* Desktop Checkout Button */}
          <Button
            size="lg"
            onClick={handleCheckout}
            disabled={itemCount === 0 || !canProcess || !canModify}
            className="hidden lg:flex"
          >
            Bayar
          </Button>
        </div>
      </div>

      {/* Module Tabs */}
      <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as POSModule)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="spbu" className="gap-2">
            <Fuel className="h-4 w-4" />
            <span className="hidden sm:inline">SPBU</span>
          </TabsTrigger>
          <TabsTrigger value="gas" className="gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Gas Elpiji</span>
          </TabsTrigger>
          <TabsTrigger value="oli" className="gap-2">
            <Droplet className="h-4 w-4" />
            <span className="hidden sm:inline">Oli</span>
          </TabsTrigger>
          <TabsTrigger value="snb" className="gap-2">
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">SnB</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeModule} className="mt-6">
          <ProductGrid module={activeModule} />
        </TabsContent>
      </Tabs>

      {/* Desktop Cart Panel */}
      <div className="hidden lg:block fixed right-0 top-0 h-[calc(100vh-4rem)] w-96 border-l bg-background shadow-lg">
        <div className="flex flex-col h-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Keranjang</h2>
              {itemCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({itemCount} item)
                </span>
              )}
            </div>
            {itemCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => usePOSCart().clearCart()}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Keranjang kosong</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pilih produk untuk memulai transaksi
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {items.length > 0 && (
            <div className="border-t bg-muted/30 p-4 space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={!canProcess || !canModify}
              >
                {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        transactionId={lastTransactionId}
        onClose={handleReceiptClose}
      />
    </div>
  )
}
