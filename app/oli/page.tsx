"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, TrendingUp } from "lucide-react"
import { getProducts } from "@/lib/api/services"
import { Product } from "@/lib/api/mock-data"
import { formatCurrency } from "@/lib/utils/formatters"
import { ProductCard } from "@/components/pos/product-card"
import { useRouter } from "next/navigation"
import { KPICard } from "@/components/cards/kpi-card"
import { Droplets } from "lucide-react"

export default function OLIPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const allProducts = await getProducts()
      const oliProducts = allProducts.filter(p => p.module === "oli")
      setProducts(oliProducts)
    } catch (error) {
      console.error("Failed to load products:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(products.map(p => p.category)))
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oli & Pelumas</h1>
          <p className="text-muted-foreground">Kelola produk oli dan pelumas</p>
        </div>
        <Button onClick={() => router.push("/pos")}>
          <Plus className="h-4 w-4 mr-2" />
          Transaksi Baru
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Produk"
          value={products.length}
          icon={Droplets}
        />
        <KPICard
          title="Total Stok"
          value={`${totalStock} unit`}
        />
        <KPICard
          title="Nilai Stok"
          value={formatCurrency(totalValue)}
        />
        <KPICard
          title="Stok Rendah"
          value={lowStockCount}
          icon={TrendingUp}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="stock">Stok</TabsTrigger>
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="cursor-pointer">Semua</Badge>
            {categories.map(cat => (
              <Badge key={cat} variant="secondary" className="cursor-pointer">{cat}</Badge>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stock" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Stok</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.stock} {product.unit}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.stock <= product.minStock ? (
                          <span className="text-destructive">Stok Rendah</span>
                        ) : (
                          <span className="text-emerald-600">Tersedia</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Penjualan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Data penjualan oli akan ditampilkan di sini
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
