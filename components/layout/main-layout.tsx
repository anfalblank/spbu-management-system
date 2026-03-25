"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { useUIStore } from "@/store/ui-store"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  const isAuthPage = pathname?.startsWith("/login")

  useEffect(() => {
    const sidebar = document.getElementById("sidebar")
    const backdrop = document.getElementById("sidebar-backdrop")

    if (mobileMenuOpen) {
      sidebar?.classList.remove("-translate-x-full")
      sidebar?.classList.add("translate-x-0")
      backdrop?.classList.remove("opacity-0", "pointer-events-none")
      backdrop?.classList.add("opacity-100", "pointer-events-auto")
    } else {
      sidebar?.classList.add("-translate-x-full")
      sidebar?.classList.remove("translate-x-0")
      backdrop?.classList.add("opacity-0", "pointer-events-none")
      backdrop?.classList.remove("opacity-100", "pointer-events-auto")
    }
  }, [mobileMenuOpen])

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-300",
          "lg:ml-64",
          sidebarCollapsed && "lg:ml-16"
        )}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
