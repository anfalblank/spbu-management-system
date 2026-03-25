/**
 * SPBU Shift Management Page
 * Allows creating, opening, and closing shifts
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Clock, User, Wallet, CheckCircle2, XCircle, AlertCircle, Plus } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useSPBUStore } from '@/store'
import { useAuthStore } from '@/store'
import type { Shift, ShiftStatus } from '@/store'

const shiftConfig = {
  1: { name: 'Shift 1', time: '06:00 - 14:00' },
  2: { name: 'Shift 2', time: '14:00 - 22:00' },
  3: { name: 'Shift 3', time: '22:00 - 06:00' },
}

const statusConfig: Record<ShiftStatus, { label: string; variant: any; icon: any }> = {
  pending: { label: 'Belum Dibuka', variant: 'secondary', icon: Clock },
  open: { label: 'Sedang Berjalan', variant: 'default', icon: CheckCircle2 },
  closed: { label: 'Ditutup', variant: 'outline', icon: XCircle },
  settled: { label: 'Selesai', variant: 'default', icon: CheckCircle2 },
}

export default function ShiftPage() {
  const { user } = useAuthStore()
  const {
    shifts,
    currentShift,
    selectedShift,
    isLoading,
    createShift,
    openShift,
    closeShift,
    setSelectedShift,
  } = useSPBUStore()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showOpenDialog, setShowOpenDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [selectedShiftNumber, setSelectedShiftNumber] = useState<1 | 2 | 3>(1)
  const [openingCash, setOpeningCash] = useState('')
  const [closingCash, setClosingCash] = useState('')
  const [closingNotes, setClosingNotes] = useState('')

  // Filter shifts for today
  const today = new Date().toISOString().split('T')[0]
  const todayShifts = shifts.filter((s) => s.date === today)

  const handleCreateShift = () => {
    if (!user) return

    const shift = createShift({
      date: today,
      number: selectedShiftNumber,
      operator: user.name,
      operatorId: user.id,
      status: 'pending',
      openingCash: 0,
      startTime: new Date().toISOString(),
    })

    setShowCreateDialog(false)
    setSelectedShift(shift)
  }

  const handleOpenShift = () => {
    if (!selectedShift) return

    openShift(selectedShift.id, parseFloat(openingCash) || 0)
    setShowOpenDialog(false)
    setOpeningCash('')
  }

  const handleCloseShift = () => {
    if (!currentShift) return

    closeShift(currentShift.id, parseFloat(closingCash) || 0, closingNotes)
    setShowCloseDialog(false)
    setClosingCash('')
    setClosingNotes('')
  }

  const getStatusBadge = (status: ShiftStatus) => {
    const config = statusConfig[status]
    return (
      <Badge variant={config.variant} className="gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Shift</h1>
          <p className="text-muted-foreground mt-1">
            Kelola shift operasional SPBU dan kas kasir
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Shift Baru
        </Button>
      </div>

      {/* Current Shift Card */}
      {currentShift ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Shift Sedang Berjalan
                </CardTitle>
                <CardDescription>
                  {shiftConfig[currentShift.number].name} • {currentShift.date}
                </CardDescription>
              </div>
              {getStatusBadge(currentShift.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Operator</p>
                <p className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {currentShift.operator}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Jam Operasional</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {shiftConfig[currentShift.number].time}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Kas Awal</p>
                <p className="font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  {formatCurrency(currentShift.openingCash)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button onClick={() => setShowCloseDialog(true)} variant="destructive">
                Tutup Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Tidak Ada Shift Aktif</h3>
              <p className="text-muted-foreground mt-2">
                Buat shift baru untuk memulai operasional SPBU
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Hari Ini</CardTitle>
          <CardDescription>{today}</CardDescription>
        </CardHeader>
        <CardContent>
          {todayShifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada shift untuk hari ini
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {todayShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      shift.status === 'open' && "border-primary bg-primary/5",
                      shift.status === 'closed' && "border-muted bg-muted/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{shiftConfig[shift.number].name}</h4>
                          {getStatusBadge(shift.status)}
                        </div>
                        <div className="grid gap-2 text-sm md:grid-cols-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            {shift.operator}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {shift.startTime ? new Date(shift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Wallet className="h-4 w-4" />
                            {formatCurrency(shift.openingCash)}
                          </div>
                        </div>
                        {shift.endTime && (
                          <div className="mt-2 pt-2 border-t text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">
                                Tutup: {new Date(shift.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {shift.closingCash && (
                                <span className="font-medium">
                                  Kas Akhir: {formatCurrency(shift.closingCash)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {shift.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedShift(shift)
                              setShowOpenDialog(true)
                            }}
                          >
                            Buka Shift
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Shift Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Shift Baru</DialogTitle>
            <DialogDescription>
              Pilih nomor shift untuk hari ini
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nomor Shift</Label>
              <Tabs value={selectedShiftNumber.toString()} onValueChange={(v) => setSelectedShiftNumber(Number(v) as 1 | 2 | 3)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="1">Shift 1</TabsTrigger>
                  <TabsTrigger value="2">Shift 2</TabsTrigger>
                  <TabsTrigger value="3">Shift 3</TabsTrigger>
                </TabsList>
                <TabsContent value="1" className="mt-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-medium">Shift 1</p>
                    <p className="text-sm text-muted-foreground">06:00 - 14:00</p>
                  </div>
                </TabsContent>
                <TabsContent value="2" className="mt-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-medium">Shift 2</p>
                    <p className="text-sm text-muted-foreground">14:00 - 22:00</p>
                  </div>
                </TabsContent>
                <TabsContent value="3" className="mt-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="font-medium">Shift 3</p>
                    <p className="text-sm text-muted-foreground">22:00 - 06:00</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateShift}>
              Buat Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Open Shift Dialog */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buka Shift</DialogTitle>
            <DialogDescription>
              Masukkan kas awal untuk memulai shift
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opening-cash">Kas Awal</Label>
              <Input
                id="opening-cash"
                type="number"
                placeholder="0"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Masukkan jumlah uang tunai yang ada di kasir
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleOpenShift} disabled={!openingCash}>
              Buka Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutup Shift</DialogTitle>
            <DialogDescription>
              Masukkan kas akhir dan catatan penutupan shift
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="closing-cash">Kas Akhir</Label>
              <Input
                id="closing-cash"
                type="number"
                placeholder="0"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Jumlah uang tunai yang ada di kasir saat ini
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing-notes">Catatan (Opsional)</Label>
              <Input
                id="closing-notes"
                placeholder="Kejadian penting selama shift..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
              />
            </div>
            {currentShift && closingCash && (
              <div className={cn(
                "p-3 rounded-lg border",
                parseFloat(closingCash) >= currentShift.openingCash
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-amber-500/10 border-amber-500/20"
              )}>
                <p className="text-sm font-medium">
                  {parseFloat(closingCash) >= currentShift.openingCash ? 'Kelebihan:' : 'Kekurangan:'}
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(Math.abs(parseFloat(closingCash) - currentShift.openingCash))}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleCloseShift} variant="destructive" disabled={!closingCash}>
              Tutup Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
