/**
 * Role-Based Access Control (RBAC)
 * Defines roles, permissions, and access control rules
 */

import type { UserRole } from '@/store/types'

/**
 * Permission categories
 */
export enum PermissionCategory {
  DASHBOARD = 'dashboard',
  POS = 'pos',
  PRODUCTS = 'products',
  INVENTORY = 'inventory',
  SPBU = 'spbu',
  LPG = 'lpg',
  OLI = 'oli',
  SNB = 'snb',
  FINANCE = 'finance',
  REPORTS = 'reports',
  STAFF = 'staff',
  SETTINGS = 'settings',
}

/**
 * Action types
 */
export enum PermissionAction {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  EXPORT = 'export',
  APPROVE = 'approve',
  PROCESS = 'process',
  CANCEL = 'cancel',
  REFUND = 'refund',
  SETTLE = 'settle',
}

/**
 * Permission format: category:action
 * Example: products:create, pos:process, reports:view
 */
export type Permission = `${PermissionCategory}:${PermissionAction}`

/**
 * Role permissions mapping
 * Each role has a set of permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Dashboard
    'dashboard:view',
    // POS
    'pos:view',
    'pos:process',
    'pos:refund',
    'pos:cancel',
    // Products
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    // Inventory
    'inventory:view',
    'inventory:create',
    'inventory:edit',
    'inventory:delete',
    // SPBU
    'spbu:view',
    'spbu:create',
    'spbu:edit',
    'spbu:delete',
    // LPG
    'lpg:view',
    'lpg:create',
    'lpg:edit',
    'lpg:delete',
    'lpg:approve',
    // OLI
    'oli:view',
    'oli:create',
    'oli:edit',
    'oli:delete',
    // SnB
    'snb:view',
    'snb:create',
    'snb:edit',
    'snb:delete',
    // Finance
    'finance:view',
    'finance:create',
    'finance:edit',
    'finance:delete',
    'finance:approve',
    'finance:export',
    // Reports
    'reports:view',
    'reports:export',
    // Staff
    'staff:view',
    'staff:create',
    'staff:edit',
    'staff:delete',
    // Settings
    'settings:view',
    'settings:edit',
  ],
  operator: [
    // Dashboard
    'dashboard:view',
    // POS
    'pos:view',
    'pos:process',
    'pos:refund',
    'pos:cancel',
    // Products
    'products:view',
    // Inventory
    'inventory:view',
    // SPBU
    'spbu:view',
    'spbu:process',
    'spbu:settle',
    // LPG
    'lpg:view',
    'lpg:create', // Can create distributions
    // OLI
    'oli:view',
    // SnB
    'snb:view',
    // Finance
    'finance:view',
    // Reports
    'reports:view',
  ],
  owner: [
    // Dashboard
    'dashboard:view',
    // Products
    'products:view',
    'products:create',
    'products:edit',
    // Inventory
    'inventory:view',
    // SPBU
    'spbu:view',
    // LPG
    'lpg:view',
    // OLI
    'oli:view',
    'oli:create',
    'oli:edit',
    // SnB
    'snb:view',
    'snb:create',
    'snb:edit',
    // Finance
    'finance:view',
    // Reports
    'reports:view',
    'reports:export',
    // Staff
    'staff:view',
  ],
}

/**
 * Route permissions mapping
 * Defines which roles can access which routes
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ['admin', 'operator', 'owner'],
  '/pos': ['admin', 'operator'],
  '/products': ['admin', 'owner', 'operator'],
  '/inventory': ['admin', 'owner', 'operator'],
  '/spbu': ['admin', 'operator'],
  '/spbu/dispenser': ['admin', 'operator'],
  '/spbu/settlement': ['admin', 'operator'],
  '/spbu/stock': ['admin', 'owner', 'operator'],
  '/lpg': ['admin', 'operator'],
  '/lpg/sales-agreement': ['admin', 'operator'],
  '/lpg/distribution': ['admin', 'operator'],
  '/lpg/analytics': ['admin', 'owner'],
  '/oli': ['admin', 'owner'],
  '/snb': ['admin', 'owner'],
  '/finance': ['admin'],
  '/finance/journal': ['admin'],
  '/finance/ledger': ['admin'],
  '/finance/profit-loss': ['admin'],
  '/finance/balance-sheet': ['admin'],
  '/finance/cash-flow': ['admin'],
  '/reports': ['admin', 'owner'],
  '/staff': ['admin'],
  '/settings': ['admin'],
}

/**
 * Sidebar menu items by role
 */
export const SIDEBAR_MENU_BY_ROLE: Record<UserRole, Array<{
  title: string
  href: string
  icon: string
  badge?: string
  children?: Array<{
    title: string
    href: string
    permissions?: Permission[]
  }>
}>> = {
  admin: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      title: 'POS',
      href: '/pos',
      icon: 'CashRegister',
    },
    {
      title: 'Produk',
      href: '/products',
      icon: 'Package',
    },
    {
      title: 'Inventaris',
      href: '/inventory',
      icon: 'Warehouse',
    },
    {
      title: 'SPBU',
      href: '/spbu',
      icon: 'Fuel',
      children: [
        { title: 'Dispenser', href: '/spbu/dispenser' },
        { title: 'Shift Settlement', href: '/spbu/settlement' },
        { title: 'Stok BBM', href: '/spbu/stock' },
        { title: 'Laporan', href: '/spbu/reports' },
      ],
    },
    {
      title: 'LPG',
      href: '/lpg',
      icon: 'Cylinder',
      children: [
        { title: 'Sales Agreement', href: '/lpg/sales-agreement' },
        { title: 'Distribusi', href: '/lpg/distribution' },
        { title: 'Analytics', href: '/lpg/analytics' },
      ],
    },
    {
      title: 'OLI',
      href: '/oli',
      icon: 'Droplet',
    },
    {
      title: 'SnB',
      href: '/snb',
      icon: 'Coffee',
    },
    {
      title: 'Keuangan',
      href: '/finance',
      icon: 'DollarSign',
      children: [
        { title: 'Jurnal', href: '/finance/journal' },
        { title: 'Buku Besar', href: '/finance/ledger' },
        { title: 'Laba Rugi', href: '/finance/profit-loss' },
        { title: 'Neraca', href: '/finance/balance-sheet' },
        { title: 'Arus Kas', href: '/finance/cash-flow' },
      ],
    },
    {
      title: 'Laporan',
      href: '/reports',
      icon: 'BarChart3',
    },
    {
      title: 'Staff',
      href: '/staff',
      icon: 'Users',
    },
    {
      title: 'Pengaturan',
      href: '/settings',
      icon: 'Settings',
    },
  ],
  operator: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      title: 'POS',
      href: '/pos',
      icon: 'CashRegister',
    },
    {
      title: 'Produk',
      href: '/products',
      icon: 'Package',
    },
    {
      title: 'Inventaris',
      href: '/inventory',
      icon: 'Warehouse',
    },
    {
      title: 'SPBU',
      href: '/spbu',
      icon: 'Fuel',
      children: [
        { title: 'Dispenser', href: '/spbu/dispenser' },
        { title: 'Shift Settlement', href: '/spbu/settlement' },
        { title: 'Stok BBM', href: '/spbu/stock' },
      ],
    },
    {
      title: 'LPG',
      href: '/lpg',
      icon: 'Cylinder',
      children: [
        { title: 'Sales Agreement', href: '/lpg/sales-agreement' },
        { title: 'Distribusi', href: '/lpg/distribution' },
      ],
    },
    {
      title: 'OLI',
      href: '/oli',
      icon: 'Droplet',
    },
    {
      title: 'SnB',
      href: '/snb',
      icon: 'Coffee',
    },
  ],
  owner: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
    },
    {
      title: 'Produk',
      href: '/products',
      icon: 'Package',
    },
    {
      title: 'Inventaris',
      href: '/inventory',
      icon: 'Warehouse',
    },
    {
      title: 'SPBU',
      href: '/spbu',
      icon: 'Fuel',
      children: [
        { title: 'Stok BBM', href: '/spbu/stock' },
        { title: 'Laporan', href: '/spbu/reports' },
      ],
    },
    {
      title: 'LPG',
      href: '/lpg',
      icon: 'Cylinder',
      children: [
        { title: 'Analytics', href: '/lpg/analytics' },
      ],
    },
    {
      title: 'OLI',
      href: '/oli',
      icon: 'Droplet',
    },
    {
      title: 'SnB',
      href: '/snb',
      icon: 'Coffee',
    },
    {
      title: 'Laporan',
      href: '/reports',
      icon: 'BarChart3',
    },
  ],
}

/**
 * Check if role has permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.includes(permission)
}

/**
 * Check if role can access route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Check exact match
  if (ROUTE_PERMISSIONS[route]?.includes(role)) {
    return true
  }

  // Check parent routes
  const segments = route.split('/').filter(Boolean)
  for (let i = segments.length; i > 0; i--) {
    const parentRoute = '/' + segments.slice(0, i).join('/')
    if (ROUTE_PERMISSIONS[parentRoute]?.includes(role)) {
      return true
    }
  }

  return false
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get sidebar menu for role
 */
export function getSidebarMenu(role: UserRole) {
  return SIDEBAR_MENU_BY_ROLE[role] || []
}

/**
 * Get accessible routes for role
 */
export function getAccessibleRoutes(role: UserRole): string[] {
  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([route]) => route)
}
