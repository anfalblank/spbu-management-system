import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import {
  FileX,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Search,
} from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: "empty" | "products" | "orders" | "users" | "analytics" | "search"
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const icons = {
  empty: FileX,
  products: Package,
  orders: ShoppingCart,
  users: Users,
  analytics: BarChart3,
  search: Search,
}

const defaultMessages = {
  empty: {
    title: "Tidak ada data",
    description: "Belum ada data yang tersedia saat ini.",
  },
  products: {
    title: "Tidak ada produk",
    description: "Belum ada produk yang tersedia. Silakan tambahkan produk baru.",
  },
  orders: {
    title: "Tidak ada pesanan",
    description: "Belum ada pesanan yang tersedia saat ini.",
  },
  users: {
    title: "Tidak ada pengguna",
    description: "Belum ada pengguna yang terdaftar.",
  },
  analytics: {
    title: "Tidak ada data analitik",
    description: "Belum ada data analitik yang tersedia untuk periode ini.",
  },
  search: {
    title: "Tidak ditemukan",
    description: "Pencarian tidak menemukan hasil yang cocok.",
  },
}

export function EmptyState({
  title,
  description,
  icon = "empty",
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon]
  const messages = defaultMessages[icon]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title || messages.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description || messages.description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )
}
