/**
 * Authentication Store (Enhanced)
 * Manages user authentication state with token expiry and auto-logout
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole, AuthState } from './types'

/**
 * Token data structure
 */
interface TokenData {
  token: string
  expiresAt: string
  refreshToken?: string
}

interface AuthActions {
  login: (email: string, password: string, user?: User, token?: string, expiresIn?: number) => Promise<void>
  logout: (force?: boolean) => void
  setUser: (user: User) => void
  setToken: (token: string, expiresIn?: number) => void
  updateUser: (updates: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
  checkTokenExpiry: () => boolean
  refreshToken: () => Promise<boolean>
  isTokenExpired: () => boolean
  getTimeUntilExpiry: () => number // returns seconds until expiry
  scheduleTokenRefresh: () => void
  clearTokenRefresh: () => void
}

interface AuthStore extends AuthState {
  tokenData: TokenData | null
  lastActivity: string
  sessionTimeout: number // minutes of inactivity before auto-logout
  tokenRefreshTimer: NodeJS.Timeout | null
}

/**
 * Role permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // All permissions
  manager: [
    'dashboard:view',
    'pos:access',
    'products:manage',
    'inventory:view',
    'inventory:manage',
    'reports:view',
    'reports:export',
    'staff:manage',
    'settings:manage',
  ],
  cashier: [
    'pos:access',
    'pos:process',
    'pos:refund',
    'shift:settle',
  ],
  viewer: [
    'dashboard:view',
    'reports:view',
  ],
}

/**
 * Parse JWT token (without verification - for expiry only)
 */
function parseJWT(token: string): { exp?: number; iat?: number } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Calculate token expiry from JWT or expiresIn parameter
 */
function calculateExpiry(token?: string, expiresIn?: number): string {
  // If token is JWT, extract expiry
  if (token) {
    const parsed = parseJWT(token)
    if (parsed?.exp) {
      return new Date(parsed.exp * 1000).toISOString()
    }
  }

  // Otherwise use expiresIn parameter (default 24 hours)
  const expiryMs = (expiresIn || 86400) * 1000
  return new Date(Date.now() + expiryMs).toISOString()
}

/**
 * Create auth store with persistence and token management
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenData: null,
      lastActivity: new Date().toISOString(),
      sessionTimeout: 30, // 30 minutes of inactivity
      tokenRefreshTimer: null,

      // Actions
      login: async (email: string, password: string, user?: User, token?: string, expiresIn?: number) => {
        set({ isLoading: true, error: null })

        try {
          // TODO: Replace with actual API call
          // const response = await authApi.login({ email, password })

          // Mock login for now
          const mockUser: User = user || {
            id: '1',
            name: 'Admin User',
            email,
            role: 'admin',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          const mockToken = token || 'mock-jwt-token'

          // Calculate token expiry
          const expiresAt = calculateExpiry(mockToken, expiresIn)

          set({
            user: mockUser,
            token: mockToken,
            tokenData: {
              token: mockToken,
              expiresAt,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
            lastActivity: new Date().toISOString(),
          })

          // Schedule token refresh before expiry
          get().scheduleTokenRefresh()

          // Set up activity tracking
          if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', get().trackActivity)
            window.addEventListener('keydown', get().trackActivity)
            window.addEventListener('click', get().trackActivity)
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            tokenData: null,
          })
          throw error
        }
      },

      logout: (force = false) => {
        const state = get()

        // Clear token refresh timer
        if (state.tokenRefreshTimer) {
          clearTimeout(state.tokenRefreshTimer)
        }

        // Remove activity listeners
        if (typeof window !== 'undefined') {
          window.removeEventListener('mousemove', get().trackActivity)
          window.removeEventListener('keydown', get().trackActivity)
          window.removeEventListener('click', get().trackActivity)
        }

        set({
          user: null,
          token: null,
          tokenData: null,
          isAuthenticated: false,
          error: null,
          tokenRefreshTimer: null,
        })

        // Clear all persisted data
        localStorage.removeItem('auth-storage')
        sessionStorage.clear()

        // If forced logout (e.g., token expiry), show notification
        if (force) {
          // You could trigger a toast notification here
          console.warn('Logged out due to session expiry')
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string, expiresIn?: number) => {
        const expiresAt = calculateExpiry(token, expiresIn)

        set({
          token,
          tokenData: {
            token,
            expiresAt,
          },
          isAuthenticated: true,
        })

        // Schedule token refresh
        get().scheduleTokenRefresh()
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...updates, updatedAt: new Date().toISOString() },
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      hasPermission: (permission: string): boolean => {
        const { user } = get()
        if (!user) return false

        const permissions = ROLE_PERMISSIONS[user.role]
        return permissions.includes('*') || permissions.includes(permission)
      },

      hasRole: (roles: UserRole | UserRole[]): boolean => {
        const { user } = get()
        if (!user) return false

        const roleArray = Array.isArray(roles) ? roles : [roles]
        return roleArray.includes(user.role)
      },

      isTokenExpired: (): boolean => {
        const { tokenData } = get()
        if (!tokenData) return true

        const now = new Date()
        const expiry = new Date(tokenData.expiresAt)
        return now >= expiry
      },

      getTimeUntilExpiry: (): number => {
        const { tokenData } = get()
        if (!tokenData) return 0

        const now = new Date()
        const expiry = new Date(tokenData.expiresAt)
        const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000)

        return Math.max(0, diff)
      },

      checkTokenExpiry: (): boolean => {
        const { isTokenExpired, logout } = get()

        if (isTokenExpired()) {
          logout(true) // Force logout
          return true
        }

        return false
      },

      refreshToken: async (): Promise<boolean> => {
        const { tokenData } = get()

        if (!tokenData?.refreshToken) {
          // No refresh token available, logout
          get().logout(true)
          return false
        }

        try {
          // TODO: Replace with actual API call
          // const response = await authApi.refreshToken(tokenData.refreshToken)

          // Mock refresh for now
          const newToken = 'refreshed-mock-jwt-token'
          get().setToken(newToken, 86400) // 24 hours

          return true
        } catch (error) {
          console.error('Token refresh failed:', error)
          get().logout(true)
          return false
        }
      },

      scheduleTokenRefresh: () => {
        const state = get()

        // Clear existing timer
        if (state.tokenRefreshTimer) {
          clearTimeout(state.tokenRefreshTimer)
        }

        if (!state.tokenData) return

        const timeUntilExpiry = get().getTimeUntilExpiry()

        // Schedule refresh 5 minutes before expiry
        const refreshDelay = Math.max(0, timeUntilExpiry - 300) * 1000

        const timer = setTimeout(async () => {
          const refreshed = await get().refreshToken()

          if (!refreshed) {
            // Refresh failed, already logged out
            return
          }

          // Schedule next refresh
          get().scheduleTokenRefresh()
        }, refreshDelay)

        set({ tokenRefreshTimer: timer as any })
      },

      clearTokenRefresh: () => {
        const state = get()

        if (state.tokenRefreshTimer) {
          clearTimeout(state.tokenRefreshTimer)
          set({ tokenRefreshTimer: null })
        }
      },

      trackActivity: () => {
        const state = get()
        const now = new Date()
        const lastActivity = new Date(state.lastActivity)
        const inactiveMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60)

        // Update last activity
        set({ lastActivity: now.toISOString() })

        // Check session timeout
        if (inactiveMinutes >= state.sessionTimeout) {
          get().logout(true)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tokenData: state.tokenData,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
        sessionTimeout: state.sessionTimeout,
      }),
    }
  )
)

// Initialize token expiry checker on app load
if (typeof window !== 'undefined') {
  // Check token expiry every minute
  setInterval(() => {
    const authStore = useAuthStore.getState()
    if (authStore.isAuthenticated) {
      authStore.checkTokenExpiry()
    }
  }, 60000) // 1 minute

  // Check activity timeout every 30 seconds
  setInterval(() => {
    const authStore = useAuthStore.getState()
    if (authStore.isAuthenticated) {
      authStore.trackActivity()
    }
  }, 30000) // 30 seconds
}

// Selectors for optimized reads
export const selectUser = (state: AuthStore) => state.user
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated
export const selectToken = (state: AuthStore) => state.token
export const selectUserRole = (state: AuthStore) => state.user?.role
export const selectHasPermission = (permission: string) => (state: AuthStore) =>
  state.hasPermission(permission)
export const selectTokenExpiry = (state: AuthStore) => state.tokenData?.expiresAt
export const selectTimeUntilExpiry = (state: AuthStore) => state.getTimeUntilExpiry()

/**
 * Hook to check authentication status with token expiry
 */
export const useAuthStatus = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired())
  const timeUntilExpiry = useAuthStore((state) => state.getTimeUntilExpiry())

  return {
    user,
    isAuthenticated: isAuthenticated && !isTokenExpired,
    isExpired: isTokenExpired,
    timeUntilExpiry,
    willExpireSoon: timeUntilExpiry < 300, // Less than 5 minutes
  }
}
