import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type POSModule = 'spbu' | 'gas' | 'oli' | 'snb'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  module: POSModule
  unit?: string
  stock?: number
}

export interface Discount {
  type: 'percentage' | 'fixed'
  value: number
  code?: string
}

interface CartState {
  items: CartItem[]
  discount: Discount | null
  taxRate: number
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  setDiscount: (discount: Discount) => void
  removeDiscount: () => void
  getSubtotal: () => number
  getTaxAmount: () => number
  getDiscountAmount: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: null,
      taxRate: 0.11, // 11% PPN Indonesia

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.module === item.module
        )

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({
            items: [...items, { ...item, id: `cart-${Date.now()}-${Math.random()}` }],
          })
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => {
        set({ items: [], discount: null })
      },

      setDiscount: (discount) => {
        set({ discount })
      },

      removeDiscount: () => {
        set({ discount: null })
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal()
        const discountAmount = get().getDiscountAmount()
        return Math.max(0, subtotal - discountAmount) * get().taxRate
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal()
        const discount = get().discount
        if (!discount) return 0

        if (discount.type === 'percentage') {
          return subtotal * (discount.value / 100)
        }
        return Math.min(discount.value, subtotal)
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const taxAmount = get().getTaxAmount()
        const discountAmount = get().getDiscountAmount()
        return subtotal + taxAmount - discountAmount
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
