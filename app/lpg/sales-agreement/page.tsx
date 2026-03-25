/**
 * LPG Sales Agreement (SA) Management Page
 * Manages Sales Agreements for subsidized LPG distribution
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { FileText, Plus, CheckCircle2, XCircle, AlertCircle, Pause, Play } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useLPGStore } from '@/store'
import { useAuthStore } from '@/store'
import type { SalesAgreement, SalesAgreementStatus, LPGProductType } from '@/store'

const statusConfig: Record<SalesAgreementStatus, { label: string; variant: any; icon: any }> = {
  active: { label: 'Aktif', variant: 'default', icon: CheckCircle2 },
  completed: { label: 'Selesai', variant: 'secondary', icon: CheckCircle2 },
  suspended: { label: 'Ditangguhkan', variant: 'warning', icon: Pause },
  expired: { label: 'Kedaluwarsa', variant: 'destructive', icon: XCircle },
  cancelled: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle },
}

const productConfig: Record<LPGProductType, { name: string; color: string }> = {
  '3kg': { name: 'LPG 3kg', color: 'bg-sky-500' },
  '5.5kg': { name: 'LPG 5.5kg', color: 'bg-teal-500' },
  '12kg': { name: 'LPG 12kg', color: 'bg-purple-500' },
  '50kg': { name: 'LPG 50kg', color: 'bg-amber-500' },
}

export default function SalesAgreementPage() {
  const { user } = useAuthStore()
  const {
    salesAgreements,
    activeSalesAgreements,
    selectedSalesAgreement,
    isLoading,
    createSalesAgreement,
    updateSalesAgreement,
    suspendSalesAgreement,
    activateSalesAgreement,
    setSelectedSalesAgreement,
  } = useLPGStore()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'active' | 'all'>('active')

  // Form state
  const [formData, setFormData] = useState({
    number: '',
    customerId: '',
    customerName: '',
    productType: '3kg' as LPGProductType,
    quota: '',
    startDate: '',
    endDate: '',
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
    pricePerUnit: '',
    notes: '',
  })

  const handleCreateSA = () => {
    if (!user) return

    try {
      createSalesAgreement({
        number: formData.number,
        customerId: formData.customerId,
        customerName: formData.customerName,
        productType: formData.productType,
        category: 'subsidi',
        quota: parseFloat(formData.quota),
        quotaUnit: 'unit',
        startDate: formData.startDate,
        endDate: formData.endDate,
        period: formData.period,
        status: 'active',
        pricePerUnit: parseFloat(formData.pricePerUnit),
        notes: formData.notes,
      })

      setShowCreateDialog(false)
      setFormData({
        number: '',
        customerId: '',
        customerName: '',
        productType: '3kg',
        quota: '',
        startDate: '',
        endDate: '',
        period: new Date().toISOString().slice(0, 7),
        pricePerUnit: '',
        notes: '',
      })
    } catch (error) {
      console.error('Error creating SA:', error)
    }
  }

  const handleSuspendSA = (id: string) => {
    const reason = prompt('Alasan penangguhan:')
    if (reason) {
      suspendSalesAgreement(id, reason)
    }
  }

  const displayAgreements = selectedTab === 'active' ? activeSalesAgreements : salesAgreements

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Agreement LPG</h1>
          <p className="text-muted-foreground mt-1">
            Kelola perjanjian jual beli LPG subsidi
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Buat SA Baru
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total SA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{salesAgreements.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SA Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeSalesAgreements.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {activeSalesAgreements.reduce((sum, sa) => sum + sa.quota, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Terealisasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {activeSalesAgreements.reduce((sum, sa) => sum + sa.realizedQuota, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList>
          <TabsTrigger value="active">Aktif ({activeSalesAgreements.length})</TabsTrigger>
          <TabsTrigger value="all">Semua ({salesAgreements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {displayAgreements.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Tidak Ada Sales Agreement</h3>
                  <p className="text-muted-foreground mt-2">
                    Buat Sales Agreement baru untuk memulai distribusi LPG
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayAgreements.map((sa) => {
                const status = statusConfig[sa.status]
                const product = productConfig[sa.productType]
                const utilizationPercentage = (sa.realizedQuota / sa.quota) * 100

                return (
                  <Card
                    key={sa.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      sa.status === 'active' && "border-primary/50"
                    )}
                    onClick={() => {
                      setSelectedSalesAgreement(sa)
                      setShowViewDialog(true)
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("h-3 w-3 rounded-full", product.color)} />
                          <div>
                            <CardTitle className="text-base">{sa.number}</CardTitle>
                            <CardDescription>{sa.customerName}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={status.variant} className="gap-1">
                          <status.icon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Produk</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Periode</span>
                          <span className="font-medium">{sa.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Berlaku</span>
                          <span className="font-medium">
                            {new Date(sa.startDate).toLocaleDateString('id-ID')} - {new Date(sa.endDate).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Quota Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Penggunaan Quota</span>
                          <span className="font-medium">{sa.realizedQuota} / {sa.quota} unit</span>
                        </div>
                        <Progress value={utilizationPercentage} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">
                          {utilizationPercentage.toFixed(1)}% terpakai • {sa.remainingQuota} unit tersisa
                        </p>
                      </div>

                      {sa.status === 'active' && utilizationPercentage >= 90 && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 p-2 rounded">
                          <AlertCircle className="h-4 w-4" />
                          <span>Quota hampir habis!</span>
                        </div>
                      )}

                      {sa.status === 'active' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSuspendSA(sa.id)
                            }}
                          >
                            <Pause className="h-3 w-3 mr-1" />
                            Tangguhkan
                          </Button>
                        </div>
                      )}

                      {sa.status === 'suspended' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            activateSalesAgreement(sa.id)
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Aktifkan Kembali
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create SA Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Sales Agreement Baru</DialogTitle>
            <DialogDescription>
              Buat perjanjian jual beli untuk pelanggan LPG subsidi
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="sa-number">Nomor SA</Label>
              <Input
                id="sa-number"
                placeholder="SA/2025/03/001"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-name">Nama Pelanggan</Label>
              <Input
                id="customer-name"
                placeholder="PT ABC Gas"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-id">ID Pelanggan</Label>
              <Input
                id="customer-id"
                placeholder="CUST-001"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-type">Jenis Produk</Label>
              <Select value={formData.productType} onValueChange={(v) => setFormData({ ...formData, productType: v as LPGProductType })}>
                <SelectTrigger id="product-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3kg">LPG 3kg</SelectItem>
                  <SelectItem value="5.5kg">LPG 5.5kg</SelectItem>
                  <SelectItem value="12kg">LPG 12kg</SelectItem>
                  <SelectItem value="50kg">LPG 50kg</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quota">Quota</Label>
                <Input
                  id="quota"
                  type="number"
                  placeholder="100"
                  value={formData.quota}
                  onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Harga/Unit</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="16000"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Periode</Label>
              <Input
                id="period"
                type="month"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Tanggal Mulai</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Tanggal Selesai</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
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
            <Button onClick={handleCreateSA}>
              Simpan SA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View SA Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Sales Agreement</DialogTitle>
            <DialogDescription>
              {selectedSalesAgreement?.number}
            </DialogDescription>
          </DialogHeader>

          {selectedSalesAgreement && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nama Pelanggan</span>
                    <span className="font-medium">{selectedSalesAgreement.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Pelanggan</span>
                    <span className="font-medium">{selectedSalesAgreement.customerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produk</span>
                    <span className="font-medium">{productConfig[selectedSalesAgreement.productType].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Periode</span>
                    <span className="font-medium">{selectedSalesAgreement.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Berlaku</span>
                    <span className="font-medium">
                      {new Date(selectedSalesAgreement.startDate).toLocaleDateString('id-ID')} - {new Date(selectedSalesAgreement.endDate).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={statusConfig[selectedSalesAgreement.status].variant}>
                      {statusConfig[selectedSalesAgreement.status].label}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quota Total</span>
                    <span className="font-medium">{selectedSalesAgreement.quota} unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terealisasi</span>
                    <span className="font-medium">{selectedSalesAgreement.realizedQuota} unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sisa Quota</span>
                    <span className="font-medium">{selectedSalesAgreement.remainingQuota} unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga/Unit</span>
                    <span className="font-medium">{formatCurrency(selectedSalesAgreement.pricePerUnit)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilisasi Quota</span>
                    <span className="font-medium">{selectedSalesAgreement.utilizationPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={selectedSalesAgreement.utilizationPercentage} className="h-2" />
                </div>

                {selectedSalesAgreement.notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Catatan:</p>
                    <p className="text-sm">{selectedSalesAgreement.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
