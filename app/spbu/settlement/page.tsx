/**
 * SPBU Settlement Page
 * Manages settlement for dispensers per shift
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Gauge, Clock, DollarSign, AlertCircle, Plus, CheckCircle2, X } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useSPBUStore } from '@/store'
import { useAuthStore } from '@/store'
import type { Settlement, SettlementNozzle, FuelType, SettlementStatus } from '@/store'

const fuelColors: Record<FuelType, string> = {
  'Pertalite': 'bg-sky-500',
  'Pertamax': 'bg-teal-500',
  'Pertamax Turbo': 'bg-purple-500',
  'Solar': 'bg-amber-500',
  'Dexlite': 'bg-green-500',
  'Dex': 'bg-emerald-500',
}

const statusConfig: Record<SettlementStatus, { label: string; variant: any }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Menunggu Approval', variant: 'default' },
  approved: { label: 'Disetujui', variant: 'default' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

export default function SettlementPage() {
  const { user } = useAuthStore()
  const {
    dispensers,
    shifts,
    currentShift,
    settlements,
    selectedSettlement,
    isLoading,
    createSettlement,
    submitSettlement,
    approveSettlement,
    rejectSettlement,
    setSelectedSettlement,
  } = useSPBUStore()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedDispenser, setSelectedDispenser] = useState<string | null>(null)
  const [nozzleData, setNozzleData] = useState<SettlementNozzle[]>([])

  // Filter settlements
  const today = new Date().toISOString().split('T')[0]
  const todaySettlements = settlements.filter((s) => s.date === today)

  // Get active shift for settlement
  const activeShifts = shifts.filter((s) => s.status === 'closed' && s.date === today)

  const handleSelectDispenser = (dispenserId: string) => {
    const dispenser = dispensers.find((d) => d.id === dispenserId)
    if (!dispenser) return

    setSelectedDispenser(dispenserId)
    // Initialize nozzle data with empty values
    setNozzleData(dispenser.nozzles.map((nozzle) => ({
      nozzleId: nozzle.id,
      nozzleNumber: nozzle.number,
      fuelType: nozzle.fuelType,
      openingMeter: 0,
      closingMeter: 0,
      volume: 0,
      pricePerLiter: nozzle.pricePerLiter,
      total: 0,
      testVolume: 0,
    })))
  }

  const handleNozzleChange = (index: number, field: keyof SettlementNozzle, value: number) => {
    const updated = [...nozzleData]
    updated[index] = { ...updated[index], [field]: value }

    // Auto-calculate volume and total
    if (field === 'closingMeter' || field === 'openingMeter') {
      const opening = updated[index].openingMeter
      const closing = updated[index].closingMeter
      const volume = closing - opening
      updated[index].volume = volume > 0 ? volume : 0
      updated[index].total = updated[index].volume * updated[index].pricePerLiter
    }

    if (field === 'volume') {
      updated[index].total = value * updated[index].pricePerLiter
    }

    setNozzleData(updated)
  }

  const handleCreateSettlement = () => {
    if (!selectedDispenser || !currentShift || !user) return

    const dispenser = dispensers.find((d) => d.id === selectedDispenser)
    if (!dispenser) return

    createSettlement({
      shiftId: currentShift.id,
      date: today,
      shiftNumber: currentShift.number,
      dispenserId: dispenser.id,
      dispenserName: dispenser.name,
      nozzleData,
      payments: [], // To be filled from POS
      totalVolume: 0,
      totalRevenue: 0,
      testVolumeTotal: 0,
      testRevenueTotal: 0,
    })

    setShowCreateDialog(false)
    setSelectedDispenser(null)
    setNozzleData([])
  }

  const handleSubmitSettlement = (id: string) => {
    if (!user) return
    submitSettlement(id, user.id)
    setShowViewDialog(false)
  }

  const handleApproveSettlement = (id: string) => {
    if (!user) return
    approveSettlement(id, user.id)
    setShowViewDialog(false)
  }

  const handleRejectSettlement = (id: string) => {
    rejectSettlement(id)
    setShowViewDialog(false)
  }

  const calculateTotalVolume = () => {
    return nozzleData.reduce((sum, n) => sum + n.volume - (n.testVolume || 0), 0)
  }

  const calculateTotalRevenue = () => {
    return nozzleData.reduce((sum, n) => sum + n.total - (n.testVolume || 0) * n.pricePerLiter, 0)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settlement SPBU</h1>
          <p className="text-muted-foreground mt-1">
            Catat meteran awal dan akhir per nozzle setiap shift
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} disabled={!currentShift}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Settlement Baru
        </Button>
      </div>

      {!currentShift && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Shift belum aktif. Buka shift terlebih dahulu sebelum membuat settlement.
          </AlertDescription>
        </Alert>
      )}

      {/* Today's Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>Settlement Hari Ini</CardTitle>
          <CardDescription>{today}</CardDescription>
        </CardHeader>
        <CardContent>
          {todaySettlements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada settlement untuk hari ini
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {todaySettlements.map((settlement) => (
                  <div
                    key={settlement.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedSettlement(settlement)
                      setShowViewDialog(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{settlement.dispenserName}</h4>
                          <Badge variant="outline">Shift {settlement.shiftNumber}</Badge>
                          {statusConfig[settlement.status].variant && (
                            <Badge variant={statusConfig[settlement.status].variant}>
                              {statusConfig[settlement.status].label}
                            </Badge>
                          )}
                        </div>
                        <div className="grid gap-2 text-sm md:grid-cols-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Gauge className="h-4 w-4" />
                            {settlement.totalVolume.toFixed(2)} Liter
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(settlement.totalRevenue)}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {new Date(settlement.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Settlement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Buat Settlement Baru</DialogTitle>
            <DialogDescription>
              Pilih dispenser dan masukkan data meteran nozzle
            </DialogDescription>
          </DialogHeader>

          {!selectedDispenser ? (
            <div className="flex-1 overflow-y-auto">
              <Label className="mb-4 block">Pilih Dispenser</Label>
              <div className="grid gap-3">
                {dispensers.map((dispenser) => (
                  <Button
                    key={dispenser.id}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => handleSelectDispenser(dispenser.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Gauge className={cn("h-8 w-8", dispenser.status === 'active' ? 'text-primary' : 'text-muted-foreground')} />
                      <div className="text-left">
                        <p className="font-medium">{dispenser.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dispenser.nozzles.length} Nozzle • {dispenser.location}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{dispensers.find((d) => d.id === selectedDispenser)?.name}</p>
                  <p className="text-sm text-muted-foreground">Shift {currentShift?.number}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDispenser(null)}>
                  <X className="h-4 w-4 mr-1" />
                  Ganti
                </Button>
              </div>

              <div className="space-y-3">
                {nozzleData.map((nozzle, index) => (
                  <Card key={nozzle.nozzleId}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn("h-3 w-3 rounded-full", fuelColors[nozzle.fuelType])} />
                        <h4 className="font-medium">Nozzle {nozzle.nozzleNumber}</h4>
                        <Badge variant="outline">{nozzle.fuelType}</Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label>Meteran Awal</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={nozzle.openingMeter || ''}
                            onChange={(e) => handleNozzleChange(index, 'openingMeter', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Meteran Akhir</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={nozzle.closingMeter || ''}
                            onChange={(e) => handleNozzleChange(index, 'closingMeter', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Volume (Liter)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={nozzle.volume || ''}
                            onChange={(e) => handleNozzleChange(index, 'volume', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Volume Bakteri</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={nozzle.testVolume || ''}
                            onChange={(e) => handleNozzleChange(index, 'testVolume', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Harga/Liter</p>
                          <p className="font-medium">{formatCurrency(nozzle.pricePerLiter)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-medium">{formatCurrency(nozzle.total)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Volume</span>
                      <span className="font-medium">{calculateTotalVolume().toFixed(2)} Liter</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pendapatan</span>
                      <span className="font-medium">{formatCurrency(calculateTotalRevenue())}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              setSelectedDispenser(null)
              setNozzleData([])
            }}>
              Batal
            </Button>
            <Button onClick={handleCreateSettlement} disabled={!selectedDispenser || nozzleData.length === 0}>
              Simpan Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Settlement Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Detail Settlement</DialogTitle>
            <DialogDescription>
              {selectedSettlement?.dispenserName} • Shift {selectedSettlement?.shiftNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedSettlement && (
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {/* Nozzle Data */}
                <div className="space-y-3">
                  {selectedSettlement.nozzleData.map((nozzle) => (
                    <Card key={nozzle.nozzleId}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={cn("h-3 w-3 rounded-full", fuelColors[nozzle.fuelType])} />
                          <h4 className="font-medium">Nozzle {nozzle.nozzleNumber}</h4>
                          <Badge variant="outline">{nozzle.fuelType}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Meteran Awal</p>
                            <p className="font-medium">{nozzle.openingMeter.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Meteran Akhir</p>
                            <p className="font-medium">{nozzle.closingMeter.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Volume</p>
                            <p className="font-medium">{nozzle.volume.toFixed(2)} Liter</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">{formatCurrency(nozzle.total)}</p>
                          </div>
                        </div>

                        {nozzle.testVolume && nozzle.testVolume > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground">Volume Bakteri: {nozzle.testVolume.toFixed(2)} Liter</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Totals */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Volume</span>
                        <span className="font-medium">{selectedSettlement.totalVolume.toFixed(2)} Liter</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Pendapatan</span>
                        <span className="font-medium">{formatCurrency(selectedSettlement.totalRevenue)}</span>
                      </div>
                      {selectedSettlement.testVolumeTotal > 0 && (
                        <>
                          <div className="flex justify-between text-amber-600">
                            <span>Volume Bakteri</span>
                            <span>-{selectedSettlement.testVolumeTotal.toFixed(2)} Liter</span>
                          </div>
                          <div className="flex justify-between text-amber-600">
                            <span>Pendapatan Bakteri</span>
                            <span>-{formatCurrency(selectedSettlement.testRevenueTotal)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Pendapatan Bersih</span>
                        <span>{formatCurrency(selectedSettlement.totalNetRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusConfig[selectedSettlement.status].variant}>
                          {statusConfig[selectedSettlement.status].label}
                        </Badge>
                      </div>
                      {selectedSettlement.submittedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Diajukan</span>
                          <span>{new Date(selectedSettlement.submittedAt).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {selectedSettlement.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Disetujui</span>
                          <span>{new Date(selectedSettlement.approvedAt).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Tutup
            </Button>
            {selectedSettlement?.status === 'draft' && (
              <Button onClick={() => handleSubmitSettlement(selectedSettlement.id)}>
                Ajukan Approval
              </Button>
            )}
            {selectedSettlement?.status === 'submitted' && user?.role === 'admin' && (
              <>
                <Button variant="destructive" onClick={() => handleRejectSettlement(selectedSettlement.id)}>
                  Tolak
                </Button>
                <Button onClick={() => handleApproveSettlement(selectedSettlement.id)}>
                  Setujui
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
