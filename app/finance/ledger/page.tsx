"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { getJournalEntries } from "@/lib/api/services"
import { formatDateTime, formatCurrency } from "@/lib/utils/formatters"
import { useState, useEffect } from "react"

export default function LedgerPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const data = await getJournalEntries()
    setEntries(data)
  }

  // Group by account and calculate balance
  const ledgerData = entries.reduce((acc, entry) => {
    if (!acc[entry.account]) {
      acc[entry.account] = {
        account: entry.account,
        entries: [],
        balance: 0,
      }
    }
    acc[entry.account].entries.push(entry)
    acc[entry.account].balance += entry.debit - entry.credit
    return acc
  }, {} as Record<string, any>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buku Besar</h1>
        <p className="text-muted-foreground">Ledger per akun</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari akun..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Ledger */}
      <div className="space-y-6">
        {Object.values(ledgerData)
          .filter((ledger: any) =>
            ledger.account.toLowerCase().includes(search.toLowerCase())
          )
          .map((ledger: any) => (
            <Card key={ledger.account}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{ledger.account}</CardTitle>
                  <Badge variant={ledger.balance >= 0 ? "success" : "destructive"}>
                    {formatCurrency(Math.abs(ledger.balance))} {ledger.balance >= 0 ? "Debit" : "Kredit"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ledger.entries.map((entry: any, index: number) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                      <div className="flex-1">
                        <p className="text-muted-foreground">{formatDateTime(entry.date)}</p>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-xs text-muted-foreground">{entry.reference}</p>
                      </div>
                      <div className="text-right flex gap-4">
                        <div className="w-24">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                        </div>
                        <div className="w-24">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "-"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
