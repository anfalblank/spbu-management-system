'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle as ShadcnDialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

/**
 * Generic modal wrapper with consistent styling
 */
export interface BaseModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string

  // Content
  children: ReactNode

  // Actions
  primaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  showCloseButton?: boolean

  // Styling
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  showHeader?: boolean
  headerClassName?: string
  contentClassName?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
}

export function BaseModal({
  open,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  showCloseButton = true,
  size = 'md',
  className,
  showHeader = true,
  headerClassName,
  contentClassName,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          'flex flex-col max-h-[90vh]',
          className
        )}
      >
        {showHeader && (
          <DialogHeader className={cn('flex-shrink-0', headerClassName)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {title && <ShadcnDialogTitle>{title}</ShadcnDialogTitle>}
                {description && (
                  <DialogDescription>{description}</DialogDescription>
                )}
              </div>
              {showCloseButton && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>
        )}

        <div className={cn('flex-1 overflow-y-auto', contentClassName)}>
          {children}
        </div>

        {(primaryAction || secondaryAction) && (
          <div className="flex gap-2 justify-end flex-shrink-0 pt-4 border-t">
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                disabled={primaryAction?.loading}
              >
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || primaryAction.loading}
              >
                {primaryAction.loading ? 'Memproses...' : primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
