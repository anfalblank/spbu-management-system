/**
 * Next.js Middleware
 * Route protection and authentication
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/logout',
]

/**
 * API routes that handle their own auth
 */
const API_ROUTES = [
  '/api/auth',
]

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Check if route is API route
 */
function isApiRoute(pathname: string): boolean {
  return API_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Get token from request
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookie
  const token = request.cookies.get('auth_token')?.value
  if (token) {
    return token
  }

  return null
}

/**
 * Parse JWT token (without verification - for middleware only)
 */
function parseJWT(token: string): { exp?: number; sub?: string; role?: string } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = Buffer.from(base64, 'base64').toString()
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const parsed = parseJWT(token)
  if (!parsed?.exp) return false

  const now = Math.floor(Date.now() / 1000)
  return parsed.exp < now
}

/**
 * Middleware main function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // If authenticated and trying to access login, redirect to dashboard
    if (pathname === '/login') {
      const token = getTokenFromRequest(request)
      if (token && !isTokenExpired(token)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // Allow API routes with their own auth handling
  if (isApiRoute(pathname)) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = getTokenFromRequest(request)

  if (!token) {
    // No token - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    // Token expired - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    loginUrl.searchParams.set('expired', 'true')
    return NextResponse.redirect(loginUrl)
  }

  // Token is valid, allow access
  // Add user info to headers for use in server components
  const response = NextResponse.next()

  return response
}

/**
 * Configure middleware paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
