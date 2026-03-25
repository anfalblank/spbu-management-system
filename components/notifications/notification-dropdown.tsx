/**
 * Notification Dropdown Panel
 * Displays list of notifications with read status and actions
 */

'use client'

import { useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { useAutoOrderStore } from '@/store'
import type { Notification } from '@/store'

const severityConfig = {
  info: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800' },
  critical: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800' },
}

const typeConfig: Record<string, { icon: any; label: string }> = {
  stock_alert: { icon: '📦', label: 'Stok Menipis' },
  order_created: { icon: '📋', label: 'Order Dibuat' },
  order_approved: { icon: '✅', label: 'Order Disetujui' },
  order_delivered: { icon: '🚚', label: 'Barang Diterima' },
  fraud_detected: { icon: '⚠️', label: 'Kecurangan Terdeteksi' },
  performance_alert: { icon: '📊', label: 'Performa' },
}

export function NotificationDropdown() {
  const {
    notifications,
    unreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useAutoOrderStore()

  const [open, setOpen] = useState(false)

  const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    markAsRead(notificationId)
  }

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification(notificationId)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
            {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
          </span>
        )}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <Card className="absolute right-0 top-12 z-50 w-[400px] max-w-[calc(100vw-2rem)] shadow-lg">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="font-semibold">Notifikasi</h3>
                  <p className="text-xs text-muted-foreground">
                    {unreadNotifications.length} belum dibaca
                  </p>
                </div>
                <div className="flex gap-2">
                  {unreadNotifications.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAllAsRead()}
                      title="Tandai semua sudah dibaca"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => clearAllNotifications()}
                      title="Hapus semua notifikasi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Tidak ada notifikasi</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification
  onMarkAsRead: (id: string, e: React.MouseEvent) => void
  onDelete: (id: string, e: React.MouseEvent) => void
}) {
  const config = typeConfig[notification.type] || { icon: '🔔', label: notification.type }
  const severity = severityConfig[notification.severity]

  return (
    <div
      className={cn(
        "relative p-4 transition-colors hover:bg-muted/50",
        !notification.read && "bg-muted/30",
        severity.bg
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg",
          severity.border
        )}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            </div>
            {!notification.read && (
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0"
                onClick={(e) => onMarkAsRead(notification.id, e)}
                title="Tandai sudah dibaca"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(notification.createdAt)}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => onDelete(notification.id, e)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Action URL */}
          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              className="text-xs text-primary hover:underline"
              onClick={(e) => {
                onMarkAsRead(notification.id, e)
              }}
            >
              Lihat Detail →
            </a>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
      )}
    </div>
  )
}
