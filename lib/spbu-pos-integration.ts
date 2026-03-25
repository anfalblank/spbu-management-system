/**
 * SPBU/LPG and POS Integration
 * Connects SPBU and LPG modules with the POS transaction system
 */

import { useSPBUStore } from '@/store'
import { useLPGStore } from '@/store'
import { usePOSStore } from '@/store'
import type { Transaction, CartItem } from '@/store/types'

/**
 * Updates SPBU stock after a POS transaction
 * @param transaction - Completed POS transaction
 */
export function updateSPBUStockAfterTransaction(transaction: Transaction) {
  const { updateTank, tanks } = useSPBUStore.getState()

  // Group items by fuel type
  const fuelUpdates = new Map<string, number>()

  transaction.items.forEach((item) => {
    // Check if item is an SPBU fuel product
    if (item.module === 'SPBU' || item.module === 'GAS') {
      const fuelType = getFuelTypeFromProduct(item.name)
      if (fuelType) {
        const currentVolume = fuelUpdates.get(fuelType) || 0
        fuelUpdates.set(fuelType, currentVolume + item.quantity)
      }
    }
  })

  // Update tank levels
  fuelUpdates.forEach((volume, fuelType) => {
    const tank = tanks.find((t) => t.fuelType === fuelType)
    if (tank) {
      const newVolume = Math.max(0, tank.currentVolume - volume)
      updateTank(tank.id, { currentVolume: newVolume })
    }
  })
}

/**
 * Updates LPG stock after a POS transaction
 * @param transaction - Completed POS transaction
 */
export function updateLPGStockAfterTransaction(transaction: Transaction) {
  const { updateProduct, products } = useLPGStore.getState()

  transaction.items.forEach((item) => {
    // Check if item is an LPG product
    if (item.module === 'LPG') {
      const product = products.find((p) => p.id === item.id)
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity)
        updateProduct(item.id, { stock: newStock })
      }
    }
  })
}

/**
 * Records SPBU sales to current shift settlement
 * @param transaction - Completed POS transaction
 */
export function recordSPBUSalesToSettlement(transaction: Transaction) {
  const { currentShift, settlements, updateSettlement } = useSPBUStore.getState()

  if (!currentShift) return

  // Find active settlement for current shift
  const activeSettlement = settlements.find(
    (s) => s.shiftId === currentShift.id && s.status === 'draft'
  )

  if (!activeSettlement) return

  // Add transaction payment info to settlement
  const updatedPayments = [...activeSettlement.payments]

  const paymentIndex = updatedPayments.findIndex(
    (p) => p.method === transaction.paymentMethod
  )

  if (paymentIndex >= 0) {
    updatedPayments[paymentIndex].amount += transaction.total
  } else {
    updatedPayments.push({
      method: transaction.paymentMethod,
      amount: transaction.total,
    })
  }

  updateSettlement(activeSettlement.id, { payments: updatedPayments })
}

/**
 * Creates LPG realisasi from POS transaction for subsidized sales
 * @param transaction - Completed POS transaction
 * @param salesAgreementId - Associated Sales Agreement ID
 */
export function createLPGRealisasiFromPOSTransaction(
  transaction: Transaction,
  salesAgreementId: string
) {
  const { salesAgreements, createRealisasi } = useLPGStore.getState()
  const { user } = usePOSStore.getState()

  const sa = salesAgreements.find((s) => s.id === salesAgreementId)
  if (!sa || !user) {
    throw new Error('Sales Agreement tidak ditemukan atau user tidak login')
  }

  // Calculate total quantity for this SA
  const saItems = transaction.items.filter((item) => item.module === 'LPG')
  const totalQuantity = saItems.reduce((sum, item) => sum + item.quantity, 0)

  // Create realisasi
  createRealisasi({
    salesAgreementId: sa.id,
    salesAgreementNumber: sa.number,
    customerId: sa.customerId,
    customerName: sa.customerName,
    productType: sa.productType,
    category: sa.category,
    quantity: totalQuantity,
    unitPrice: sa.pricePerUnit,
    totalPrice: totalQuantity * sa.pricePerUnit,
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: '',
    recipientName: sa.customerName,
    recipientPhone: '',
    driverName: '',
    vehiclePlate: '',
    notes: `Dari POS transaksi #${transaction.id}`,
    status: 'approved', // Auto-approve for POS transactions
    createdBy: user.id,
  })
}

/**
 * Validates if SPBU transaction can proceed (checks tank levels)
 * @param items - Cart items to validate
 * @returns true if transaction can proceed, false otherwise
 */
export function validateSPBUStockAvailability(items: CartItem[]): boolean {
  const { tanks } = useSPBUStore.getState()

  for (const item of items) {
    if (item.module === 'SPBU' || item.module === 'GAS') {
      const fuelType = getFuelTypeFromProduct(item.name)
      if (fuelType) {
        const tank = tanks.find((t) => t.fuelType === fuelType)
        if (tank && tank.currentVolume < item.quantity) {
          return false
        }
      }
    }
  }

  return true
}

/**
 * Validates if LPG transaction can proceed (checks product stock and SA quota)
 * @param items - Cart items to validate
 * @param salesAgreementId - Sales Agreement ID for subsidized sales
 * @returns true if transaction can proceed, false otherwise
 */
export function validateLPGTransactionAvailability(
  items: CartItem[],
  salesAgreementId?: string
): { valid: boolean; reason?: string } {
  const { products } = useLPGStore.getState()

  // Check product stock
  for (const item of items) {
    if (item.module === 'LPG') {
      const product = products.find((p) => p.id === item.id)
      if (product && product.stock < item.quantity) {
        return { valid: false, reason: `Stok ${product.name} tidak mencukupi` }
      }
    }
  }

  // Check SA quota if provided
  if (salesAgreementId) {
    const { checkQuotaAvailability } = useLPGStore.getState()
    const totalQuantity = items
      .filter((item) => item.module === 'LPG')
      .reduce((sum, item) => sum + item.quantity, 0)

    const check = checkQuotaAvailability(salesAgreementId, totalQuantity)
    if (!check.available) {
      return { valid: false, reason: `Quota SA tidak mencukupi. Sisa: ${check.remainingQuota} unit` }
    }
  }

  return { valid: true }
}

/**
 * Gets comprehensive transaction summary for dashboard
 */
export function getTransactionSummary() {
  const { settlements, shifts } = useSPBUStore.getState()
  const { realisasi, salesAgreements } = useLPGStore.getState()
  const { transactions } = usePOSStore.getState()

  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = transactions.filter((t) =>
    t.createdAt.startsWith(today)
  )

  // SPBU stats
  const todaySettlements = settlements.filter((s) =>
    s.date === today && s.status === 'approved'
  )
  const spbuVolume = todaySettlements.reduce((sum, s) => sum + s.totalVolume, 0)
  const spbuRevenue = todaySettlements.reduce((sum, s) => sum + s.totalNetRevenue, 0)

  // LPG stats
  const todayRealisasi = realisasi.filter((r) =>
    r.deliveryDate === today && r.status === 'delivered'
  )
  const lpgVolume = todayRealisasi.reduce((sum, r) => sum + r.quantity, 0)
  const lpgRevenue = todayRealisasi.reduce((sum, r) => sum + r.totalPrice, 0)

  // Quota utilization
  const activeSAs = salesAgreements.filter((sa) => sa.status === 'active')
  const totalQuota = activeSAs.reduce((sum, sa) => sum + sa.quota, 0)
  const totalRealized = activeSAs.reduce((sum, sa) => sum + sa.realizedQuota, 0)

  return {
    date: today,
    totalTransactions: todayTransactions.length,
    totalRevenue: todayTransactions.reduce((sum, t) => sum + t.total, 0),
    spbu: {
      volume: spbuVolume,
      revenue: spbuRevenue,
      settlements: todaySettlements.length,
    },
    lpg: {
      volume: lpgVolume,
      revenue: lpgRevenue,
      deliveries: todayRealisasi.length,
      quotaUtilization: totalQuota > 0 ? (totalRealized / totalQuota) * 100 : 0,
    },
  }
}

// Helper functions

function getFuelTypeFromProduct(productName: string): string | null {
  const fuelTypes = ['Pertalite', 'Pertamax', 'Pertamax Turbo', 'Solar', 'Dexlite', 'Dex']
  for (const type of fuelTypes) {
    if (productName.toLowerCase().includes(type.toLowerCase())) {
      return type
    }
  }
  return null
}
