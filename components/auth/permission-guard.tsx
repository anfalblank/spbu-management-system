/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */

'use client'

import { useAuth } from '@/lib/auth/use-auth'
import type { Permission } from '@/lib/auth/rbac'

interface PermissionGuardProps {
  children: React.ReactNode
  permissions: Permission[]
  fallback?: React.ReactNode
  requireAll?: boolean
}

/**
 * Permission Guard - renders children if user has required permissions
 *
 * @example
 * <PermissionGuard permissions={['products:delete']}>
 *   <DeleteButton />
 * </PermissionGuard>
 *
 * @example
 * <PermissionGuard permissions={['products:edit', 'products:delete']} requireAll>
 *   <AdminActions />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permissions,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()

  if (requireAll) {
    const hasAll = hasAllPermissions(permissions)
    if (!hasAll) {
      return <>{fallback}</>
    }
  } else {
    const hasAny = hasAnyPermission(permissions)
    if (!hasAny) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}

/**
 * Hook to check if user has permission
 */
export function usePermission(permissions: Permission | Permission[], requireAll = false): boolean {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth()

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions]

  if (requireAll) {
    return hasAllPermissions(permissionArray)
  }

  return hasAnyPermission(permissionArray)
}

/**
 * Hook to check if user has specific permission
 */
export function useHasPermission() {
  const { hasPermission } = useAuth()

  return {
    hasPermission,
    canView: (resource: string) => hasPermission(`${resource}:view` as Permission),
    canCreate: (resource: string) => hasPermission(`${resource}:create` as Permission),
    canEdit: (resource: string) => hasPermission(`${resource}:edit` as Permission),
    canDelete: (resource: string) => hasPermission(`${resource}:delete` as Permission),
    canExport: (resource: string) => hasPermission(`${resource}:export` as Permission),
  }
}

/**
 * HOC for permission-based component protection
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissions: Permission[],
  options?: { requireAll?: boolean; fallback?: React.ReactNode }
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <PermissionGuard
        permissions={permissions}
        requireAll={options?.requireAll}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </PermissionGuard>
    )
  }
}
