/**
 * Auth Module Barrel Export
 * Centralized export of all authentication and authorization utilities
 */

// Main hooks
export { useAuth, useAuthCheck, useUser } from './use-auth'
export type { UseAuthReturn } from './use-auth'

// Utilities
export {
  parseJWT,
  isTokenExpired,
  getTimeUntilExpiry,
  getUserIdFromToken,
  storeToken,
  getStoredToken,
  getStoredRefreshToken,
  clearStoredTokens,
  storeUser,
  getStoredUser,
  clearStoredUser,
  isAuthenticated,
  redirectToLogin,
  redirectToDashboard,
  getReturnUrl,
  formatUserName,
  getUserInitials,
  isValidEmail,
  validatePassword,
  sanitizeUserData,
} from './utils'

// RBAC
export {
  PermissionCategory,
  PermissionAction,
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  SIDEBAR_MENU_BY_ROLE,
  hasPermission,
  canAccessRoute,
  getRolePermissions,
  getSidebarMenu,
  hasAnyPermission,
  hasAllPermissions,
  getAccessibleRoutes,
} from './rbac'
export type { Permission }

// Components
export { ProtectedRoute, withAuth, useCanAccess } from '@/components/auth/protected-route'
export { RoleGuard, useRole, withRole } from '@/components/auth/role-guard'
export {
  PermissionGuard,
  usePermission,
  useHasPermission,
  withPermission,
} from '@/components/auth/permission-guard'

// Service
export { authService } from '../api/services/auth.service'
export type {
  LoginCredentials,
  LoginResponse,
  ChangePasswordRequest,
  User as AuthUser,
  UserRole as AuthRole,
} from '../api/services/auth.service'
