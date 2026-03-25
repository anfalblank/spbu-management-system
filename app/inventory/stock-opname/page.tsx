"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClipboardCheck, Save } from "lucide-react"

export default function StockOpnamePage() {
  const [warehouse, setWarehouse] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Mock items for stock opname
  const [items, setItems] = useState([
    { id: "p1", name: "Pertalite", systemStock: 8500, actualStock: "", notes: "" },
    { id: "p2", name: "Pertamax", systemStock: 18500, actualStock: "", notes: "" },
    { id: "g1", name: "LPG 3kg", systemStock: 150, actualStock: "", notes: "" },
    { id: "o1", name: "Mesran B-40", systemStock: 100, actualStock: "", notes: "" },
  ])

  const handleActualStockChange = (id: string, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, actualStock: value } : item
    ))
  }

  const handleNotesChange = (id: string, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, notes: value } : item
    ))
  }

  const getDifference = (systemStock: number, actualStock: string) => {
    const actual = parseInt(actualStock) || 0
    return actual - systemStock
  }

  const handleSubmit = () => {
    console.log("Submitting stock opname:", { warehouse, date, items })
    // Submit logic here
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Opname</h1>
        <p className="text-muted-foreground">Input hasil stock opname fisik</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Informasi Stock Opname
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">Gudang</Label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger id="warehouse">
                  <SelectValue placeholder="Pilih gudang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wh1">Gudang Utama</SelectItem>
                  <SelectItem value="wh2">Gudang SPBU 34.12345</SelectItem>
                  <SelectItem value="wh3">Gudang Cabang</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full gap-2">
              <Save className="h-4 w-4" />
              Simpan Stock Opname
            </Button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Stok Sistem</TableHead>
                  <TableHead className="text-right">Stok Fisik</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const diff = getDifference(item.systemStock, item.actualStock)
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.systemStock}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={item.actualStock}
                          onChange={(e) => handleActualStockChange(item.id, e.target.value)}
                          className="w-24 text-right"
                        />
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        diff < 0 ? "text-destructive" : diff > 0 ? "text-emerald-500" : ""
                      }`}>
                        {item.actualStock ? diff : "-"}
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Catatan..."
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          className="text-sm"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
