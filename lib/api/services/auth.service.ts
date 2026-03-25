/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { BaseService } from './base-service'
import type { User, UserRole } from '../types/common'

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

/**
 * Auth Service
 */
export class AuthService extends BaseService {
  private readonly endpoint = '/auth'

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.client.post<{ data: LoginResponse }>(
      `${this.endpoint}/login`,
      credentials
    )
    return response.data.data
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await this.client.post(`${this.endpoint}/logout`, {})
  }

  /**
   * Get current user (me endpoint)
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<{ data: User }>(`${this.endpoint}/me`)
    return response.data.data
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await this.client.post<{ data: LoginResponse }>(
      `${this.endpoint}/refresh`,
      { refreshToken }
    )
    return response.data.data
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await this.client.post(`${this.endpoint}/change-password`, data)
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await this.client.post(`${this.endpoint}/password-reset/request`, { email })
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.client.post(`${this.endpoint}/password-reset/confirm`, {
      token,
      newPassword,
    })
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await this.client.patch<{ data: User }>(
      `${this.endpoint}/profile`,
      updates
    )
    return response.data.data
  }
}

/**
 * Singleton instance
 */
export const authService = new AuthService()
