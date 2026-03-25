/**
 * Product Grid Component
 * Displays products in a grid with search and filter
 */

'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Grid3x3 } from 'lucide-react'
import { useProducts, usePOSProductActions } from '@/lib/hooks'
import { ProductCard } from './product-card'
import type { POSModule } from '@/app/pos/page'

interface ProductGridProps {
  module: POSModule
}

export function ProductGrid({ module }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Fetch products for this module
  const { products, isLoading } = useProducts({
    module,
  })

  const { addProduct } = usePOSProductActions()

  // Get unique categories
  const categories = useMemo(() => {
    if (!products) return ['all']
    const cats = ['all', ...new Set(products.map(p => p.category || 'Umum'))]
    return cats
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return []

    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory ||
        (!product.category && selectedCategory === 'Umum')
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const handleAddProduct = (productId: string) => {
    const product = products?.find(p => p.id === productId)
    if (product) {
      addProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        module: product.module as any,
        stock: product.stock,
        image: product.image,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border bg-card space-y-3">
            <div className="aspect-square w-full bg-muted animate-pulse rounded-lg" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category === 'all' ? 'Semua' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Grid3x3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Tidak ada produk yang ditemukan' : 'Tidak ada produk untuk kategori ini'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto pb-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddProduct(product.id)}
            />
          ))}
        </div>
      )}

      {/* Product count */}
      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground text-center">
        Menampilkan {filteredProducts.length} dari {products?.length || 0} produk
      </div>
    </div>
  )
}
