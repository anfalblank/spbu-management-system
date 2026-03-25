/**
 * Notification Bell Component
 * Displays notification bell icon with unread count badge
 */

'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAutoOrderStore } from '@/store'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const { unreadNotifications } = useAutoOrderStore()
  const unreadCount = unreadNotifications.length

  return (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className={cn(
          "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white",
          unreadCount > 9 ? "bg-destructive" : "bg-primary"
        )}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  )
}
