'use client'

import { useState, useMemo, ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Generic product grid with search and category filtering
 * Can be used across different modules with custom renderers
 */
export interface ProductGridBaseProps<T> {
  // Data
  items: T[]
  renderItem: (item: T) => ReactNode

  // Search & Filter
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: (keyof T)[]
  filterable?: boolean
  getCategoryLabel?: (item: T) => string
  getCategoryValue?: (item: T) => string

  // Layout
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
    xl?: number
  }
  gap?: string

  // Empty State
  emptyState?: ReactNode
  noResultsState?: ReactNode

  // Styling
  className?: string
  showItemCount?: boolean

  // Callbacks
  onSearchChange?: (query: string) => void
  onCategoryChange?: (category: string) => void
}

export function ProductGridBase<T extends Record<string, any>>({
  items,
  renderItem,
  searchable = true,
  searchPlaceholder = 'Cari produk...',
  searchFields = ['name', 'sku'],
  filterable = true,
  getCategoryLabel = (item) => item.category || '',
  getCategoryValue = (item) => item.category || '',
  columns = { mobile: 2, tablet: 3, desktop: 4, xl: 5 },
  gap = 'gap-4',
  emptyState,
  noResultsState,
  className,
  showItemCount = true,
  onSearchChange,
  onCategoryChange,
}: ProductGridBaseProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach(item => {
      const category = getCategoryValue(item)
      if (category) cats.add(category)
    })
    return ['all', ...Array.from(cats)]
  }, [items, getCategoryValue])

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        getCategoryValue(item) === selectedCategory

      // Search filter
      const matchesSearch =
        !searchQuery ||
        searchFields.some(field => {
          const value = item[field]
          return (
            value &&
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
          )
        })

      return matchesCategory && matchesSearch
    })
  }, [items, searchQuery, selectedCategory, searchFields, getCategoryValue])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    onSearchChange?.(query)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    onCategoryChange?.(category)
  }

  const handleClearSearch = () => {
    handleSearchChange('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {filterable && categories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map(category => {
                const label =
                  category === 'all' ? 'Semua' : getCategoryLabel({ category } as T)
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Products Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          {searchQuery || selectedCategory !== 'all' ? (
            noResultsState || (
              <div className="text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Tidak ada hasil yang ditemukan
                </p>
              </div>
            )
          ) : (
            emptyState || (
              <div className="text-center">
                <p className="text-muted-foreground">Tidak ada data</p>
              </div>
            )
          )}
        </div>
      ) : (
        <div
          className={cn(
            'grid overflow-y-auto',
            `grid-cols-${columns.mobile}`,
            `sm:grid-cols-${columns.tablet}`,
            `lg:grid-cols-${columns.desktop}`,
            `xl:grid-cols-${columns.xl}`,
            gap
          )}
        >
          {filteredItems.map((item, index) => (
            <div key={item.id || index}>{renderItem(item)}</div>
          ))}
        </div>
      )}

      {/* Item count */}
      {showItemCount && items.length > 0 && (
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground text-center">
          Menampilkan {filteredItems.length} dari {items.length} item
        </div>
      )}
    </div>
  )
}
