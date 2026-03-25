/**
 * POS Validation Utilities
 * Validation rules and helpers for POS operations
 */

import type { CartItem, PaymentMethod } from '@/store/types'

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Validate a single cart item
 */
export function validateCartItem(item: CartItem): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!item.id) {
    errors.push('Item ID tidak valid')
  }

  if (!item.productId) {
    errors.push('Product ID tidak valid')
  }

  if (!item.name || item.name.trim() === '') {
    errors.push('Nama produk tidak valid')
  }

  // Validate price
  if (typeof item.price !== 'number' || item.price < 0) {
    errors.push('Harga tidak valid')
  }

  if (item.price === 0) {
    warnings.push('Harga produk adalah Rp 0')
  }

  // Validate quantity
  if (typeof item.quantity !== 'number' || item.quantity <= 0) {
    errors.push('Jumlah tidak valid')
  }

  if (!Number.isInteger(item.quantity)) {
    errors.push('Jumlah harus bilangan bulat')
  }

  // Validate stock
  if (item.stock !== undefined && item.quantity > item.stock) {
    errors.push(`Stok tidak mencukupi. Tersedia: ${item.stock}, Diminta: ${item.quantity}`)
  }

  if (item.stock !== undefined && item.stock === 0) {
    errors.push('Produk sedang tidak tersedia (stok habis)')
  }

  // Validate module
  if (!['spbu', 'gas', 'oli', 'snb'].includes(item.module)) {
    errors.push('Modul produk tidak valid')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validate complete cart
 */
export function validateCart(items: CartItem[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (items.length === 0) {
    errors.push('Keranjang belanja kosong')
    return { valid: false, errors }
  }

  // Validate each item
  items.forEach((item, index) => {
    const itemValidation = validateCartItem(item)

    if (!itemValidation.valid) {
      itemValidation.errors.forEach((error) => {
        errors.push(`Item ${index + 1}: ${error}`)
      })
    }

    if (itemValidation.warnings) {
      itemValidation.warnings.forEach((warning) => {
        warnings.push(`Item ${index + 1}: ${warning}`)
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(method: PaymentMethod | null): ValidationResult {
  const errors: string[] = []

  if (!method) {
    errors.push('Metode pembayaran belum dipilih')
    return { valid: false, errors }
  }

  const validMethods: PaymentMethod[] = ['cash', 'qris', 'transfer', 'voucher']

  if (!validMethods.includes(method)) {
    errors.push('Metode pembayaran tidak valid')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate payment amount
 */
export function validatePaymentAmount(
  total: number,
  paidAmount: number,
  paymentMethod: PaymentMethod
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof paidAmount !== 'number' || paidAmount < 0) {
    errors.push('Jumlah pembayaran tidak valid')
    return { valid: false, errors }
  }

  if (paymentMethod === 'cash') {
    if (paidAmount < total) {
      errors.push(`Jumlah pembayaran kurang. Kekurangan: Rp ${(total - paidAmount).toLocaleString('id-ID')}`)
    }

    if (paidAmount > total * 10) {
      warnings.push('Jumlah pembayaran jauh melebihi total')
    }
  }

  if (paymentMethod === 'qris' || paymentMethod === 'transfer') {
    if (paidAmount !== total && paidAmount !== 0) {
      warnings.push('Untuk QRIS/Transfer, jumlah pembayaran harus sama dengan total')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validate complete checkout data
 */
export function validateCheckout(data: {
  items: CartItem[]
  total: number
  paymentMethod: PaymentMethod | null
  paidAmount: number
}): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate cart
  const cartValidation = validateCart(data.items)
  if (!cartValidation.valid) {
    errors.push(...cartValidation.errors)
  }
  if (cartValidation.warnings) {
    warnings.push(...cartValidation.warnings)
  }

  // Validate payment method
  const paymentMethodValidation = validatePaymentMethod(data.paymentMethod)
  if (!paymentMethodValidation.valid) {
    errors.push(...paymentMethodValidation.errors)
  }

  // Validate payment amount
  if (data.paymentMethod) {
    const amountValidation = validatePaymentAmount(
      data.total,
      data.paidAmount,
      data.paymentMethod
    )
    if (!amountValidation.valid) {
      errors.push(...amountValidation.errors)
    }
    if (amountValidation.warnings) {
      warnings.push(...amountValidation.warnings)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Format validation error for display
 */
export function formatValidationError(errors: string[]): string {
  if (errors.length === 0) return ''

  if (errors.length === 1) {
    return errors[0]
  }

  return errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n...dan ${errors.length - 3} lainnya` : '')
}

/**
 * Get validation message by type
 */
export function getValidationMessage(type: 'cart_empty' | 'stock_insufficient' | 'payment_required' | 'amount_insufficient'): string {
  const messages = {
    cart_empty: 'Keranjang belanja masih kosong. Silakan tambahkan produk terlebih dahulu.',
    stock_insufficient: 'Beberapa produk memiliki stok tidak mencukupi. Mohon periksa kuantitas.',
    payment_required: 'Silakan pilih metode pembayaran.',
    amount_insufficient: 'Jumlah pembayaran kurang. Mohon periksa kembali.',
  }

  return messages[type] || 'Validasi gagal'
}
