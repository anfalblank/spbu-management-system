'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Generic quantity selector component
 */
export interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'minimal'
  showButtons?: boolean
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  size = 'md',
  variant = 'default',
  showButtons = true,
  className,
}: QuantitySelectorProps) {
  const canDecrement = value > min
  const canIncrement = max === undefined || value < max

  const handleDecrement = () => {
    if (canDecrement && !disabled) {
      onChange(Math.max(min, value - step))
    }
  }

  const handleIncrement = () => {
    if (canIncrement && !disabled) {
      onChange(max === undefined ? value + step : Math.min(max, value + step))
    }
  }

  const handleDirectChange = (newValue: string) => {
    const numValue = parseInt(newValue, 10)
    if (!isNaN(numValue)) {
      onChange(Math.max(min, Math.min(max ?? Infinity, numValue)))
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  }

  const inputSizeClasses = {
    sm: 'h-8 w-16 text-sm',
    md: 'h-10 w-20 text-base',
    lg: 'h-12 w-24 text-lg',
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center', className)}>
        {showButtons && (
          <Button
            size="icon"
            variant="ghost"
            className={sizeClasses[size]}
            onClick={handleDecrement}
            disabled={!canDecrement || disabled}
          >
            <Minus className="h-3 w-3" />
          </Button>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => handleDirectChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'mx-2 text-center border-0 bg-transparent font-medium focus:ring-0',
            size === 'sm' && 'text-sm w-12',
            size === 'md' && 'text-base w-16',
            size === 'lg' && 'text-lg w-20'
          )}
          min={min}
          max={max}
          step={step}
        />
        {showButtons && (
          <Button
            size="icon"
            variant="ghost"
            className={sizeClasses[size]}
            onClick={handleIncrement}
            disabled={!canIncrement || disabled}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {showButtons && (
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={handleDecrement}
            disabled={!canDecrement || disabled}
          >
            <Minus className="h-3 w-3" />
          </Button>
        )}
        <span className={cn('font-medium w-12 text-center', sizeClasses[size])}>
          {value}
        </span>
        {showButtons && (
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={handleIncrement}
            disabled={!canIncrement || disabled}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showButtons && (
        <Button
          size="icon"
          variant="outline"
          className={sizeClasses[size]}
          onClick={handleDecrement}
          disabled={!canDecrement || disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => handleDirectChange(e.target.value)}
        disabled={disabled}
        className={cn(
          inputSizeClasses[size],
          'text-center border rounded-lg font-medium focus:ring-2 focus:ring-ring'
        )}
        min={min}
        max={max}
        step={step}
      />
      {showButtons && (
        <Button
          size="icon"
          variant="outline"
          className={sizeClasses[size]}
          onClick={handleIncrement}
          disabled={!canIncrement || disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
