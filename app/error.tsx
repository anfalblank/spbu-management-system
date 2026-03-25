/**
 * Global Error Page
 * Shown when an unhandled error occurs
 */

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Terjadi Kesalahan
            </h1>
            <p className="text-muted-foreground">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi tim teknis jika masalah berlanjut.
            </p>
          </div>

          {error.message && process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-left font-mono text-xs">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="flex items-center gap-2"
            size="lg"
          >
            <RefreshCcw className="h-4 w-4" />
            Coba Lagi
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
          >
            Kembali ke Beranda
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Error Code: {error.digest || 'UNKNOWN'}
        </div>
      </div>
    </div>
  )
}
