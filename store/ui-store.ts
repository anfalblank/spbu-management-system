import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  theme: Theme
  currentModule: string | null
  notificationCount: number
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  setCurrentModule: (module: string | null) => void
  setNotificationCount: (count: number) => void
  incrementNotificationCount: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileMenuOpen: false,
      theme: 'system',
      currentModule: null,
      notificationCount: 3,

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      setTheme: (theme) => set({ theme }),

      setCurrentModule: (module) => set({ currentModule: module }),

      setNotificationCount: (count) => set({ notificationCount: count }),

      incrementNotificationCount: () => set((state) => ({ notificationCount: state.notificationCount + 1 })),
    }),
    {
      name: 'ui-storage',
    }
  )
)
