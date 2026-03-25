/**
 * Auto Order Store
 * Manages automatic stock alerts, order generation, and approval workflow
 */

import { create } from 'zustand'
import { createJSONStorage, persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { logger } from '../store/utils/middleware'

// Types
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type OrderStatus = 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'delivered' | 'cancelled'
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent'
export type NotificationChannel = 'in_app' | 'whatsapp' | 'email'

export interface StockAlert {
  id: string
  itemId: string
  itemName: string
  category: 'SPBU' | 'LPG' | 'OLI' | 'SnB'
  currentStock: number
  minStock: number
  predictedDaysRemaining: number | null
  severity: AlertSeverity
  acknowledged: boolean
  createdAt: string
  acknowledgedAt?: string
  orderId?: string // If an order was created from this alert
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  category: 'SPBU' | 'LPG' | 'OLI' | 'SnB'
  requestedQuantity: number
  approvedQuantity: number
  unitPrice: number
  totalPrice: number
  supplier: string
  estimatedDelivery: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  priority: OrderPriority
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  notes: string
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  orderedAt?: string
  deliveredAt?: string
  expectedDelivery?: string
  createdAt: string
  updatedAt: string
}

export interface OrderTimeline {
  status: OrderStatus
  timestamp: string
  userId?: string
  userName?: string
  notes?: string
}

export interface Supplier {
  id: string
  name: string
  category: ('SPBU' | 'LPG' | 'OLI' | 'SnB')[]
  contact: string
  phone: string
  email: string
  address: string
  leadTimeDays: number
  isActive: boolean
}

export interface Notification {
  id: string
  type: 'stock_alert' | 'order_ready' | 'order_approved' | 'order_delivered' | 'fraud_detected' | 'performance_alert'
  title: string
  message: string
  severity: AlertSeverity
  channels: NotificationChannel[]
  read: boolean
  actionUrl?: string
  metadata: Record<string, any>
  createdAt: string
  readAt?: string
}

interface AutoOrderState {
  // Alerts
  alerts: StockAlert[]
  activeAlerts: StockAlert[]
  selectedAlert: StockAlert | null

  // Orders
  orders: Order[]
  selectedOrder: Order | null
  pendingOrders: Order[]

  // Notifications
  notifications: Notification[]
  unreadNotifications: Notification[]

  // Suppliers
  suppliers: Supplier[]

  // Smart Control Insights
  insights: {
    fraudDetected: boolean
    fraudCases: Array<{
      id: string
      type: string
      description: string
      detectedAt: string
      severity: AlertSeverity
    }>
    performanceMetrics: {
      lowPerformingShifts: number[]
      bestSellingProducts: Array<{
        id: string
        name: string
        sales: number
        revenue: number
      }>
      peakHours: Array<{ hour: number; sales: number }>
      profitTrend: 'increasing' | 'stable' | 'decreasing'
    }
  }

  // Loading states
  isLoading: boolean
  isProcessing: boolean
  error: string | null

  // Actions
  // Alert actions
  setAlerts: (alerts: StockAlert[]) => void
  addAlert: (alert: StockAlert) => void
  acknowledgeAlert: (id: string) => void
  generateOrderFromAlert: (alertId: string) => Order
  getActiveAlerts: () => StockAlert[]

  // Order actions
  setOrders: (orders: Order[]) => void
  setSelectedOrder: (order: Order | null) => void
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>) => Order
  updateOrder: (id: string, data: Partial<Order>) => void
  submitOrderForApproval: (id: string) => void
  approveOrder: (id: string, approverId: string) => void
  rejectOrder: (id: string, reason: string) => void
  markOrderAsOrdered: (id: string) => void
  markOrderAsDelivered: (id: string) => void
  cancelOrder: (id: string, reason: string) => void
  getOrderTimeline: (orderId: string) => OrderTimeline[]
  recalculateOrderQuantities: (orderId: string) => void

  // Notification actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  sendNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>

  // Supplier actions
  setSuppliers: (suppliers: Supplier[]) => void
  getSuppliersByCategory: (category: string) => Supplier[]

  // Smart Control actions
  detectFraud: () => void
  analyzePerformance: () => void
  generateInsights: () => void

  // UI actions
  setLoading: (loading: boolean) => void
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

// Initial state
const initialState = {
  alerts: [],
  activeAlerts: [],
  selectedAlert: null,
  orders: [],
  selectedOrder: null,
  pendingOrders: [],
  notifications: [],
  unreadNotifications: [],
  suppliers: [],
  insights: {
    fraudDetected: false,
    fraudCases: [],
    performanceMetrics: {
      lowPerformingShifts: [],
      bestSellingProducts: [],
      peakHours: [],
      profitTrend: 'stable' as const,
    },
  },
  isLoading: false,
  isProcessing: false,
  error: null,
}

// Helper function to calculate order quantity
function calculateOrderQuantity(
  currentStock: number,
  dailyUsageRate: number,
  leadTimeDays: number,
  safetyStockDays: number = 7
): number {
  // Formula: (predicted demand during lead time + safety stock) - current stock
  const leadTimeDemand = dailyUsageRate * leadTimeDays
  const safetyStock = dailyUsageRate * safetyStockDays
  const orderQuantity = leadTimeDemand + safetyStock - currentStock

  return Math.max(0, Math.ceil(orderQuantity))
}

// Create store
export const useAutoOrderStore = create<AutoOrderState>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...initialState,

          // Alert actions
          setAlerts: (alerts) =>
            set((state) => {
              state.alerts = alerts
              state.activeAlerts = alerts.filter((a) => !a.acknowledged)
            }),

          addAlert: (alert) =>
            set((state) => {
              const newAlert: StockAlert = {
                ...alert,
                id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
              }
              state.alerts.push(newAlert)
              if (!newAlert.acknowledged) {
                state.activeAlerts.push(newAlert)
              }

              // Auto-create notification
              const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
                type: 'stock_alert',
                title: `Stok ${alert.severity === 'critical' ? 'Kritis' : 'Rendah'}: ${alert.itemName}`,
                message: `Stok ${alert.itemName} saat ini ${alert.currentStock}. ${alert.predictedDaysRemaining !== null ? `Habis dalam ${alert.predictedDaysRemaining} hari.` : 'Di bawah minimum.'}`,
                severity: alert.severity,
                channels: ['in_app'],
                read: false,
                metadata: {
                  alertId: newAlert.id,
                  itemId: alert.itemId,
                  itemName: alert.itemName,
                }
              }
              get().addNotification(notification)
            }),

          acknowledgeAlert: (id) =>
            set((state) => {
              const alert = state.alerts.find((a) => a.id === id)
              if (alert && !alert.acknowledged) {
                alert.acknowledged = true
                alert.acknowledgedAt = new Date().toISOString()
                state.activeAlerts = state.alerts.filter((a) => !a.acknowledged)
              }
            }),

          generateOrderFromAlert: (alertId) =>
            set((state) => {
              const alert = state.alerts.find((a) => a.id === alertId)
              if (!alert) throw new Error('Alert not found')

              // Calculate order quantity
              const avgDailyUsage = 50 // Would come from prediction service
              const leadTimeDays = 3 // Default lead time
              const orderQuantity = calculateOrderQuantity(
                alert.currentStock,
                avgDailyUsage,
                leadTimeDays
              )

              // Find suppliers for this category
              const suppliers = state.suppliers.filter((s) => s.category === alert.category)
              const supplier = suppliers[0]?.name || 'Default Supplier'

              const newItem: OrderItem = {
                id: `item-${Date.now()}`,
                productId: alert.itemId,
                productName: alert.itemName,
                category: alert.category,
                requestedQuantity: orderQuantity,
                approvedQuantity: orderQuantity,
                unitPrice: 0, // To be filled based on product
                totalPrice: 0,
                supplier,
                estimatedDelivery: new Date(Date.now() + leadTimeDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              }

              const newOrder: Order = {
                id: `order-${Date.now()}`,
                orderNumber: `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(state.orders.length + 1).padStart(4, '0')}`,
                status: 'draft',
                priority: alert.severity === 'critical' ? 'urgent' : alert.severity === 'warning' ? 'high' : 'medium',
                items: [newItem],
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0,
                notes: `Auto-generated from stock alert. Current stock: ${alert.currentStock}, Min: ${alert.minStock}`,
                createdBy: 'system',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }

              state.orders.push(newOrder)
              state.pendingOrders.push(newOrder)

              // Link alert to order
              alert.orderId = newOrder.id

              return newOrder
            }),

          getActiveAlerts: () => get().activeAlerts,

          // Order actions
          setOrders: (orders) =>
            set((state) => {
              state.orders = orders
              state.pendingOrders = orders.filter((o) =>
                o.status === 'pending_approval' || o.status === 'draft'
              )
            }),

          setSelectedOrder: (order) =>
            set((state) => {
              state.selectedOrder = order
            }),

          createOrder: (orderData) =>
            set((state) => {
              const newOrder: Order = {
                ...orderData,
                id: `order-${Date.now()}`,
                orderNumber: `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(state.orders.length + 1).padStart(4, '0')}`,
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              state.orders.push(newOrder)
              return newOrder
            }),

          updateOrder: (id, data) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (order) {
                Object.assign(order, data)
                order.updatedAt = new Date().toISOString()

                // Update pending orders list
                state.pendingOrders = state.orders.filter((o) =>
                  o.status === 'pending_approval' || o.status === 'draft'
                )

                // Update selected order if it's the same
                if (state.selectedOrder?.id === id) {
                  state.selectedOrder = { ...order }
                }
              }
            }),

          submitOrderForApproval: (id) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (order && order.status === 'draft') {
                order.status = 'pending_approval'
                order.updatedAt = new Date().toISOString()

                // Create notification
                const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
                  type: 'order_ready',
                  title: 'Order Siap Diverifikasi',
                  message: `Order ${order.orderNumber} siap diverifikasi. ${order.items.length} item dengan total ${order.total}.`,
                  severity: 'info',
                  channels: ['in_app'],
                  read: false,
                  actionUrl: `/orders/${order.id}`,
                  metadata: { orderId: order.id, orderNumber: order.orderNumber }
                }
                get().addNotification(notification)
              }
            }),

          approveOrder: (id, approverId) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (order && order.status === 'pending_approval') {
                order.status = 'approved'
                order.approvedBy = approverId
                order.approvedAt = new Date().toISOString()
                order.updatedAt = new Date().toISOString()

                // Create notification
                const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
                  type: 'order_approved',
                  title: 'Order Disetujui',
                  message: `Order ${order.orderNumber} telah disetujui.`,
                  severity: 'info',
                  channels: ['in_app', 'whatsapp'],
                  read: false,
                  actionUrl: `/orders/${order.id}`,
                  metadata: { orderId: order.id, orderNumber: order.orderNumber }
                }
                get().addNotification(notification)
              }
            }),

          rejectOrder: (id, reason) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (order && (order.status === 'pending_approval' || order.status === 'draft')) {
                order.status = 'cancelled'
                order.notes = `${order.notes}\n\nRejected: ${reason}`
                order.updatedAt = new Date().toISOString()

                // Remove from pending
                state.pendingOrders = state.orders.filter((o) =>
                  o.status === 'pending_approval' || o.status === 'draft'
                )
              }
            }),

          markOrderAsOrdered: (id) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (order && order.status === 'approved') {
                order.status = 'ordered'
                order.orderedAt = new Date().toISOString()
                order.updatedAt = new Date().toISOString()

                // Remove from pending
                state.pendingOrders = state.orders.filter((o) =>
                  o.status === 'pending_approval' || o.status === 'draft'
                )
              }
            }),

          markOrderAsDelivered: (id) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (order && order.status === 'ordered') {
                order.status = 'delivered'
                order.deliveredAt = new Date().toISOString()
                order.updatedAt = new Date().toISOString()

                // Auto-update stock
                order.items.forEach((item) => {
                  // This would trigger stock update in SPBU/LPG stores
                  // For now, just log it
                  console.log(`Stock updated: ${item.productName} +${item.approvedQuantity}`)
                })

                // Create notification
                const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
                  type: 'order_delivered',
                  title: 'Order Telah Diterima',
                  message: `Order ${order.orderNumber} telah diterima. Stok telah diupdate.`,
                  severity: 'info',
                  channels: ['in_app'],
                  read: false,
                  metadata: { orderId: order.id, orderNumber: order.orderNumber }
                }
                get().addNotification(notification)
              }
            }),

          cancelOrder: (id, reason) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (order) {
                order.status = 'cancelled'
                order.notes = `${order.notes}\n\nCancelled: ${reason}`
                order.updatedAt = new Date().toISOString()

                // Remove from pending
                state.pendingOrders = state.orders.filter((o) =>
                  o.status === 'pending_approval' || o.status === 'draft'
                )
              }
            }),

          getOrderTimeline: (orderId) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === orderId)
              if (!order) return []

              const timeline: OrderTimeline[] = [
                {
                  status: 'draft',
                  timestamp: order.createdAt,
                  userName: order.createdBy,
                },
              ]

              if (order.approvedAt) {
                timeline.push({
                  status: 'approved',
                  timestamp: order.approvedAt,
                  userId: order.approvedBy,
                })
              }

              if (order.orderedAt) {
                timeline.push({
                  status: 'ordered',
                  timestamp: order.orderedAt,
                })
              }

              if (order.deliveredAt) {
                timeline.push({
                  status: 'delivered',
                  timestamp: order.deliveredAt,
                })
              }

              return timeline
            }),

          recalculateOrderQuantities: (id) =>
            set((state) => {
              const order = state.orders.find((o) => o.id === id)
              if (!order || order.status !== 'draft') return

              order.items.forEach((item) => {
                // Would recalculate based on latest predictions
                const avgDailyUsage = 50
                const leadTimeDays = 3
                const currentStock = 100 // Would fetch from stores

                const newQuantity = calculateOrderQuantity(
                  currentStock,
                  avgDailyUsage,
                  leadTimeDays
                )

                item.requestedQuantity = newQuantity
                item.approvedQuantity = newQuantity
              })

              order.updatedAt = new Date().toISOString()
            }),

          // Notification actions
          setNotifications: (notifications) =>
            set((state) => {
              state.notifications = notifications
              state.unreadNotifications = notifications.filter((n) => !n.read)
            }),

          addNotification: (notification) =>
            set((state) => {
              const newNotification: Notification = {
                ...notification,
                id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
              }
              state.notifications.unshift(newNotification)
              if (!newNotification.read) {
                state.unreadNotifications.unshift(newNotification)
              }
            }),

          markAsRead: (id) =>
            set((state) => {
              const notification = state.notifications.find((n) => n.id === id)
              if (notification && !notification.read) {
                notification.read = true
                notification.readAt = new Date().toISOString()
                state.unreadNotifications = state.notifications.filter((n) => !n.read)
              }
            }),

          markAllAsRead: () =>
            set((state) => {
              state.notifications.forEach((n) => {
                if (!n.read) {
                  n.read = true
                  n.readAt = new Date().toISOString()
                }
              })
              state.unreadNotifications = []
            }),

          clearNotification: (id) =>
            set((state) => {
              state.notifications = state.notifications.filter((n) => n.id !== id)
              state.unreadNotifications = state.notifications.filter((n) => !n.read)
            }),

          sendNotification: async (notification) =>
            set((state) => {
              const newNotification: Notification = {
                ...notification,
                id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
              }
              state.notifications.unshift(newNotification)

              // In production, would send to WhatsApp/Email APIs here
              console.log('Sending notification:', newNotification)
            }),

          // Supplier actions
          setSuppliers: (suppliers) =>
            set((state) => {
              state.suppliers = suppliers
            }),

          getSuppliersByCategory: (category) =>
            get().suppliers.filter((s) => s.category === category && s.isActive),

          // Smart Control actions
          detectFraud: () =>
            set((state) => {
              // Analyze transactions for fraud
              const fraudCases = []
              // Implementation would check for:
              // - Unusual transaction patterns
              // - High selisih in SPBU
              // - Multiple void transactions
              // - Rapid repeated transactions

              state.insights.fraudDetected = fraudCases.length > 0
              state.insights.fraudCases = fraudCases

              if (fraudCases.length > 0) {
                fraudCases.forEach((fc) => {
                  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
                    type: 'fraud_detected',
                    title: 'Potensi Kecurangan Terdeteksi',
                    message: fc.description,
                    severity: 'critical',
                    channels: ['in_app'],
                    read: false,
                    metadata: { fraudCase: fc }
                  }
                  get().addNotification(notification)
                })
              }
            }),

          analyzePerformance: () =>
            set((state) => {
              // Analyze shift performance
              // Identify best-selling products
              // Calculate peak hours
              // Determine profit trend
              // Implementation would use data from SPBU and POS stores
            }),

          generateInsights: () =>
            set((state) => {
              get().detectFraud()
              get().analyzePerformance()
            }),

          // UI actions
          setLoading: (loading) =>
            set((state) => {
              state.isLoading = loading
            }),

          setProcessing: (processing) =>
            set((state) => {
              state.isProcessing = processing
            }),

          setError: (error) =>
            set((state) => {
              state.error = error
            }),

          clearError: () =>
            set((state) => {
              state.error = null
            }),

          reset: () =>
            set((state) => {
              Object.assign(state, initialState)
            }),
        })),
        {
          name: 'auto-order-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            alerts: state.alerts,
            orders: state.orders,
            notifications: state.notifications,
            suppliers: state.suppliers,
            insights: state.insights,
          }),
        }
      )
    )
  )
)
