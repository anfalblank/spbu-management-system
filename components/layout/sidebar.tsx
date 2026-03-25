"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Fuel,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Cylinder,
  Droplet,
  Coffee,
  DollarSign,
  BarChart3,
  Users,
  Settings,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth/use-auth"
import type { UserRole } from "@/store/types"

// Icon mapping
const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Fuel,
  Cylinder,
  Droplet,
  Coffee,
  DollarSign,
  BarChart3,
  Users,
  Settings,
}

interface MenuItem {
  title: string
  href: string
  icon: string
  badge?: string
  children?: Array<{
    title: string
    href: string
  }>
}

interface NavSectionProps {
  title: string
  items: MenuItem[]
  collapsed: boolean
}

function NavSection({ title, items, collapsed }: NavSectionProps) {
  const pathname = usePathname()

  return (
    <div>
      {!collapsed && (
        <p className="mb-2 px-2 text-xs font-semibold text-sidebar-foreground/50">
          {title}
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
      </div>
    </div>
  )
}

function NavItem({ item, collapsed, pathname }: { item: MenuItem; collapsed: boolean; pathname: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const Icon = iconMap[item.icon as keyof typeof iconMap] || Fuel

  const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href))
  const isChildActive = item.children?.some(child => pathname === child.href)

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isChildActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground"
          )}
        >
          <Icon className={cn("h-5 w-5 flex-shrink-0", isChildActive && "text-primary")} />
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <Badge variant="destructive" className="ml-auto mr-1">
              {item.badge}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === child.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70"
                )}
              >
                <span className="flex-1">{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground",
        collapsed && "justify-center lg:px-2"
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
      {!collapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="destructive" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebar, toggleSidebar, closeSidebar } = useUIStore()
  const { user, getMenu, isAuthenticated } = useAuth()

  const menuItems = getMenu()
  const collapsed = sidebar.isCollapsed

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          "transition-opacity duration-300",
          sidebar.isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeSidebar}
        id="sidebar-backdrop"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          "w-64",
          collapsed && "lg:w-16",
          !sidebar.isOpen && "-translate-x-full lg:translate-x-0"
        )}
        id="sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Fuel className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold">SPBU System</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "hidden lg:flex",
                collapsed && "mx-auto"
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={closeSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {menuItems.map((item) => (
              <NavSection
                key={item.title}
                title={item.title}
                items={item.children || [item]}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            {!collapsed && user && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            )}
            {collapsed && user && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
