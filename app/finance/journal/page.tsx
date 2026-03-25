"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react"
import { getJournalEntries, createJournalEntry } from "@/lib/api/services"
import { JournalEntry } from "@/lib/api/mock-data"
import { formatDateTime, formatCurrency } from "@/lib/utils/formatters"

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const data = await getJournalEntries()
      setEntries(data)
    } catch (error) {
      console.error("Failed to load entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = entries.filter((e) =>
    e.account.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.reference.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jurnal Umum</h1>
          <p className="text-muted-foreground">Catat transaksi keuangan</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Jurnal Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Jurnal Umum</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Akun</Label>
                <Input id="account" placeholder="Nama akun" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="debit">Debit</Label>
                  <Input id="debit" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit">Kredit</Label>
                  <Input id="credit" type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input id="description" placeholder="Deskripsi transaksi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referensi</Label>
                <Input id="reference" placeholder="Nomor referensi" />
              </div>
              <Button className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari akun atau deskripsi..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Journal Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jurnal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Ref</TableHead>
                <TableHead>Akun</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDateTime(entry.date)}</TableCell>
                  <TableCell><Badge variant="outline">{entry.reference}</Badge></TableCell>
                  <TableCell className="font-medium">{entry.account}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
