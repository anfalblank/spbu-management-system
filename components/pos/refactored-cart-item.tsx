'use client'

import { CartItemBase, type CartItemBaseProps } from '@/components/common'
import { useCart } from '@/components/composables'
import { CartItem } from '@/store/cart-store'
import { formatCurrency } from '@/lib/utils/formatters'

/**
 * POS-specific cart item that wraps the base component
 */
export function POSCartItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()

  const handleIncrement = () => {
    const maxQuantity = item.stock ?? undefined
    if (maxQuantity && item.quantity >= maxQuantity) return
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  const isOutOfStock = item.stock !== undefined && item.quantity >= item.stock

  const props: CartItemBaseProps = {
    name: item.name,
    description: `${formatCurrency(item.price)} / ${item.unit || 'pcs'}`,
    price: item.price,
    quantity: item.quantity,
    totalPrice: item.price * item.quantity,
    onIncrement: handleIncrement,
    onDecrement: handleDecrement,
    onRemove: handleRemove,
    maxQuantity: item.stock,
    disableIncrement: isOutOfStock,
    showRemoveButton: true,
    showQuantityControls: true,
    priceFormatter: formatCurrency,
    variant: 'default',
    size: 'md',
  }

  return <CartItemBase {...props} />
}
