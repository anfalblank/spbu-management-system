/**
 * Notification Service
 * Handles sending notifications to various channels (in-app, WhatsApp, Email)
 */

import { useAutoOrderStore } from '@/store'
import type { Notification, NotificationChannel } from '@/store'

export interface WhatsAppMessage {
  to: string
  message: string
  type: 'text' | 'template'
  templateName?: string
  templateParams?: Record<string, string>
}

export interface EmailMessage {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
}

class NotificationService {
  private enabledChannels: NotificationChannel[] = ['in_app']
  private whatsappApiKey?: string
  private emailFrom?: string

  /**
   * Configure notification channels
   */
  configure(config: {
    whatsapp?: { apiKey: string }
    email?: { from: string }
  }) {
    this.whatsappApiKey = config.whatsapp?.apiKey
    this.emailFrom = config.email?.from

    this.enabledChannels = ['in_app']
    if (config.whatsapp) this.enabledChannels.push('whatsapp')
    if (config.email) this.enabledChannels.push('email')
  }

  /**
   * Send notification to all configured channels
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    // Add to store (in-app notification)
    const { addNotification } = useAutoOrderStore.getState()
    addNotification(notification)

    // Send to other channels
    const results = await Promise.allSettled([
      notification.channels.includes('whatsapp') && this.whatsappApiKey
        ? this.sendToWhatsApp(notification)
        : Promise.resolve(undefined),
      notification.channels.includes('email') && this.emailFrom
        ? this.sendToEmail(notification)
        : Promise.resolve(undefined),
    ])

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send notification via ${notification.channels[index]}:`, result.reason)
      }
    })
  }

  /**
   * Send WhatsApp message
   */
  private async sendToWhatsApp(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    if (!this.whatsappApiKey) return

    const message = this.formatWhatsAppMessage(notification)

    // In production, use WhatsApp Business API
    // For now, just log it
    console.log('WhatsApp notification:', message)

    // Example implementation with a mock API call:
    // await fetch('https://wa-provider.com/api/send', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${this.whatsappApiKey}` },
    //   body: JSON.stringify(message)
    // })
  }

  /**
   * Send email
   */
  private async sendToEmail(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    if (!this.emailFrom) return

    const email = this.formatEmail(notification)

    // In production, use email service (SendGrid, AWS SES, etc.)
    console.log('Email notification:', email)

    // Example implementation:
    // await fetch('/api/send-email', {
    //   method: 'POST',
    //   body: JSON.stringify(email)
    // })
  }

  /**
   * Format notification as WhatsApp message
   */
  private formatWhatsAppMessage(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): WhatsAppMessage {
    let message = `*${notification.title}*\n\n`
    message += `${notification.message}\n`

    if (notification.actionUrl) {
      message += `\n👉 Detail: ${notification.actionUrl}`
    }

    return {
      to: '', // Would be populated from user settings
      message,
      type: 'text' as const,
    }
  }

  /**
   * Format notification as email
   */
  private formatEmail(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): EmailMessage {
    const severityColors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      critical: '#ef4444',
    }

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .severity-bar { height: 4px; background: ${severityColors[notification.severity]}; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 8px; }
          .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${notification.title}</h2>
            <div class="severity-bar"></div>
          </div>
          <div class="content">
            <p>${notification.message}</p>
            ${notification.actionUrl ? `<a href="${notification.actionUrl}" class="button">Lihat Detail</a>` : ''}
          </div>
          <div class="footer">
            <p>SPBU Management System - Automated Notification</p>
            <p>${new Date().toLocaleString('id-ID')}</p>
          </div>
        </div>
      </body>
      </html>
    `

    return {
      to: '', // Would be populated from user settings
      subject: notification.title,
      htmlBody,
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(
    notifications: Array<Omit<Notification, 'id' | 'createdAt' | 'read'>>,
    channels: NotificationChannel[] = ['in_app']
  ): Promise<void> {
    for (const notification of notifications) {
      const filteredNotification = {
        ...notification,
        channels: notification.channels.filter((c) => channels.includes(c)),
      }
      await this.sendNotification(filteredNotification)
    }
  }

  /**
   * Check if notification channel is enabled
   */
  isChannelEnabled(channel: NotificationChannel): boolean {
    return this.enabledChannels.includes(channel)
  }
}

// Singleton instance
export const notificationService = new NotificationService()

/**
 * React hook for sending notifications
 */
export function useNotifications() {
  const { notifications, unreadNotifications, markAsRead, markAllAsRead, addNotification } = useAutoOrderStore()

  return {
    notifications,
    unreadNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      return notificationService.sendNotification(notification)
    },
  }
}
