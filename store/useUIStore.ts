/**
 * UI Store
 * Manages global UI state (sidebar, modals, theme, etc.)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, ModalType, SidebarState, UIState } from './types'

interface UIActions {
  // Sidebar actions
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
  collapseSidebar: () => void
  expandSidebar: () => void
  setActiveSidebarItem: (item: string | null) => void

  // Theme actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void

  // Modal actions
  openModal: (modal: ModalType, data?: Record<string, any>) => void
  closeModal: () => void
  setModalData: (data: Record<string, any> | null) => void

  // Notification actions
  addNotification: (notification: {
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
  }) => void
  removeNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void

  // Loading state
  setLoading: (loading: boolean) => void

  // Search
  setSearchQuery: (query: string) => void
  clearSearch: () => void

  // Breadcrumbs
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void
  addBreadcrumb: (breadcrumb: { label: string; href?: string }) => void

  // Reset
  resetUI: () => void
}

interface UIStore extends UIState, UIActions {}

/**
 * Default UI state
 */
const defaultState: UIState = {
  sidebar: {
    isOpen: true,
    isCollapsed: false,
    activeItem: 'dashboard',
  },
  theme: 'system',
  activeModal: null,
  modalData: null,
  notifications: [],
  isLoading: false,
  searchQuery: '',
  breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }],
}

/**
 * Create UI store with persistence
 */
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({
          sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen },
        }))
      },

      openSidebar: () => {
        set((state) => ({
          sidebar: { ...state.sidebar, isOpen: true },
        }))
      },

      closeSidebar: () => {
        set((state) => ({
          sidebar: { ...state.sidebar, isOpen: false },
        }))
      },

      collapseSidebar: () => {
        set((state) => ({
          sidebar: { ...state.sidebar, isCollapsed: true },
        }))
      },

      expandSidebar: () => {
        set((state) => ({
          sidebar: { ...state.sidebar, isCollapsed: false },
        }))
      },

      setActiveSidebarItem: (item) => {
        set((state) => ({
          sidebar: { ...state.sidebar, activeItem: item },
        }))
      },

      // Theme actions
      setTheme: (theme) => {
        set({ theme })

        // Apply theme to document
        if (typeof document !== 'undefined') {
          const root = document.documentElement
          root.classList.remove('light', 'dark')

          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            root.classList.add(systemTheme)
          } else {
            root.classList.add(theme)
          }
        }
      },

      toggleTheme: () => {
        const state = get()
        const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },

      // Modal actions
      openModal: (modal, data) => {
        set({ activeModal: modal, modalData: data ?? null })
      },

      closeModal: () => {
        set({ activeModal: null, modalData: null })
      },

      setModalData: (data) => {
        set({ modalData: data })
      },

      // Notification actions
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random()}`
        set((state) => ({
          notifications: [
            {
              ...notification,
              id,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        }))

        // Auto-remove after 5 seconds for success/info notifications
        if (notification.type === 'success' || notification.type === 'info') {
          setTimeout(() => {
            get().removeNotification(id)
          }, 5000)
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      // Loading state
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      // Search
      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      clearSearch: () => {
        set({ searchQuery: '' })
      },

      // Breadcrumbs
      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs })
      },

      addBreadcrumb: (breadcrumb) => {
        set((state) => ({
          breadcrumbs: [...state.breadcrumbs, breadcrumb],
        }))
      },

      // Reset
      resetUI: () => {
        set({
          sidebar: defaultState.sidebar,
          activeModal: null,
          modalData: null,
          notifications: [],
          isLoading: false,
          searchQuery: '',
        })
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebar: state.sidebar,
        theme: state.theme,
      }),
    }
  )
)

// Selectors for optimized reads
export const selectSidebarOpen = (state: UIStore) => state.sidebar.isOpen
export const selectSidebarCollapsed = (state: UIStore) => state.sidebar.isCollapsed
export const selectTheme = (state: UIStore) => state.theme
export const selectActiveModal = (state: UIStore) => state.activeModal
export const selectNotifications = (state: UIStore) => state.notifications
export const selectUnreadNotifications = (state: UIStore) =>
  state.notifications.filter((n) => !n.read)
export const selectSearchQuery = (state: UIStore) => state.searchQuery

/**
 * Hook to get sidebar state with actions
 */
export const useSidebar = () => {
  const sidebar = useUIStore((state) => state.sidebar)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const openSidebar = useUIStore((state) => state.openSidebar)
  const closeSidebar = useUIStore((state) => state.closeSidebar)
  const collapseSidebar = useUIStore((state) => state.collapseSidebar)
  const expandSidebar = useUIStore((state) => state.expandSidebar)

  return {
    ...sidebar,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    collapseSidebar,
    expandSidebar,
  }
}

/**
 * Hook to get modal state
 */
export const useModal = () => {
  const activeModal = useUIStore((state) => state.activeModal)
  const modalData = useUIStore((state) => state.modalData)
  const openModal = useUIStore((state) => state.openModal)
  const closeModal = useUIStore((state) => state.closeModal)
  const setModalData = useUIStore((state) => state.setModalData)

  return {
    activeModal,
    modalData,
    openModal,
    closeModal,
    setModalData,
    isOpen: activeModal !== null,
  }
}

/**
 * Hook to get notifications
 */
export const useNotifications = () => {
  const notifications = useUIStore((state) => state.notifications)
  const addNotification = useUIStore((state) => state.addNotification)
  const removeNotification = useUIStore((state) => state.removeNotification)
  const markNotificationRead = useUIStore((state) => state.markNotificationRead)
  const markAllNotificationsRead = useUIStore((state) => state.markAllNotificationsRead)
  const clearNotifications = useUIStore((state) => state.clearNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  }
}

/**
 * Hook to get theme state
 */
export const useTheme = () => {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
