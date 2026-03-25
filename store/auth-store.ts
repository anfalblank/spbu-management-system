import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'admin' | 'manager' | 'cashier' | 'supervisor'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  stationId?: string
  stationName?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

// Mock login function
const mockLogin = async (email: string, password: string, role: UserRole): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Mock user data based on role
  const users: Record<UserRole, Partial<User>> = {
    admin: {
      id: 'usr-001',
      name: 'Ahmad Administrator',
      email,
      role: 'admin',
      stationName: 'SPBU Pusat',
    },
    manager: {
      id: 'usr-002',
      name: 'Budi Manager',
      email,
      role: 'manager',
      stationName: 'SPBU 34.12345',
    },
    cashier: {
      id: 'usr-003',
      name: 'Citra Kasir',
      email,
      role: 'cashier',
      stationName: 'SPBU 34.12345',
    },
    supervisor: {
      id: 'usr-004',
      name: 'Dedi Supervisor',
      email,
      role: 'supervisor',
      stationName: 'Area Jakarta Barat',
    },
  }

  return {
    ...users[role],
    email,
    role,
  } as User
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string, role: UserRole) => {
        set({ isLoading: true })
        try {
          const user = await mockLogin(email, password, role)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
