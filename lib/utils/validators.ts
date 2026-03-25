/**
 * Validate Indonesian email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Indonesian phone number
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  // Indonesian phone numbers are 10-13 digits
  return /^[0-9]{10,13}$/.test(cleaned)
}

/**
 * Validate NIK (Indonesian ID number)
 */
export function isValidNIK(nik: string): boolean {
  // NIK is 16 digits
  return /^[0-9]{16}$/.test(nik)
}

/**
 * Validate plate number format
 */
export function isValidPlateNumber(plate: string): boolean {
  // Indonesian plate format: B 1234 ABC or B 1234 ABCD
  const plateRegex = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{0,4}$/i
  return plateRegex.test(plate.trim())
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(value: string): boolean {
  return !value || value.trim().length === 0
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return !isEmpty(value)
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Validate number range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Validate positive number
 */
export function isPositive(value: number): boolean {
  return value > 0
}

/**
 * Validate non-negative number
 */
export function isNonNegative(value: number): boolean {
  return value >= 0
}
