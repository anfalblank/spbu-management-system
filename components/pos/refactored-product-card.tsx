'use client'

import { ProductCardBase, type ProductCardBaseProps } from '@/components/common'
import { useCart } from '@/components/composables'
import { Product } from '@/lib/api/mock-data'

/**
 * POS-specific product card that wraps the base component
 */
export function POSProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      module: product.module,
      unit: product.unit,
      stock: product.stock,
    })
  }

  const props: ProductCardBaseProps = {
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    stock: product.stock,
    minStock: product.minStock,
    unit: product.unit,
    category: product.category,
    showCategory: true,
    showStock: true,
    showPrice: true,
    showAction: true,
    actionDisabled: product.stock === 0,
    onAction: handleAddToCart,
    size: 'md',
    variant: 'default',
  }

  return <ProductCardBase {...props} />
}
