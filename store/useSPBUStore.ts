/**
 * SPBU Store
 * Manages SPBU (fuel station) operations including shifts, dispensers, tanks, and settlements
 */

import { create } from 'zustand'
import { createJSONStorage, persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { logger } from './utils/middleware'
import { ApiError } from './utils/error-handler'

// Types
export type DispenserStatus = 'active' | 'inactive' | 'maintenance'
export type NozzleStatus = 'active' | 'inactive' | 'error'
export type FuelType = 'Pertalite' | 'Pertamax' | 'Pertamax Turbo' | 'Solar' | 'Dexlite' | 'Dex'
export type ShiftStatus = 'pending' | 'open' | 'closed' | 'settled'
export type SettlementStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Nozzle {
  id: string
  dispenserId: string
  number: number
  fuelType: FuelType
  status: NozzleStatus
  pricePerLiter: number
}

export interface Dispenser {
  id: string
  name: string
  number: number
  status: DispenserStatus
  nozzles: Nozzle[]
  location: string
}

export interface Tank {
  id: string
  number: number
  fuelType: FuelType
  capacity: number // in liters
  currentVolume: number // in liters
  minVolume: number // alert threshold
  lastDelivery: string | null
  lastDeliveryVolume: number
}

export interface Shift {
  id: string
  date: string
  number: 1 | 2 | 3
  operator: string
  operatorId: string
  status: ShiftStatus
  openingCash: number
  closingCash?: number
  startTime: string
  endTime?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SettlementNozzle {
  nozzleId: string
  nozzleNumber: number
  fuelType: FuelType
  openingMeter: number
  closingMeter: number
  volume: number
  pricePerLiter: number
  total: number
  testVolume?: number // volume for testing/bakter
}

export interface SettlementPayment {
  method: 'cash' | 'qris' | 'transfer' | 'voucher'
  amount: number
}

export interface Settlement {
  id: string
  shiftId: string
  date: string
  shiftNumber: 1 | 2 | 3
  dispenserId: string
  dispenserName: string
  nozzleData: SettlementNozzle[]
  payments: SettlementPayment[]
  totalVolume: number
  totalRevenue: number
  testVolumeTotal: number
  testRevenueTotal: number
  status: SettlementStatus
  selisih: {
    volume: number
    amount: number
    percentage: number
  }
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface SPBUReport {
  date: string
  totalVolume: number
  totalRevenue: number
  totalTestVolume: number
  totalTestRevenue: number
  totalNetRevenue: number
  perFuelType: {
    fuelType: FuelType
    volume: number
    revenue: number
  }[]
  perShift: {
    shiftNumber: number
    volume: number
    revenue: number
  }[]
  perDispenser: {
    dispenserId: string
    dispenserName: string
    volume: number
    revenue: number
  }[]
}

// State interface
interface SPBUState {
  // Dispensers
  dispensers: Dispenser[]
  selectedDispenser: Dispenser | null

  // Tanks
  tanks: Tank[]
  tankAlerts: string[] // tank IDs with low stock

  // Shifts
  shifts: Shift[]
  currentShift: Shift | null
  selectedShift: Shift | null

  // Settlements
  settlements: Settlement[]
  selectedSettlement: Settlement | null

  // Reports
  reports: SPBUReport[]
  selectedReport: SPBUReport | null

  // Loading states
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  // Actions
  // Dispenser actions
  setDispensers: (dispensers: Dispenser[]) => void
  setSelectedDispenser: (dispenser: Dispenser | null) => void
  addDispenser: (dispenser: Dispenser) => void
  updateDispenser: (id: string, data: Partial<Dispenser>) => void
  deleteDispenser: (id: string) => void

  // Tank actions
  setTanks: (tanks: Tank[]) => void
  updateTank: (id: string, data: Partial<Tank>) => void
  checkTankAlerts: () => void

  // Shift actions
  setShifts: (shifts: Shift[]) => void
  setSelectedShift: (shift: Shift | null) => void
  createShift: (shift: Omit<Shift, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Shift
  openShift: (shiftId: string, openingCash: number) => void
  closeShift: (shiftId: string, closingCash: number, notes?: string) => void
  getCurrentShift: () => Shift | null

  // Settlement actions
  setSettlements: (settlements: Settlement[]) => void
  setSelectedSettlement: (settlement: Settlement | null) => void
  createSettlement: (settlement: Omit<Settlement, 'id' | 'status' | 'selisih' | 'createdAt' | 'updatedAt'>) => Settlement
  updateSettlement: (id: string, data: Partial<Settlement>) => void
  submitSettlement: (id: string, submittedBy: string) => void
  approveSettlement: (id: string, approvedBy: string) => void
  rejectSettlement: (id: string) => void
  calculateSelisih: (nozzle: SettlementNozzle, systemVolume: number) => { volume: number; amount: number; percentage: number }

  // Report actions
  setReports: (reports: SPBUReport[]) => void
  setSelectedReport: (report: SPBUReport | null) => void

  // UI actions
  setLoading: (loading: boolean) => void
  setSubmitting: (submitting: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

// Initial state
const initialState = {
  dispensers: [],
  selectedDispenser: null,
  tanks: [],
  tankAlerts: [],
  shifts: [],
  currentShift: null,
  selectedShift: null,
  settlements: [],
  selectedSettlement: null,
  reports: [],
  selectedReport: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
}

// Create store
export const useSPBUStore = create<SPBUState>()(
  logger(
    devtools(
      persist(
        immer((set, get) => ({
          ...initialState,

          // Dispenser actions
          setDispensers: (dispensers) =>
            set((state) => {
              state.dispensers = dispensers
            }),

          setSelectedDispenser: (dispenser) =>
            set((state) => {
              state.selectedDispenser = dispenser
            }),

          addDispenser: (dispenser) =>
            set((state) => {
              state.dispensers.push(dispenser)
            }),

          updateDispenser: (id, data) =>
            set((state) => {
              const index = state.dispensers.findIndex((d) => d.id === id)
              if (index !== -1) {
                Object.assign(state.dispensers[index], data)
              }
            }),

          deleteDispenser: (id) =>
            set((state) => {
              state.dispensers = state.dispensers.filter((d) => d.id !== id)
              if (state.selectedDispenser?.id === id) {
                state.selectedDispenser = null
              }
            }),

          // Tank actions
          setTanks: (tanks) =>
            set((state) => {
              state.tanks = tanks
              get().checkTankAlerts()
            }),

          updateTank: (id, data) =>
            set((state) => {
              const index = state.tanks.findIndex((t) => t.id === id)
              if (index !== -1) {
                Object.assign(state.tanks[index], data)
                get().checkTankAlerts()
              }
            }),

          checkTankAlerts: () =>
            set((state) => {
              state.tankAlerts = state.tanks
                .filter((t) => t.currentVolume <= t.minVolume)
                .map((t) => t.id)
            }),

          // Shift actions
          setShifts: (shifts) =>
            set((state) => {
              state.shifts = shifts
              state.currentShift = shifts.find((s) => s.status === 'open') || null
            }),

          setSelectedShift: (shift) =>
            set((state) => {
              state.selectedShift = shift
            }),

          createShift: (shiftData) => {
            const newShift: Shift = {
              ...shiftData,
              id: `shift-${Date.now()}`,
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            set((state) => {
              state.shifts.push(newShift)
            })
            return newShift
          },

          openShift: (shiftId, openingCash) =>
            set((state) => {
              const shift = state.shifts.find((s) => s.id === shiftId)
              if (shift) {
                shift.status = 'open'
                shift.openingCash = openingCash
                shift.startTime = new Date().toISOString()
                shift.updatedAt = new Date().toISOString()
                state.currentShift = shift
              }
            }),

          closeShift: (shiftId, closingCash, notes) =>
            set((state) => {
              const shift = state.shifts.find((s) => s.id === shiftId)
              if (shift) {
                shift.status = 'closed'
                shift.closingCash = closingCash
                shift.endTime = new Date().toISOString()
                shift.notes = notes
                shift.updatedAt = new Date().toISOString()
                if (state.currentShift?.id === shiftId) {
                  state.currentShift = null
                }
              }
            }),

          getCurrentShift: () => get().currentShift,

          // Settlement actions
          setSettlements: (settlements) =>
            set((state) => {
              state.settlements = settlements
            }),

          setSelectedSettlement: (settlement) =>
            set((state) => {
              state.selectedSettlement = settlement
            }),

          createSettlement: (settlementData) => {
            const now = new Date().toISOString()

            // Calculate totals
            const totalVolume = settlementData.nozzleData.reduce(
              (sum, n) => sum + n.volume - (n.testVolume || 0),
              0
            )
            const totalRevenue = settlementData.nozzleData.reduce(
              (sum, n) => sum + n.total - (n.testVolume || 0) * n.pricePerLiter,
              0
            )
            const testVolumeTotal = settlementData.nozzleData.reduce(
              (sum, n) => sum + (n.testVolume || 0),
              0
            )
            const testRevenueTotal = settlementData.nozzleData.reduce(
              (sum, n) => sum + (n.testVolume || 0) * n.pricePerLiter,
              0
            )

            // Calculate selisih for each nozzle
            const nozzleDataWithSelisih = settlementData.nozzleData.map((nozzle) => {
              const selisih = get().calculateSelisih(nozzle, nozzle.volume)
              return { ...nozzle, selisih }
            })

            const newSettlement: Settlement = {
              ...settlementData,
              id: `settlement-${Date.now()}`,
              nozzleData: nozzleDataWithSelisih,
              totalVolume,
              totalRevenue,
              testVolumeTotal,
              testRevenueTotal,
              totalNetRevenue: totalRevenue - testRevenueTotal,
              status: 'draft',
              selisih: {
                volume: 0,
                amount: 0,
                percentage: 0,
              },
              createdAt: now,
              updatedAt: now,
            }
            set((state) => {
              state.settlements.push(newSettlement)
            })
            return newSettlement
          },

          updateSettlement: (id, data) =>
            set((state) => {
              const index = state.settlements.findIndex((s) => s.id === id)
              if (index !== -1) {
                Object.assign(state.settlements[index], data)
                state.settlements[index].updatedAt = new Date().toISOString()

                // Recalculate totals
                const settlement = state.settlements[index]
                const totalVolume = settlement.nozzleData.reduce(
                  (sum, n) => sum + n.volume - (n.testVolume || 0),
                  0
                )
                const totalRevenue = settlement.nozzleData.reduce(
                  (sum, n) => sum + n.total - (n.testVolume || 0) * n.pricePerLiter,
                  0
                )
                settlement.totalVolume = totalVolume
                settlement.totalRevenue = totalRevenue
                settlement.totalNetRevenue = totalRevenue - settlement.testRevenueTotal
              }
            }),

          submitSettlement: (id, submittedBy) =>
            set((state) => {
              const settlement = state.settlements.find((s) => s.id === id)
              if (settlement && settlement.status === 'draft') {
                settlement.status = 'submitted'
                settlement.submittedAt = new Date().toISOString()
                settlement.submittedBy = submittedBy
                settlement.updatedAt = new Date().toISOString()
              }
            }),

          approveSettlement: (id, approvedBy) =>
            set((state) => {
              const settlement = state.settlements.find((s) => s.id === id)
              if (settlement && settlement.status === 'submitted') {
                settlement.status = 'approved'
                settlement.approvedAt = new Date().toISOString()
                settlement.approvedBy = approvedBy
                settlement.updatedAt = new Date().toISOString()
              }
            }),

          rejectSettlement: (id) =>
            set((state) => {
              const settlement = state.settlements.find((s) => s.id === id)
              if (settlement && settlement.status === 'submitted') {
                settlement.status = 'rejected'
                settlement.updatedAt = new Date().toISOString()
              }
            }),

          calculateSelisih: (nozzle, systemVolume) => {
            const volumeDiff = nozzle.closingMeter - nozzle.openingMeter - nozzle.volume
            const amountDiff = volumeDiff * nozzle.pricePerLiter
            const percentage = systemVolume > 0 ? (Math.abs(volumeDiff) / systemVolume) * 100 : 0

            return {
              volume: volumeDiff,
              amount: amountDiff,
              percentage,
            }
          },

          // Report actions
          setReports: (reports) =>
            set((state) => {
              state.reports = reports
            }),

          setSelectedReport: (report) =>
            set((state) => {
              state.selectedReport = report
            }),

          // UI actions
          setLoading: (loading) =>
            set((state) => {
              state.isLoading = loading
            }),

          setSubmitting: (submitting) =>
            set((state) => {
              state.isSubmitting = submitting
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
          name: 'spbu-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            dispensers: state.dispensers,
            tanks: state.tanks,
            shifts: state.shifts,
            settlements: state.settlements,
            reports: state.reports,
          }),
        }
      )
    )
  )
)
