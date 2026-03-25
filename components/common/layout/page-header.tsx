'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

/**
 * Generic page header component
 */
export interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string

  // Actions
  actions?: ReactNode
  backAction?: () => void
  backLabel?: string

  // Breadcrumb
  breadcrumb?: Array<{
    label: string
    href?: string
    onClick?: () => void
  }>

  // Styling
  className?: string
  size?: 'sm' | 'md' | 'lg'
  align?: 'left' | 'center' | 'right'
}

export function PageHeader({
  title,
  subtitle,
  description,
  actions,
  backAction,
  backLabel = 'Kembali',
  breadcrumb,
  className,
  size = 'md',
  align = 'left',
}: PageHeaderProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Back Button */}
      {backAction && (
        <Button
          variant="ghost"
          onClick={backAction}
          className="mb-2 -ml-3 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      )}

      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumb.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ArrowRight className="h-3 w-3" />}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <button
                  onClick={crumb.onClick}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Header Content */}
      <div
        className={cn(
          'flex items-center gap-4',
          align === 'center' && 'justify-center',
          align === 'right' && 'justify-end'
        )}
      >
        <div className="flex-1">
          <h1 className={cn('font-bold tracking-tight', sizeClasses[size])}>
            {title}
          </h1>
          {(subtitle || description) && (
            <p className="text-muted-foreground mt-1">
              {subtitle || description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}
