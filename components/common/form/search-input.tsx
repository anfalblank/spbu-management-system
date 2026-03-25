'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, ReactNode } from 'react'

/**
 * Enhanced search input with clear button and optional filters
 */
export interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  showFilters?: boolean
  onFilterClick?: () => void
  filtersActive?: boolean
  leftContent?: ReactNode
  rightContent?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SearchInput({
  value = '',
  onChange,
  placeholder = 'Cari...',
  showFilters = false,
  onFilterClick,
  filtersActive = false,
  leftContent,
  rightContent,
  className,
  size = 'md',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange?.('')
  }

  const hasValue = localValue.length > 0

  return (
    <div className={cn('relative flex gap-2', className)}>
      {leftContent}

      <div className="relative flex-1">
        <Search
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors',
            hasValue && 'text-primary'
          )}
          style={{
            width: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px',
            height: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px',
          }}
        />
        <Input
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className={cn('pl-9', hasValue && 'pr-9')}
          size={size === 'lg' ? 'default' : size}
        />
        {hasValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X
              style={{
                width: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px',
                height: size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px',
              }}
            />
          </button>
        )}
      </div>

      {showFilters && onFilterClick && (
        <Button
          variant={filtersActive ? 'default' : 'outline'}
          size={size === 'lg' ? 'default' : size === 'sm' ? 'sm' : 'default'}
          onClick={onFilterClick}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      )}

      {rightContent}
    </div>
  )
}
