import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, AlertTriangle, ShoppingCart } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils/cn"

interface SalesPredictionCardProps {
  predictedSales: number
  confidence: number
  period: "tomorrow" | "week"
}

export function SalesPredictionCard({ predictedSales, confidence, period }: SalesPredictionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Prediksi Penjualan
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          {Math.round(confidence * 100)}% akurasi
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(predictedSales)}</p>
            <p className="text-xs text-muted-foreground">
              {period === "tomorrow" ? "Untuk besok" : "Untuk 7 hari ke depan"}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span>Berdasarkan tren historis penjualan</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StockPredictionCardProps {
  productName: string
  currentStock: number
  dailyUsage: number
  daysUntilEmpty: number
  priority: "high" | "medium" | "low"
}

export function StockPredictionCard({
  productName,
  currentStock,
  dailyUsage,
  daysUntilEmpty,
  priority,
}: StockPredictionCardProps) {
  const priorityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  }

  const priorityLabels = {
    high: "Segera Order",
    medium: "Persiapkan Order",
    low: "Stok Aman",
  }

  return (
    <Card className={cn("border-l-4", priority === "high" && "border-l-destructive")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{productName}</CardTitle>
        <Badge variant="outline" className={cn("text-xs", priorityColors[priority])}>
          {priorityLabels[priority]}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stok saat ini:</span>
            <span className="font-medium">{formatNumber(currentStock, 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pemakaian/hari:</span>
            <span className="font-medium">{formatNumber(dailyUsage, 0)}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                "h-4 w-4",
                priority === "high" && "text-destructive",
                priority === "medium" && "text-amber-500",
                priority === "low" && "text-emerald-500"
              )} />
              <p className="text-sm">
                Habis dalam <span className="font-bold">{daysUntilEmpty} hari</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RecommendationCardProps {
  productName: string
  recommendedQty: number
  estimatedCost: number
  onOrder?: () => void
}

export function RecommendationCard({
  productName,
  recommendedQty,
  estimatedCost,
  onOrder,
}: RecommendationCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Rekomendasi Order
        </CardTitle>
        <Badge variant="default" className="text-xs bg-primary">
          AI Suggested
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Produk</p>
            <p className="font-medium">{productName}</p>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Jumlah yang disarankan:</span>
            <span className="font-medium">{formatNumber(recommendedQty, 0)} unit</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimasi biaya:</span>
            <span className="font-bold">{formatCurrency(estimatedCost)}</span>
          </div>
          {onOrder && (
            <Button onClick={onOrder} className="w-full" size="sm">
              Buat Order Sekarang
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
