'use client'

import { CartItem } from '@/store/cart-store'
import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface CartItemComponentProps {
  item: CartItem
}

export function CartItemComponent({ item }: CartItemComponentProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const handleIncrement = () => {
    if (item.stock && item.quantity >= item.stock) {
      return // Don't exceed available stock
    }
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  const isOutOfStock = item.stock !== undefined && item.quantity >= item.stock
  const itemTotal = item.price * item.quantity

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      {/* Quantity Controls */}
      <div className="flex flex-col items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={handleIncrement}
          disabled={isOutOfStock}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={handleDecrement}
        >
          <Minus className="h-3 w-3" />
        </Button>
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{item.name}</h4>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(item.price)} / {item.unit}
        </p>
        {isOutOfStock && (
          <p className="text-xs text-red-500 mt-1">Stok maksimal tercapai</p>
        )}
      </div>

      {/* Remove & Total */}
      <div className="flex flex-col items-end gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
        <p className="text-sm font-semibold">{formatCurrency(itemTotal)}</p>
      </div>
    </div>
  )
}
