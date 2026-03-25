/**
 * useAuth Hook
 * Provides authentication state and actions
 * Integrates with Zustand auth store
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { authService } from '@/lib/api'
import type { LoginCredentials, User, UserRole } from '@/store/types'
import type { Permission } from './rbac'
import {
  hasPermission,
  canAccessRoute,
  getRolePermissions,
  getSidebarMenu,
  hasAnyPermission,
  hasAllPermissions,
} from './rbac'
import {
  redirectToLogin,
  redirectToDashboard,
  getReturnUrl,
  formatUserName,
  getUserInitials,
  isAuthenticated as checkIsAuthenticated,
  clearStoredTokens,
} from './utils'

export interface UseAuthReturn {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Computed
  role: UserRole | null
  userName: string
  userInitials: string
  isExpired: boolean
  timeUntilExpiry: number

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: (force?: boolean) => void
  refreshUser: () => Promise<void>

  // Permission checks
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canAccess: (route: string) => boolean
  getPermissions: () => Permission[]
  getMenu: () => ReturnType<typeof getSidebarMenu>

  // Redirect helpers
  loginRedirect: () => void
  dashboardRedirect: () => void
}

/**
 * Main authentication hook
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const authStore = useAuthStore()

  // Extract state from auth store
  const user = authStore.user
  const token = authStore.token
  const isAuthenticated = authStore.isAuthenticated
  const isLoading = authStore.isLoading
  const error = authStore.error
  const role = user?.role || null

  // Computed values
  const userName = user ? formatUserName(user) : ''
  const userInitials = user ? getUserInitials(user) : ''
  const isExpired = authStore.isTokenExpired()
  const timeUntilExpiry = authStore.getTimeUntilExpiry()

  /**
   * Login action
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      authStore.setLoading(true)

      // Call API
      const response = await authService.login(credentials)

      // Store in Zustand
      await authStore.login(
        credentials.email,
        credentials.password,
        response.user,
        response.token,
        response.expiresIn
      )

      // Store in localStorage (backup)
      clearStoredTokens()
      localStorage.setItem('auth_token', response.token)
      if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken)
      }

      // Redirect to dashboard or return URL
      const returnUrl = getReturnUrl()
      router.push(returnUrl)
    } catch (error) {
      authStore.clearError()
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }, [authStore, router])

  /**
   * Logout action
   */
  const logout = useCallback((force = false) => {
    // Call API
    authService.logout().catch(console.error)

    // Clear store
    authStore.logout(force)

    // Clear localStorage
    clearStoredTokens()
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth-storage')

    // Redirect to login
    if (force) {
      redirectToLogin()
    } else {
      router.push('/login')
    }
  }, [authStore, router])

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    if (!token) return

    try {
      const user = await authService.getCurrentUser()
      authStore.setUser(user)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // Token might be expired, logout
      logout(true)
    }
  }, [token, authStore, logout])

  /**
   * Permission checks
   */
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!role) return false
    return hasPermission(role, permission)
  }, [role])

  const checkAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!role) return false
    return hasAnyPermission(role, permissions)
  }, [role])

  const checkAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!role) return false
    return hasAllPermissions(role, permissions)
  }, [role])

  const checkAccess = useCallback((route: string): boolean => {
    if (!role) return false
    return canAccessRoute(role, route)
  }, [role])

  const getPermissionsList = useCallback((): Permission[] => {
    if (!role) return []
    return getRolePermissions(role)
  }, [role])

  const getMenuItems = useCallback(() => {
    if (!role) return []
    return getSidebarMenu(role)
  }, [role])

  /**
   * Redirect helpers
   */
  const loginRedirect = useCallback(() => {
    redirectToLogin()
  }, [])

  const dashboardRedirect = useCallback(() => {
    redirectToDashboard()
  }, [])

  // Auto-refresh user on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && token && !user) {
      refreshUser()
    }
  }, [isAuthenticated, token, user, refreshUser])

  // Auto-logout if token expired
  useEffect(() => {
    if (isAuthenticated && isExpired) {
      logout(true)
    }
  }, [isAuthenticated, isExpired, logout])

  return {
    // State
    user,
    token,
    isAuthenticated: isAuthenticated && !isExpired,
    isLoading,
    error,

    // Computed
    role,
    userName,
    userInitials,
    isExpired,
    timeUntilExpiry,

    // Actions
    login,
    logout,
    refreshUser,

    // Permission checks
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canAccess: checkAccess,
    getPermissions: getPermissionsList,
    getMenu: getMenuItems,

    // Redirect helpers
    loginRedirect,
    dashboardRedirect,
  }
}

/**
 * Simple authentication check hook (non-interactive)
 */
export function useAuthCheck() {
  const { isAuthenticated, isLoading } = useAuthStore()
  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
  }
}

/**
 * User info hook (lightweight)
 */
export function useUser() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role || null

  return {
    user,
    role,
    name: user ? formatUserName(user) : '',
    initials: user ? getUserInitials(user) : '',
  }
}

/**
 * Role hook
 */
export function useRole() {
  const role = useAuthStore((state) => state.user?.role || null)

  return {
    role,
    isAdmin: role === 'admin',
    isOperator: role === 'operator',
    isOwner: role === 'owner',
  }
}

/**
 * Permission hook
 */
export function usePermission() {
  const { role } = useRole()

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!role) return false
    return hasPermission(role, permission)
  }, [role])

  const canAccess = useCallback((route: string): boolean => {
    if (!role) return false
    return canAccessRoute(role, route)
  }, [role])

  return {
    hasPermission,
    canAccess,
  }
}
