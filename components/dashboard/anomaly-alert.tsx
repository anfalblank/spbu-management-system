/**
 * Anomaly Alert Component
 * Displays detected anomalies with severity indicators
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, AlertCircle, XCircle, Info, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Anomaly } from '@/lib/ai/predictions'

interface AnomalyAlertProps {
  anomaly: Anomaly
  onDismiss?: () => void
  onAction?: () => void
}

export function AnomalyAlert({ anomaly, onDismiss, onAction }: AnomalyAlertProps) {
  const severityConfig = {
    low: {
      icon: Info,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      label: 'Info'
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      label: 'Warning'
    },
    high: {
      icon: AlertCircle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      label: 'High'
    },
    critical: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      label: 'Critical'
    }
  }

  const config = severityConfig[anomaly.severity]
  const Icon = config.icon

  return (
    <Card className={cn("border-l-4", config.borderColor, config.bgColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base">{anomaly.title}</CardTitle>
                <Badge variant="outline" className={cn(config.color, "border-current")}>
                  {config.label}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {anomaly.description}
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={onDismiss}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      {anomaly.suggestedAction && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Saran: </span>
              <span className="text-muted-foreground">{anomaly.suggestedAction}</span>
            </div>
            {onAction && (
              <Button size="sm" variant="outline" onClick={onAction}>
                Lihat Detail
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

interface AnomalyListProps {
  anomalies: Anomaly[]
  maxDisplay?: number
  onDismiss?: (id: string) => void
  onAction?: (anomaly: Anomaly) => void
}

export function AnomalyList({ anomalies, maxDisplay = 5, onDismiss, onAction }: AnomalyListProps) {
  const displayAnomalies = anomalies.slice(0, maxDisplay)

  if (displayAnomalies.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
            <p>Tidak ada anomali terdeteksi</p>
            <p className="text-sm mt-1">Semua sistem beroperasi normal</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {displayAnomalies.map((anomaly) => (
        <AnomalyAlert
          key={anomaly.id}
          anomaly={anomaly}
          onDismiss={onDismiss ? () => onDismiss(anomaly.id) : undefined}
          onAction={onAction ? () => onAction(anomaly) : undefined}
        />
      ))}
      {anomalies.length > maxDisplay && (
        <Button variant="outline" className="w-full">
          Lihat {anomalies.length - maxDisplay} Anomali Lainnya
        </Button>
      )}
    </div>
  )
}

import { CheckCircle2 } from 'lucide-react'
