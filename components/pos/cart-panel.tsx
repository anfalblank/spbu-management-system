"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils/cn"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

interface CartPanelProps {
  onCheckout: () => void
  isOpen: boolean
  onClose: () => void
}

export function CartPanel({ onCheckout, isOpen, onClose }: CartPanelProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTaxAmount,
    getDiscountAmount,
    getTotal,
  } = useCartStore()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Keranjang</h2>
            <Badge variant="secondary">{items.length}</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items */}
        <ScrollArea className="flex-1 p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Keranjang kosong</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tambahkan produk untuk memulai
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border bg-card p-3"
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} / {item.unit}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.module.toUpperCase()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <p className="font-bold text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0
                            updateQuantity(item.id, val)
                          }}
                          className="w-16 h-7 text-center text-sm"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      {item.stock !== undefined && item.stock <= item.quantity * 2 && (
                        <span className="text-xs text-amber-600">
                          Stok tersisa: {item.stock}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-muted/20">
            {/* Subtotal */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>

            {/* Tax */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">PPN (11%)</span>
              <span>{formatCurrency(getTaxAmount())}</span>
            </div>

            {/* Total */}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearCart}
              >
                Kosongkan
              </Button>
              <Button className="flex-1" onClick={onCheckout}>
                Checkout
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}
