'use client'

import { Button } from '@/components/ui/button'
import { cn, formatCurrency } from '@/lib/utils'
import { Tag, Receipt, X } from 'lucide-react'
import { ReactNode } from 'react'

/**
 * Generic cart summary component
 * Displays totals and checkout actions
 */
export interface CartSummaryProps {
  // Totals
  subtotal: number
  tax?: number
  taxRate?: number
  taxLabel?: string
  discount?: number
  discountLabel?: string
  total: number

  // Actions
  onCheckout?: () => void
  onClear?: () => void
  onApplyDiscount?: (code: string) => void

  // Display
  currencyFormatter?: (amount: number) => string
  showTax?: boolean
  showDiscount?: boolean
  showClearButton?: boolean
  checkoutLabel?: string
  checkoutDisabled?: boolean

  // Custom content
  beforeSummary?: ReactNode
  afterSummary?: ReactNode
  customActions?: ReactNode

  // Styling
  className?: string
  compact?: boolean
}

export function CartSummary({
  subtotal,
  tax = 0,
  taxRate = 0.11,
  taxLabel = 'PPN (11%)',
  discount = 0,
  discountLabel = 'Diskon',
  total,
  onCheckout,
  onClear,
  onApplyDiscount,
  currencyFormatter = formatCurrency,
  showTax = true,
  showDiscount = true,
  showClearButton = true,
  checkoutLabel = 'Bayar',
  checkoutDisabled = false,
  beforeSummary,
  afterSummary,
  customActions,
  className,
  compact = false,
}: CartSummaryProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {beforeSummary}

      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{currencyFormatter(subtotal)}</span>
      </div>

      {/* Discount */}
      {showDiscount && discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {discountLabel}
          </span>
          <span className="font-medium text-emerald-600">
            -{currencyFormatter(discount)}
          </span>
        </div>
      )}

      {/* Tax */}
      {showTax && tax > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{taxLabel}</span>
          <span className="font-medium">{currencyFormatter(tax)}</span>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-between text-lg font-bold pt-3 border-t">
        <span>Total</span>
        <span className="text-primary">{currencyFormatter(total)}</span>
      </div>

      {afterSummary}

      {/* Actions */}
      <div className={cn('flex gap-2 pt-2', compact && 'pt-0')}>
        {showClearButton && onClear && (
          <Button
            variant="outline"
            className={compact ? 'flex-1' : 'flex-1'}
            onClick={onClear}
            size={compact ? 'sm' : 'default'}
          >
            <X className="h-4 w-4 mr-1" />
            Hapus
          </Button>
        )}
        {onCheckout && (
          <Button
            className="flex-1"
            onClick={onCheckout}
            disabled={checkoutDisabled}
            size={compact ? 'sm' : 'default'}
          >
            <Receipt className="h-4 w-4 mr-1" />
            {checkoutLabel}
          </Button>
        )}
      </div>

      {customActions}
    </div>
  )
}
