'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import { LucideIcon, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

/**
 * Base product card component with configurable rendering
 * Can be used across different modules (POS, Catalog, Inventory, etc.)
 */
export interface ProductCardBaseProps {
  // Identity
  id: string
  name: string
  image?: string
  initials?: string

  // Pricing
  price: number
  showPrice?: boolean
  priceFormatter?: (price: number) => string

  // Stock & Status
  stock?: number
  minStock?: number
  unit?: string
  showStock?: boolean
  stockThresholds?: {
    low: number
    critical: number
  }

  // Category
  category?: string
  showCategory?: boolean

  // Actions
  onAction?: () => void
  actionLabel?: string
  actionIcon?: LucideIcon
  actionDisabled?: boolean
  showAction?: boolean
  secondaryAction?: ReactNode

  // Visual
  imagePlaceholder?: ReactNode
  badges?: Array<{
    text: string
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info'
  }>

  // Styling
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'detailed'
}

export function ProductCardBase({
  name,
  image,
  initials,
  price,
  showPrice = true,
  priceFormatter = formatCurrency,
  stock,
  minStock = 0,
  unit,
  showStock = true,
  stockThresholds = { low: minStock * 2, critical: minStock },
  category,
  showCategory = false,
  onAction,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  actionDisabled = false,
  showAction = true,
  secondaryAction,
  imagePlaceholder,
  badges = [],
  className,
  size = 'md',
  variant = 'default',
}: ProductCardBaseProps) {
  // Determine stock status
  const getStockStatus = () => {
    if (!stock || stock === 0) return 'out'
    if (stock <= stockThresholds.critical) return 'critical'
    if (stock <= stockThresholds.low) return 'low'
    return 'normal'
  }

  const stockStatus = getStockStatus()

  // Auto-generate badges based on stock
  const autoBadges = [...badges]
  if (showStock && stock !== undefined) {
    if (stockStatus === 'out') {
      autoBadges.push({ text: 'Habis', variant: 'destructive' })
    } else if (stockStatus === 'critical' || stockStatus === 'low') {
      autoBadges.push({ text: 'Stok Rendah', variant: 'warning' })
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'group hover:shadow-lg transition-all duration-200 hover:border-primary/50',
          className
        )}
      >
        <CardContent className={cn('p-4', size === 'lg' && 'p-6')}>
          <div className={cn(
            'flex flex-col gap-3',
            variant === 'compact' && 'gap-2'
          )}>
            {/* Image/Icon Section */}
            {variant !== 'compact' && (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : imagePlaceholder ? (
                  imagePlaceholder
                ) : (
                  <div className="text-center">
                    <p className={cn(
                      'font-bold text-muted-foreground/30',
                      size === 'sm' && 'text-2xl',
                      size === 'md' && 'text-3xl',
                      size === 'lg' && 'text-4xl'
                    )}>
                      {initials || name.charAt(0)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Content Section */}
            <div className={cn(
              'flex-1 space-y-1',
              variant === 'compact' && 'space-y-0'
            )}>
              <div className="flex items-start justify-between gap-2">
                <h3 className={cn(
                  'font-medium line-clamp-2',
                  sizeClasses[size]
                )}>
                  {name}
                </h3>
                {autoBadges.length > 0 && (
                  <div className="flex gap-1 flex-shrink-0">
                    {autoBadges.map((badge, idx) => (
                      <Badge
                        key={idx}
                        variant={badge.variant}
                        className="text-xs"
                      >
                        {badge.text}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {showCategory && category && (
                <p className={cn(
                  'text-muted-foreground',
                  sizeClasses[size]
                )}>{category}</p>
              )}
            </div>

            {/* Price & Action Section */}
            {variant !== 'compact' && (
              <div className="flex items-center justify-between pt-2 border-t">
                {showPrice ? (
                  <div>
                    <p className={cn(
                      'font-bold',
                      size === 'sm' && 'text-base',
                      size === 'md' && 'text-lg',
                      size === 'lg' && 'text-xl'
                    )}>
                      {priceFormatter(price)}
                    </p>
                    {unit && (
                      <p className={cn(
                        'text-muted-foreground',
                        sizeClasses[size]
                      )}>
                        per {unit}
                      </p>
                    )}
                  </div>
                ) : (
                  <div />
                )}

                {showAction && onAction && (
                  <Button
                    size={size === 'lg' ? 'lg' : 'icon'}
                    onClick={onAction}
                    disabled={actionDisabled || stockStatus === 'out'}
                    className={cn(
                      'flex-shrink-0',
                      stockStatus === 'out' && 'invisible'
                    )}
                  >
                    {actionLabel ? (
                      <span className="flex items-center gap-2">
                        {actionIcon && <ActionIcon className="h-4 w-4" />}
                        {actionLabel}
                      </span>
                    ) : (
                      <ActionIcon className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Stock Progress Bar */}
            {showStock &&
              stock !== undefined &&
              stock > 0 &&
              stock <= stockThresholds.low * 1.5 && (
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    stockStatus === 'critical' && 'bg-red-500',
                    stockStatus === 'low' && 'bg-amber-500',
                    stockStatus === 'normal' && 'bg-emerald-500'
                  )}
                  style={{
                    width: `${Math.min(
                      (stock / (stockThresholds.low * 2.5)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}

            {/* Secondary Action */}
            {secondaryAction}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
