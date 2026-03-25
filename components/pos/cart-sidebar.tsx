/**
 * Cart Sidebar Component
 * Mobile drawer for cart items
 */

'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingCart, X, Tag, Receipt } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useCartSummary } from '@/store'
import { usePOSCart } from '@/lib/pos'
import { motion, AnimatePresence } from 'framer-motion'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const {
    items,
    subtotal,
    tax,
    discount,
    total,
    hasItems,
  } = useCartSummary()

  const { clearCart, removeItem, updateQuantity } = usePOSCart()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-background border-l shadow-2xl",
          "lg:hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Keranjang</h2>
              {itemCount > 0 && (
                <Badge variant="secondary">{itemCount} item</Badge>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!hasItems ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Keranjang kosong</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tambahkan produk untuk memulai
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-background border flex items-center justify-center text-sm font-bold hover:bg-muted"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                        className="w-6 h-6 rounded bg-background border flex items-center justify-center text-sm font-bold hover:bg-muted disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary & Checkout */}
          {hasItems && (
            <div className="border-t bg-muted/30">
              <div className="p-4 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      Diskon
                    </span>
                    <span className="font-medium text-emerald-600">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}

                {/* Tax */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PPN (11%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (confirm('Kosongkan keranjang?')) {
                        clearCart()
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hapus
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={onCheckout}
                  >
                    <Receipt className="h-4 w-4 mr-1" />
                    Bayar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
