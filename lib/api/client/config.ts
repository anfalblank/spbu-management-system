/**
 * API Configuration
 * Centralized configuration for API client
 */

export const API_CONFIG = {
  // Base URL - can be overridden by environment variable
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',

  // Timeout in milliseconds
  timeout: 30000,

  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
  },

  // Cache configuration
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
  },

  // Request defaults
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const

export type ApiConfig = typeof API_CONFIG

/**
 * Environment-specific configurations
 */
export const ENV_CONFIG = {
  development: {
    baseURL: 'http://localhost:3001/api',
    logRequests: true,
    logErrors: true,
  },
  staging: {
    baseURL: 'https://staging-api.spbu-management.com',
    logRequests: true,
    logErrors: true,
  },
  production: {
    baseURL: 'https://api.spbu-management.com',
    logRequests: false,
    logErrors: true,
  },
} as const

/**
 * Get current environment config
 */
export function getEnvConfig() {
  const env = process.env.NODE_ENV || 'development'
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development
}
