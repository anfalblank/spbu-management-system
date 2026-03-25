/**
 * Role Guard Component
 * Conditionally renders children based on user role
 */

'use client'

import { useAuth } from '@/lib/auth/use-auth'
import type { UserRole } from '@/store/types'

interface RoleGuardProps {
  children: React.ReactNode
  roles: UserRole[]
  fallback?: React.ReactNode
  requireAll?: boolean
}

/**
 * Role Guard - renders children if user has any of the specified roles
 *
 * @example
 * <RoleGuard roles={['admin', 'manager']}>
 *   <DeleteButton />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  roles,
  fallback = null,
  requireAll = false,
}: RoleGuardProps) {
  const { role } = useAuth()

  if (!role) {
    return <>{fallback}</>
  }

  const hasAccess = requireAll
    ? roles.every(r => r === role)
    : roles.some(r => r === role)

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook to check if user has role
 */
export function useRole(roles: UserRole[] | UserRole, requireAll = false): boolean {
  const { role } = useAuth()

  if (!role) return false

  const roleArray = Array.isArray(roles) ? roles : [roles]

  return requireAll
    ? roleArray.every(r => r === role)
    : roleArray.some(r => r === role)
}

/**
 * HOC for role-based component protection
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  roles: UserRole[],
  options?: { requireAll?: boolean; fallback?: React.ReactNode }
) {
  return function RoleProtectedComponent(props: P) {
    return (
      <RoleGuard roles={roles} requireAll={options?.requireAll} fallback={options?.fallback}>
        <Component {...props} />
      </RoleGuard>
    )
  }
}
