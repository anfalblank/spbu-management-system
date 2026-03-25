'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { ProductGridBase } from '@/components/common/product'
import { CartSummary, PageHeader } from '@/components/common'
import { useProducts, useCart, useModal } from '@/components/composables'
import { POSProductCard } from './refactored-product-card'
import { POSCartItem } from './refactored-cart-item'
import { PaymentModal } from './payment-modal'
import { ReceiptModal } from './receipt-modal'
import { useAuthStore } from '@/store/auth-store'
import { Product, POSModule } from '@/lib/api/mock-data'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { motion, AnimatePresence } from 'framer-motion'

const moduleLabels: Record<POSModule, string> = {
  spbu: 'SPBU',
  gas: 'Gas Elpiji',
  oli: 'Oli & Pelumas',
  snb: 'SnB',
}

/**
 * Refactored POS page using clean architecture
 */
export function RefactoredPOSPage() {
  const [activeModule, setActiveModule] = useState<POSModule>('spbu')
  const [cartOpen, setCartOpen] = useState(false)

  const { user } = useAuthStore()
  const paymentModal = useModal()
  const receiptModal = useModal()

  // Use custom hooks for business logic
  const { products, loading } = useProducts()
  const {
    items,
    subtotal,
    taxAmount,
    discountAmount,
    total,
    itemCount,
    isEmpty,
    clearCart,
  } = useCart()

  // Filter products by module
  const moduleProducts = products.filter(p => p.module === activeModule)

  const handleCheckout = () => {
    if (window.innerWidth < 1024) {
      setCartOpen(false)
    }
    paymentModal.open()
  }

  const handlePaymentComplete = async (paymentData: any) => {
    const transaction = {
      items: paymentData.items,
      total: paymentData.total,
      paymentMethod: paymentData.paymentMethod,
      cashier: user?.name || 'Kasir',
      date: new Date(),
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      amountPaid: paymentData.amountPaid,
      change: paymentData.change,
    }

    // In real app, save to API
    const { createTransaction } = await import('@/lib/api/services')
    const saved = await createTransaction(transaction)

    receiptModal.open({
      ...transaction,
      id: saved.id,
    })

    clearCart()
    paymentModal.close()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Point of Sale"
        description="Kelola transaksi penjualan"
        actions={
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
        }
      />

      {/* Module Tabs */}
      <Tabs value={activeModule} onValueChange={(v) => setActiveModule(v as POSModule)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="spbu">SPBU</TabsTrigger>
          <TabsTrigger value="gas">Gas Elpiji</TabsTrigger>
          <TabsTrigger value="oli">Oli & Pelumas</TabsTrigger>
          <TabsTrigger value="snb">SnB</TabsTrigger>
        </TabsList>

        <TabsContent value={activeModule} className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="p-4 rounded-2xl border bg-card space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : moduleProducts.length === 0 ? (
            <EmptyState
              icon="products"
              title="Tidak ada produk"
              description={`Belum ada produk untuk ${moduleLabels[activeModule]}`}
            />
          ) : (
            <ProductGridBase
              items={moduleProducts}
              renderItem={(product: Product) => <POSProductCard key={product.id} product={product} />}
              searchFields={['name', 'sku']}
              getCategoryLabel={(item) => item.category}
              getCategoryValue={(item) => item.category}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Desktop Cart Panel */}
      <div className="hidden lg:block fixed right-0 top-0 h-full w-96 border-l bg-background shadow-2xl z-30">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Keranjang</h2>
              {itemCount > 0 && (
                <span className="text-sm text-muted-foreground">({itemCount} item)</span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <POSCartItem item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {!isEmpty && (
            <div className="border-t bg-muted/30 p-4">
              <CartSummary
                subtotal={subtotal}
                tax={taxAmount}
                discount={discountAmount}
                total={total}
                onCheckout={handleCheckout}
                onClear={() => {
                  if (confirm('Kosongkan keranjang?')) clearCart()
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModal.isOpen}
        onClose={paymentModal.close}
        onComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptModal.isOpen}
        onClose={receiptModal.close}
        transaction={receiptModal.data}
      />
    </div>
  )
}
