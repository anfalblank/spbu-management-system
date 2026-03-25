/**
 * Order List Component
 * Displays all orders with status filtering and actions
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Clock, CheckCircle2, XCircle, AlertTriangle, Package, Search, Filter } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useAutoOrderStore } from '@/store'
import type { Order, OrderStatus, OrderPriority } from '@/store'

const statusConfig: Record<OrderStatus, { label: string; variant: any; icon: any }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: FileText },
  pending_approval: { label: 'Menunggu Approval', variant: 'warning', icon: Clock },
  approved: { label: 'Disetujui', variant: 'default', icon: CheckCircle2 },
  ordered: { label: 'Dipesan', variant: 'default', icon: Package },
  delivered: { label: 'Diterima', variant: 'default', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', variant: 'destructive', icon: XCircle },
}

const priorityConfig: Record<OrderPriority, { label: string; variant: any }> = {
  low: { label: 'Rendah', variant: 'secondary' },
  medium: { label: 'Sedang', variant: 'default' },
  high: { label: 'Tinggi', variant: 'warning' },
  urgent: { label: 'Segera', variant: 'destructive' },
}

export function OrderList() {
  const {
    orders,
    selectedOrder,
    isLoading,
    submitOrderForApproval,
    approveOrder,
    rejectOrder,
    markOrderAsOrdered,
    markOrderAsDelivered,
    setSelectedOrder,
  } = useAutoOrderStore()

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<OrderPriority | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false
    if (filterPriority !== 'all' && order.priority !== filterPriority) return false
    if (searchQuery && !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleReject = () => {
    if (selectedOrder && rejectReason) {
      rejectOrder(selectedOrder.id, rejectReason)
      setShowRejectDialog(false)
      setRejectReason('')
      setSelectedOrder(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Daftar Order</h3>
          <p className="text-sm text-muted-foreground">
            {orders.length} order total
          </p>
        </div>
        <Button onClick={() => {/* Create new order dialog */}>
          <Package className="h-4 w-4 mr-2" />
          Buat Order Baru
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nomor order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as OrderStatus | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Menunggu Approval</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="ordered">Dipesan</SelectItem>
            <SelectItem value="delivered">Diterima</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as OrderPriority | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value="urgent">Segera</SelectItem>
            <SelectItem value="high">Tinggi</SelectItem>
            <SelectItem value="medium">Sedang</SelectItem>
            <SelectItem value="low">Rendah</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order List */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>Tidak ada order</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status]
                  const priority = priorityConfig[order.priority]

                  return (
                    <div
                      key={order.id}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium">{order.orderNumber}</p>
                            <Badge variant={status.variant} className="gap-1">
                              <status.icon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                            <Badge variant={priority.variant} className={cn("text-xs", priority.variant === 'urgent' && 'animate-pulse')}>
                              {priority.label}
                            </Badge>
                          </div>

                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <span>{order.items.length} item</span>
                            <span>{formatCurrency(order.total)}</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>

                          {order.notes && (
                            <p className="text-sm mt-2 line-clamp-2">{order.notes}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {order.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                submitOrderForApproval(order.id)
                              }}
                            >
                              Ajukan
                            </Button>
                          )}
                          {order.status === 'pending_approval' && (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedOrder(order)
                                  setShowRejectDialog(true)
                                }}
                              >
                                Tolak
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                approveOrder(order.id, 'current-user') // Would get actual user ID
                                }}
                              >
                                Setujui
                              </Button>
                            </>
                          )}
                          {order.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markOrderAsOrdered(order.id)
                              }}
                            >
                              Konfirm Pesanan
                            </Button>
                          )}
                          {order.status === 'ordered' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markOrderAsDelivered(order.id)
                              }}
                            >
                              Terima Barang
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      {showRejectDialog && selectedOrder && (
        <Card className="p-6 border">
          <h3 className="font-semibold mb-4">Tolak Order</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedOrder.orderNumber}
          </p>
          <Input
            placeholder="Alasan penolakan..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              Tolak Order
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
