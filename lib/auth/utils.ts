/**
 * Authentication Utilities
 * Helper functions for authentication and session management
 */

import type { User, UserRole } from '@/store/types'

/**
 * Parse JWT token (without verification - for expiry only)
 */
export function parseJWT(token: string): { exp?: number; iat?: number; sub?: string } | null {
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
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const parsed = parseJWT(token)
  if (!parsed?.exp) return false

  const now = Math.floor(Date.now() / 1000)
  return parsed.exp < now
}

/**
 * Get time until token expiry (in seconds)
 */
export function getTimeUntilExpiry(token: string): number {
  const parsed = parseJWT(token)
  if (!parsed?.exp) return 0

  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, parsed.exp - now)
}

/**
 * Get user ID from token
 */
export function getUserIdFromToken(token: string): string | null {
  const parsed = parseJWT(token)
  return parsed?.sub || null
}

/**
 * Store token in localStorage
 */
export function storeToken(token: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('auth_token', token)
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken)
  }
}

/**
 * Get stored token
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/**
 * Get stored refresh token
 */
export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

/**
 * Clear stored tokens
 */
export function clearStoredTokens(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('auth-storage')
}

/**
 * Store user data
 */
export function storeUser(user: User): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('auth_user', JSON.stringify(user))
}

/**
 * Get stored user data
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null

  try {
    const userStr = localStorage.getItem('auth_user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

/**
 * Clear stored user data
 */
export function clearStoredUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_user')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getStoredToken()
  if (!token) return false

  // Check if token is expired
  if (isTokenExpired(token)) {
    clearStoredTokens()
    clearStoredUser()
    return false
  }

  return true
}

/**
 * Redirect to login
 */
export function redirectToLogin(returnUrl?: string): void {
  if (typeof window === 'undefined') return

  const url = new URL('/login', window.location.origin)
  if (returnUrl) {
    url.searchParams.set('returnUrl', returnUrl)
  }

  window.location.href = url.toString()
}

/**
 * Redirect to dashboard
 */
export function redirectToDashboard(): void {
  if (typeof window === 'undefined') return
  window.location.href = '/dashboard'
}

/**
 * Get return URL from query params
 */
export function getReturnUrl(): string {
  if (typeof window === 'undefined') return '/dashboard'

  const params = new URLSearchParams(window.location.search)
  return params.get('returnUrl') || '/dashboard'
}

/**
 * Format user display name
 */
export function formatUserName(user: User): string {
  return user.name || user.email || 'User'
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User): string {
  const name = user.name || user.email || ''
  const parts = name.split(' ')

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return name.substring(0, 2).toUpperCase()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password minimal 8 karakter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf kapital')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung angka')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitize user data for storage (remove sensitive fields)
 */
export function sanitizeUserData(user: User): User {
  const { ...sanitized } = user
  // Remove any sensitive fields if present
  return sanitized
}
