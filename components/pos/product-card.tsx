/**
 * Product Card Component
 * Displays a product with add to cart functionality
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Package } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { usePOSProductActions } from '@/lib/pos'
import type { Product } from '@/lib/api/mock-data'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addProduct, isInCart, getProductQuantity } = usePOSProductActions()
  const quantityInCart = getProductQuantity(product.id)

  const stockStatus = product.stock <= product.minStock
    ? 'low'
    : product.stock === 0
    ? 'out'
    : 'normal'

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id)
    } else {
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        module: product.module,
        stock: product.stock,
        image: product.image,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "group hover:shadow-lg transition-all duration-200",
        "hover:border-primary/50",
        quantityInCart > 0 && "border-primary/50 bg-primary/5"
      )}>
        <CardContent className="p-4">
          <div className="flex flex-col h-full gap-3">
            {/* Product Image/Icon */}
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden relative">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs font-medium text-muted-foreground px-2">
                    {product.name.split(' ').slice(0, 2).join(' ')}
                  </p>
                </div>
              )}

              {/* Quantity badge */}
              {quantityInCart > 0 && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {quantityInCart}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm line-clamp-2 flex-1">{product.name}</h3>
                {stockStatus !== 'normal' && (
                  <Badge
                    variant={stockStatus === 'out' ? 'destructive' : 'warning'}
                    className="text-xs flex-shrink-0"
                  >
                    {stockStatus === 'out' ? 'Habis' : 'Stok Rendah'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{product.category || 'Umum'}</p>
            </div>

            {/* Price and Add Button */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-muted-foreground">per {product.unit || 'unit'}</p>
              </div>
              <Button
                size="icon"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={cn(
                  "flex-shrink-0",
                  stockStatus === 'out' && 'invisible'
                )}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Stock indicator */}
            {product.stock > 0 && product.stock <= product.minStock * 2 && (
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    stockStatus === 'low' ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                  style={{
                    width: `${Math.min((product.stock / (product.minStock * 3)) * 100, 100)}%`,
                  }}
                />
              </div>
            )}

            {/* Stock count */}
            {product.stock > 0 && (
              <p className="text-xs text-muted-foreground">
                Stok: {product.stock} {product.unit}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
