/**
 * Order Detail Component
 * Displays detailed order information with timeline and actions
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Edit, Package, Calendar, User, FileText, CheckCircle2, X, ChevronRight, RefreshCw } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useAutoOrderStore } from '@/store'
import type { Order, OrderStatus } from '@/store'

const statusConfig: Record<OrderStatus, { label: string; variant: any; icon: any }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: FileText },
  pending_approval: { label: 'Menunggu Approval', variant: 'warning', icon: Package },
  approved: { label: 'Disetujui', variant: 'default', icon: CheckCircle2 },
  ordered: { label: 'Dipesan', variant: 'default', icon: Package },
  delivered: { label: 'Diterima', variant: 'default', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', variant: 'destructive', icon: X },
}

export function OrderDetail({ orderId, onClose }: { orderId: string; onClose?: () => void }) {
  const { orders, updateOrder, getOrderTimeline, recalculateOrderQuantities } = useAutoOrderStore()
  const order = orders.find((o) => o.id === orderId)

  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState(order)

  if (!order) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            Order tidak ditemukan
          </div>
        </CardContent>
      </Card>
    )
  }

  const status = statusConfig[order.status]
  const timeline = getOrderTimeline(orderId)

  const handleSaveEdit = () => {
    if (isEditing && editFormData) {
      updateOrder(orderId, {
        items: editFormData.items,
        notes: editFormData.notes,
      })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData(order)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">{order.orderNumber}</h3>
            <Badge variant={status.variant} className="gap-1">
              <status.icon className="h-4 w-4" />
              {status.label}
            </Badge>
            <Badge variant="outline">{order.priority}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && order.status === 'draft' && (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button size="sm" onClick={handleSaveEdit}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Simpan
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
            </>
          )}
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              Tutup
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Item Order</CardTitle>
              {order.status === 'draft' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => recalculateOrderQuantities(orderId)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Hitung Ulang
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Qty Diminta</p>
                        <Input
                          type="number"
                          value={item.requestedQuantity}
                          disabled={!isEditing}
                          onChange={(e) => {
                            if (isEditing) {
                              const newItems = [...order.items]
                              newItems[index] = { ...item, requestedQuantity: parseInt(e.target.value) || 0 }
                              setEditFormData({ ...editFormData!, items: newItems })
                            }
                          }}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <p className="text-muted-foreground">Qty Disetujui</p>
                        <p className="font-medium">{item.approvedQuantity}</p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Supplier:</span>
                        <span className="font-medium">{item.supplier}</span>
                      </div>
                      {item.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimasi:</span>
                          <span className="font-medium">
                            {new Date(item.estimatedDelivery).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak (11%)</span>
                <span className="font-medium">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pengiriman</span>
                <span className="font-medium">{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {isEditing && (
              <div className="space-y-3 pt-3 border-t">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={editFormData?.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData!, notes: e.target.value })}
                  placeholder="Tambahkan catatan..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Order</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="relative flex gap-4">
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2 border-background",
                      index === timeline.length - 1 ? "bg-primary" : "bg-muted-foreground"
                    )} />
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">{statusConfig[event.status]?.label || event.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString('id-ID')}
                      </p>
                      {event.userName && (
                        <p className="text-xs text-muted-foreground">
                          Oleh: {event.userName}
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Tambahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Dibuat Oleh</p>
              <p className="font-medium">{order.createdBy}</p>
            </div>
            {order.approvedBy && (
              <div>
                <p className="text-muted-foreground">Disetujui Oleh</p>
                <p className="font-medium">{order.approvedBy}</p>
              </div>
            )}
            {order.expectedDelivery && (
              <div>
                <p className="text-muted-foreground">Estimasi Pengiriman</p>
                <p className="font-medium">
                  {new Date(order.expectedDelivery).toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Terakhir Update</p>
              <p className="font-medium">
                {new Date(order.updatedAt).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
