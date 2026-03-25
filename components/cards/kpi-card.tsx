import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils/cn"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon?: LucideIcon
  className?: string
}

export function KPICard({ title, value, change, icon: Icon, className }: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      return val.toLocaleString("id-ID")
    }
    return val
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {change > 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : change < 0 ? (
              <TrendingDown className="h-3 w-3 text-destructive" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span className={cn(
              change > 0 && "text-emerald-500",
              change < 0 && "text-destructive"
            )}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
            <span> dari kemarin</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
