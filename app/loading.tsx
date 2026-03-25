/**
 * Global Loading Page
 * Shown while the app is loading or checking authentication
 */

import { Loader2 } from 'lucide-react'

export default function LoadingPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Memuat...</h1>
          <p className="text-sm text-muted-foreground">
            Mohon tunggu sebentar
          </p>
        </div>
      </div>
    </div>
  )
}
