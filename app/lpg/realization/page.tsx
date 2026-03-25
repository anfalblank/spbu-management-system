"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { recordDistribution, getSalesAgreements } from "@/lib/api/services"
import { mockSalesAgreements } from "@/lib/api/mock-data"
import { formatNumber } from "@/lib/utils/formatters"

export default function RealizationPage() {
  const [agreementId, setAgreementId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [driver, setDriver] = useState("")
  const [vehicle, setVehicle] = useState("")
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const activeAgreements = mockSalesAgreements.filter((a) => a.status === "active")
  const selectedAgreement = activeAgreements.find((a) => a.id === agreementId)
  const remainingQuota = selectedAgreement ? selectedAgreement.quota - selectedAgreement.realized : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await recordDistribution({
        agreementId,
        customerName: selectedAgreement?.customerName || "",
        quantity: parseInt(quantity),
        driver,
        vehiclePlate: vehicle,
        notes,
      })
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setAgreementId("")
        setQuantity("")
        setDriver("")
        setVehicle("")
        setNotes("")
      }, 3000)
    } catch (error) {
      console.error("Failed to record distribution:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Realisasi Penjualan</h1>
        <p className="text-muted-foreground">Input distribusi harian LPG bersubsidi</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form Distribusi</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold">Berhasil!</h3>
                <p className="text-muted-foreground">Data distribusi telah disimpan</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agreement">Sales Agreement</Label>
                  <Select value={agreementId} onValueChange={setAgreementId} required>
                    <SelectTrigger id="agreement">
                      <SelectValue placeholder="Pilih SA" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAgreements.map((sa) => (
                        <SelectItem key={sa.id} value={sa.id}>
                          {sa.id} - {sa.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAgreement && (
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kuota Total</span>
                      <span className="font-medium">{formatNumber(selectedAgreement.quota)} tabung</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sudah Terealisasi</span>
                      <span className="font-medium">{formatNumber(selectedAgreement.realized)} tabung</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sisa Kuota</span>
                      <span className="font-bold text-primary">{formatNumber(remainingQuota)} tabung</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="quantity">Jumlah (Tabung)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    max={remainingQuota}
                    required
                  />
                  {selectedAgreement && parseInt(quantity || "0") > remainingQuota && (
                    <p className="text-xs text-destructive">Melebihi sisa kuota!</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver">Nama Supir</Label>
                  <Input
                    id="driver"
                    placeholder="Nama supir"
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle">Plat Kendaraan</Label>
                  <Input
                    id="vehicle"
                    placeholder="B 1234 ABC"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Input
                    id="notes"
                    placeholder="Catatan tambahan"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!agreementId || !quantity || !driver || !vehicle}>
                  Simpan Distribusi
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Today's Distributions */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Warung Bu Siti</p>
                  <p className="text-sm text-muted-foreground">SA-001 • 10 tabung</p>
                </div>
                <Badge variant="success">Selesai</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Warung Pak Budi</p>
                  <p className="text-sm text-muted-foreground">SA-002 • 15 tabung</p>
                </div>
                <Badge variant="success">Selesai</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Toko Bu Rina</p>
                  <p className="text-sm text-muted-foreground">SA-005 • 8 tabung</p>
                </div>
                <Badge variant="success">Selesai</Badge>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tabung</span>
                <span className="font-bold">33 tabung</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Nilai</span>
                <span className="font-bold">Rp 528.000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
