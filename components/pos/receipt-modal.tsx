/**
 * Receipt Modal Component
 * Displays transaction receipt with print and download functionality
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Download, Share2, Loader2, CheckCircle2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { usePOSTransactionReceipt } from '@/lib/pos'
import { motion } from 'framer-motion'

interface ReceiptModalProps {
  open: boolean
  transactionId: string | null
  onClose: () => void
}

export function ReceiptModal({ open, transactionId, onClose }: ReceiptModalProps) {
  const { receipt, isLoading, error, clearReceipt } = usePOSTransactionReceipt(transactionId)

  const [isPrintering, setIsPrintering] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareMethod, setShareMethod] = useState<'email' | 'whatsapp'>('email')

  const handlePrinter = async () => {
    setIsPrintering(true)
    try {
      // Printer dialog
      if (window.print) {
        window.print()
      } else {
        // Fallback: create printable version
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Receipt - ${receipt?.id}</title>
                <style>
                  body { font-family: monospace; font-size: 12px; }
                  .receipt { width: 80mm; padding: 10mm; margin: 0 auto; }
                  .text-center { text-align: center; }
                  .border-dashed { border-bottom: 1px dashed #000; }
                  .text-right { text-align: right; }
                  .font-bold { font-weight: bold; }
                  .mb-2 { margin-bottom: 2mm; }
                  .mt-4 { margin-top: 4mm; }
                </style>
              </head>
              <body>
                <div class="receipt">
                  ${document.querySelector('[data-receipt]')?.innerHTML || ''}
                </div>
              </body>
            </html>
          `)
          printWindow.document.close()
        }
      }
    } finally {
      setIsPrintering(false)
    }
  }

  const handleDownload = () => {
    if (!receipt) return

    // Generate receipt text
    const receiptText = `
================================
      SPBU MANAGEMENT SYSTEM
================================

No. Transaksi: ${receipt.id}
Tanggal: ${receipt.date}
Kasir: ${receipt.cashier}

--------------------------------
ITEM BELANJA
--------------------------------
${receipt.items.map((item: any) =>
  `${item.name} x${item.quantity}
   ${formatCurrency(item.price)}
   = ${formatCurrency(item.quantity * item.price)}`
).join('\n')}

================================
SUBTOTAL: ${formatCurrency(receipt.subtotal)}
DISKON:  ${formatCurrency(receipt.discount)}
PPN (11%): ${formatCurrency(receipt.tax)}
--------------------------------
TOTAL: ${formatCurrency(receipt.total)}

METODE PEMBAYARAN: ${receipt.paymentMethod.toUpperCase()}
JUMLAH DIBAYAR: ${formatCurrency(receipt.paidAmount)}
KEMBALIAN: ${formatCurrency(receipt.change)}

================================
TERIMA KASIH
Barang yang dibeli tidak dapat ditukar
================================
    `.trim()

    // Create and download file
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `struk-${receipt.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    setIsSharing(true)

    try {
      // TODO: Implement actual sharing
      const shareData = {
        title: `Struk Transaksi ${receipt.id}`,
        text: `Total: ${formatCurrency(receipt.total)}`,
        url: `${window.location.origin}/receipt/${receipt.id}`,
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Transaksi ${receipt.id}\nTotal: ${formatCurrency(receipt.total)}`
        )
        alert('Link struk disalin ke clipboard!')
      }
    } catch (error) {
      console.error('Failed to share:', error)
    } finally {
      setIsSharing(false)
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Memuat struk...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-destructive">{error}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (!receipt) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="py-4 text-center">
            <p className="text-muted-foreground">Tidak ada data struk</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Struk Pembelian</DialogTitle>
          <DialogDescription>
            <div className="flex items-center justify-between">
              <span>Transaksi #{receipt.id}</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Receipt Content */}
        <div className="bg-white text-black p-6 rounded-lg font-mono text-xs space-y-3" data-receipt>
          {/* Header */}
          <div className="text-center border-b border-dashed pb-3">
            <h2 className="text-lg font-bold">SPBU MANAGEMENT</h2>
            <p className="text-xs">Jl. Raya Utama No. 123</p>
            <p className="text-xs">Jakarta, Indonesia</p>
            <p className="text-xs mt-1">Telp: (021) 1234-5678</p>
          </div>

          {/* Transaction Info */}
          <div className="border-b border-dashed pb-3 space-y-1">
            <div className="flex justify-between">
              <span>No. Transaksi:</span>
              <span className="font-semibold">{receipt.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{receipt.cashier}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-b border-dashed pb-3">
            <p className="font-bold mb-2">ITEM BELANJA</p>
            <div className="space-y-1">
              {receipt.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="flex-1">{item.name}</span>
                  <span>{formatCurrency(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-b border-dashed pb-3 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Diskon:</span>
                <span>-{formatCurrency(receipt.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>PPN (11%):</span>
              <span>{formatCurrency(receipt.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>TOTAL:</span>
              <span>{formatCurrency(receipt.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="border-b border-dashed pb-3 space-y-1">
            <div className="flex justify-between">
              <span>Metode:</span>
              <span className="uppercase font-semibold">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Dibayar:</span>
              <span>{formatCurrency(receipt.paidAmount)}</span>
            </div>
            {parseFloat(receipt.change) > 0 && (
              <div className="flex justify-between">
                <span>Kembalian:</span>
                <span>{formatCurrency(receipt.change)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs">
            <p className="font-bold mb-1">TERIMA KASIH</p>
            <p>Barang yang dibeli tidak dapat ditukar</p>
            <p className="text-muted-foreground mt-1">Simpan struk ini sebagai bukti pembayaran yang sah</p>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrinter}
            disabled={isPrintering}
          >
            {isPrintering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mencetak...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Cetak
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Unduh
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Bagikan
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Close button */}
        <div className="px-6 pb-6">
          <Button
            onClick={() => {
              clearReceipt()
              onClose()
            }}
            className="w-full"
          >
            Tutup (Transaksi Berikutnya)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
