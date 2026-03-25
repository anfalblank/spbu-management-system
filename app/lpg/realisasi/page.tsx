/**
 * LPG Realisasi (Delivery Recording) Page
 * Records and manages LPG deliveries to customers
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Truck, Plus, CheckCircle2, XCircle, Clock, Package } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useLPGStore } from '@/store'
import { useAuthStore } from '@/store'
import type { RealisasiItem, RealisasiStatus, LPGProductType } from '@/store'

const statusConfig: Record<RealisasiStatus, { label: string; variant: any; icon: any }> = {
  pending: { label: 'Menunggu Approval', variant: 'secondary', icon: Clock },
  approved: { label: 'Disetujui', variant: 'default', icon: CheckCircle2 },
  rejected: { label: 'Ditolak', variant: 'destructive', icon: XCircle },
  delivered: { label: 'Terkirim', variant: 'default', icon: CheckCircle2 },
}

const productConfig: Record<LPGProductType, { name: string; color: string }> = {
  '3kg': { name: 'LPG 3kg', color: 'bg-sky-500' },
  '5.5kg': { name: 'LPG 5.5kg', color: 'bg-teal-500' },
  '12kg': { name: 'LPG 12kg', color: 'bg-purple-500' },
  '50kg': { name: 'LPG 50kg', color: 'bg-amber-500' },
}

export default function RealisasiPage() {
  const { user } = useAuthStore()
  const {
    salesAgreements,
    activeSalesAgreements,
    realisasi,
    pendingRealisasi,
    selectedRealisasi,
    isLoading,
    createRealisasi,
    approveRealisasi,
    rejectRealisasi,
    deliverRealisasi,
    checkQuotaAvailability,
    setSelectedRealisasi,
  } = useLPGStore()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'pending' | 'all'>('pending')

  // Form state
  const [formData, setFormData] = useState({
    salesAgreementId: '',
    quantity: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: '',
    recipientName: '',
    recipientPhone: '',
    driverName: '',
    vehiclePlate: '',
    notes: '',
  })

  const [quotaCheck, setQuotaCheck] = useState<{ available: boolean; remainingQuota: number } | null>(null)

  const handleSAChange = (saId: string) => {
    setFormData({ ...formData, salesAgreementId: saId })
    const check = checkQuotaAvailability(saId, parseFloat(formData.quantity) || 0)
    setQuotaCheck(check)
  }

  const handleQuantityChange = (quantity: string) => {
    setFormData({ ...formData, quantity })
    if (formData.salesAgreementId) {
      const check = checkQuotaAvailability(formData.salesAgreementId, parseFloat(quantity) || 0)
      setQuotaCheck(check)
    }
  }

  const handleCreateRealisasi = () => {
    if (!user || !formData.salesAgreementId) return

    const sa = salesAgreements.find((s) => s.id === formData.salesAgreementId)
    if (!sa) return

    try {
      createRealisasi({
        salesAgreementId: formData.salesAgreementId,
        salesAgreementNumber: sa.number,
        customerId: sa.customerId,
        customerName: sa.customerName,
        productType: sa.productType,
        category: sa.category,
        quantity: parseInt(formData.quantity),
        unitPrice: sa.pricePerUnit,
        totalPrice: parseInt(formData.quantity) * sa.pricePerUnit,
        deliveryDate: formData.deliveryDate,
        deliveryAddress: formData.deliveryAddress || sa.customerId, // Use customer ID as placeholder
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        driverName: formData.driverName,
        vehiclePlate: formData.vehiclePlate,
        notes: formData.notes,
        status: 'pending',
        createdBy: user.id,
      })

      setShowCreateDialog(false)
      setFormData({
        salesAgreementId: '',
        quantity: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryAddress: '',
        recipientName: '',
        recipientPhone: '',
        driverName: '',
        vehiclePlate: '',
        notes: '',
      })
      setQuotaCheck(null)
    } catch (error) {
      console.error('Error creating realisasi:', error)
      alert(error instanceof Error ? error.message : 'Gagal membuat realisasi')
    }
  }

  const handleApprove = (id: string) => {
    if (!user) return
    approveRealisasi(id, user.id)
    setShowViewDialog(false)
  }

  const handleReject = (id: string) => {
    const reason = prompt('Alasan penolakan:')
    if (reason) {
      rejectRealisasi(id, reason)
      setShowViewDialog(false)
    }
  }

  const handleDeliver = (id: string) => {
    const deliveredAt = new Date().toISOString()
    deliverRealisasi(id, deliveredAt)
    setShowViewDialog(false)
  }

  const displayRealisasi = selectedTab === 'pending' ? pendingRealisasi : realisasi

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Realisasi Pengiriman LPG</h1>
          <p className="text-muted-foreground mt-1">
            Catat distribusi LPG ke pelanggan
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Catat Pengiriman Baru
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingRealisasi.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Realisasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{realisasi.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volume Terkirim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {realisasi.filter((r) => r.status === 'delivered').reduce((sum, r) => sum + r.quantity, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(realisasi.filter((r) => r.status === 'delivered').reduce((sum, r) => sum + r.totalPrice, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Menunggu ({pendingRealisasi.length})</TabsTrigger>
          <TabsTrigger value="all">Semua ({realisasi.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {displayRealisasi.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Tidak Ada Realisasi</h3>
                  <p className="text-muted-foreground mt-2">
                    Catat pengiriman LPG untuk memulai realisasi
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayRealisasi.map((item) => {
                      const status = statusConfig[item.status]
                      const product = productConfig[item.productType]

                      return (
                        <TableRow
                          key={item.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedRealisasi(item)
                            setShowViewDialog(true)
                          }}
                        >
                          <TableCell>
                            {new Date(item.deliveryDate).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.customerName}</p>
                              <p className="text-xs text-muted-foreground">{item.salesAgreementNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn("h-2 w-2 rounded-full", product.color)} />
                              <span>{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity} unit</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="gap-1">
                              <status.icon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedRealisasi(item)
                                setShowViewDialog(true)
                              }}
                            >
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Realisasi Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Pengiriman Baru</DialogTitle>
            <DialogDescription>
              Catat distribusi LPG ke pelanggan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="sales-agreement">Sales Agreement</Label>
              <Select
                value={formData.salesAgreementId}
                onValueChange={handleSAChange}
              >
                <SelectTrigger id="sales-agreement">
                  <SelectValue placeholder="Pilih SA" />
                </SelectTrigger>
                <SelectContent>
                  {activeSalesAgreements.map((sa) => {
                    const product = productConfig[sa.productType]
                    return (
                      <SelectItem key={sa.id} value={sa.id}>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", product.color)} />
                          <span>{sa.number} - {sa.customerName}</span>
                          <span className="text-muted-foreground">({sa.remainingQuota} unit)</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {quotaCheck && (
              <div className={cn(
                "p-3 rounded-lg border",
                quotaCheck.available ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
              )}>
                <p className="text-sm font-medium">
                  {quotaCheck.available ? '✓ Quota Tersedia' : '✗ Quota Tidak Mencukupi'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sisa quota: {quotaCheck.remainingQuota} unit
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah (Unit)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="10"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-date">Tanggal Pengiriman</Label>
              <Input
                id="delivery-date"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-name">Nama Penerima</Label>
              <Input
                id="recipient-name"
                placeholder="Nama penerima barang"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-phone">No. HP Penerima</Label>
              <Input
                id="recipient-phone"
                placeholder="08123456789"
                value={formData.recipientPhone}
                onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-name">Nama Supir (Opsional)</Label>
              <Input
                id="driver-name"
                placeholder="Nama supir"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-plate">Plat Kendaraan (Opsional)</Label>
              <Input
                id="vehicle-plate"
                placeholder="B 1234 ABC"
                value={formData.vehiclePlate}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Input
                id="notes"
                placeholder="Keterangan tambahan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateRealisasi} disabled={!quotaCheck?.available}>
              Simpan Realisasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Realisasi Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Realisasi</DialogTitle>
          </DialogHeader>

          {selectedRealisasi && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">No. Realisasi</span>
                    <span className="font-medium">{selectedRealisasi.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sales Agreement</span>
                    <span className="font-medium">{selectedRealisasi.salesAgreementNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pelanggan</span>
                    <span className="font-medium">{selectedRealisasi.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produk</span>
                    <span className="font-medium">{productConfig[selectedRealisasi.productType].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah</span>
                    <span className="font-medium">{selectedRealisasi.quantity} unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{formatCurrency(selectedRealisasi.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal Kirim</span>
                    <span className="font-medium">{new Date(selectedRealisasi.deliveryDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Penerima</span>
                    <span className="font-medium">{selectedRealisasi.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">No. HP</span>
                    <span className="font-medium">{selectedRealisasi.recipientPhone}</span>
                  </div>
                  {selectedRealisasi.driverName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Supir</span>
                      <span className="font-medium">{selectedRealisasi.driverName}</span>
                    </div>
                  )}
                  {selectedRealisasi.vehiclePlate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kendaraan</span>
                      <span className="font-medium">{selectedRealisasi.vehiclePlate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={statusConfig[selectedRealisasi.status].variant}>
                      {statusConfig[selectedRealisasi.status].label}
                    </Badge>
                  </div>
                </div>

                {selectedRealisasi.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Catatan:</p>
                    <p className="text-sm">{selectedRealisasi.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Tutup
            </Button>
            {selectedRealisasi?.status === 'pending' && user?.role === 'admin' && (
              <>
                <Button variant="destructive" onClick={() => handleReject(selectedRealisasi.id)}>
                  Tolak
                </Button>
                <Button onClick={() => handleApprove(selectedRealisasi.id)}>
                  Setujui
                </Button>
              </>
            )}
            {selectedRealisasi?.status === 'approved' && (
              <Button onClick={() => handleDeliver(selectedRealisasi.id)}>
                <Truck className="h-4 w-4 mr-2" />
                Konfirmasi Terkirim
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
