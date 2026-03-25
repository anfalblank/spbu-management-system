/**
 * Protected Route Component
 * Wraps routes that require authentication
 * Shows loading state while checking auth
 * Redirects to login if not authenticated
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/use-auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: Array<'admin' | 'operator' | 'owner'>
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requireRole,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, canAccess } = useAuth()

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Memeriksa autentikasi...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    useEffect(() => {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`)
    }, [router])
    return null
  }

  // Check role permissions
  if (requireRole && user) {
    const hasRequiredRole = requireRole.includes(user.role)

    if (!hasRequiredRole) {
      if (fallback) {
        return <>{fallback}</>
      }

      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl">🔒</div>
            <h1 className="text-2xl font-bold">Akses Ditolak</h1>
            <p className="text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
            <button
              onClick={() => router.back()}
              className="text-primary hover:underline"
            >
              Kembali
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

/**
 * HOC for protecting routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireRole?: Array<'admin' | 'operator' | 'owner'> }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requireRole={options?.requireRole}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

/**
 * Hook to check if current user can access route
 */
export function useCanAccess(route: string) {
  const { canAccess } = useAuth()
  return canAccess(route)
}
