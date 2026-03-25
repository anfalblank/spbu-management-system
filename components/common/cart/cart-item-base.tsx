'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

/**
 * Generic cart item component with quantity controls
 * Can be used across different cart implementations
 */
export interface CartItemBaseProps {
  // Content
  name: string
  description?: string
  image?: ReactNode
  price: number
  quantity: number
  totalPrice?: number

  // Actions
  onIncrement?: () => void
  onDecrement?: () => void
  onRemove?: () => void

  // Constraints
  maxQuantity?: number
  minQuantity?: number
  disableIncrement?: boolean
  disableDecrement?: boolean

  // Display
  priceFormatter?: (price: number) => string
  showImage?: boolean
  showRemoveButton?: boolean
  showQuantityControls?: boolean

  // Custom rendering
  customContent?: ReactNode
  customActions?: ReactNode

  // Styling
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  size?: 'sm' | 'md' | 'lg'
}

export function CartItemBase({
  name,
  description,
  image,
  price,
  quantity,
  totalPrice,
  onIncrement,
  onDecrement,
  onRemove,
  maxQuantity,
  minQuantity = 1,
  disableIncrement = false,
  disableDecrement = false,
  priceFormatter = (price) => `Rp ${price.toLocaleString('id-ID')}`,
  showImage = true,
  showRemoveButton = true,
  showQuantityControls = true,
  customContent,
  customActions,
  className,
  variant = 'default',
  size = 'md',
}: CartItemBaseProps) {
  const canIncrement = !disableIncrement && (!maxQuantity || quantity < maxQuantity)
  const canDecrement = !disableDecrement && quantity > minQuantity
  const calculatedTotal = totalPrice ?? price * quantity

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors',
        variant === 'compact' && 'p-2 gap-2',
        size === 'lg' && 'p-4',
        className
      )}
    >
      {/* Image */}
      {showImage && image && (
        <div className={cn(
          'flex-shrink-0 rounded-lg overflow-hidden bg-muted',
          variant === 'compact' ? 'w-12 h-12' : 'w-16 h-16'
        )}>
          {image}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'font-medium truncate',
          sizeClasses[size]
        )}>
          {name}
        </h4>
        {description && (
          <p className={cn(
            'text-muted-foreground',
            sizeClasses[size]
          )}>
            {description}
          </p>
        )}
        {customContent}
      </div>

      {/* Quantity Controls */}
      {showQuantityControls && (onIncrement || onDecrement) && (
        <div className="flex flex-col items-center gap-1">
          {onIncrement && (
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'h-6 w-6',
                size === 'lg' && 'h-8 w-8'
              )}
              onClick={onIncrement}
              disabled={!canIncrement}
            >
              <Plus className={cn(
                size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'
              )} />
            </Button>
          )}
          <span className={cn(
            'font-medium w-8 text-center',
            sizeClasses[size]
          )}>
            {quantity}
          </span>
          {onDecrement && (
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'h-6 w-6',
                size === 'lg' && 'h-8 w-8'
              )}
              onClick={onDecrement}
              disabled={!canDecrement}
            >
              <Minus className={cn(
                size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'
              )} />
            </Button>
          )}
        </div>
      )}

      {/* Price & Remove */}
      <div className="flex flex-col items-end gap-2">
        {showRemoveButton && onRemove && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'text-muted-foreground hover:text-destructive',
              size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
            )}
            onClick={onRemove}
          >
            <Trash2 className={cn(
              size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'
            )} />
          </Button>
        )}
        <p className={cn(
          'font-semibold',
          size === 'lg' && 'text-lg',
          size === 'md' && 'text-sm',
          size === 'sm' && 'text-xs'
        )}>
          {priceFormatter(calculatedTotal)}
        </p>
        {customActions}
      </div>
    </div>
  )
}
