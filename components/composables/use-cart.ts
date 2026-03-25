'use client'

import { useCartStore } from '@/store/cart-store'
import { useCallback } from 'react'

/**
 * Enhanced cart hook with additional business logic
 */
export function useCart() {
  const cartStore = useCartStore()

  const addItem = useCallback((item: {
    productId: string
    name: string
    price: number
    quantity: number
    module: string
    unit?: string
    stock?: number
  }) => {
    cartStore.addItem(item)
  }, [cartStore])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    cartStore.updateQuantity(itemId, quantity)
  }, [cartStore])

  const removeItem = useCallback((itemId: string) => {
    cartStore.removeItem(itemId)
  }, [cartStore])

  const clearCart = useCallback(() => {
    cartStore.clearCart()
  }, [cartStore])

  const applyDiscount = useCallback((discount: {
    type: 'percentage' | 'fixed'
    value: number
    code?: string
  }) => {
    cartStore.setDiscount(discount)
  }, [cartStore])

  const removeDiscount = useCallback(() => {
    cartStore.removeDiscount()
  }, [cartStore])

  const validateDiscountCode = useCallback((code: string) => {
    // Mock discount codes
    const discounts: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
      'diskon10': { type: 'percentage', value: 10 },
      'hemat50': { type: 'fixed', value: 50000 },
    }

    return discounts[code.toLowerCase()]
  }, [])

  return {
    // State
    items: cartStore.items,
    discount: cartStore.discount,
    taxRate: cartStore.taxRate,

    // Computed
    subtotal: cartStore.getSubtotal(),
    taxAmount: cartStore.getTaxAmount(),
    discountAmount: cartStore.getDiscountAmount(),
    total: cartStore.getTotal(),
    itemCount: cartStore.getItemCount(),
    isEmpty: cartStore.items.length === 0,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscount,
    removeDiscount,
    validateDiscountCode,
  }
}
