/**
 * Store Middleware
 * Cross-cutting concerns for Zustand stores
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand'

/**
 * Logger middleware for debugging
 */
export function logger<T>(config: StateCreator<T>): StateCreator<T> {
  return (set, get, api) =>
    config(
      (args) => {
        const prevState = get()
        set(args)
        const nextState = get()

        if (process.env.NODE_ENV === 'development') {
          console.log('Zustand State Change:', {
            prev: prevState,
            next: nextState,
          })
        }
      },
      get,
      api
    )
}

/**
 * Reset middleware - adds reset functionality to store
 */
export type WithReset<S> = S & { reset: () => void }

type ResetLogger = <T>(config: StateCreator<T>) => StateCreator<WithReset<T>>

export const reset: ResetLogger = (config) => (set, get, api) => {
  const initialState = config(set, get, api)

  return {
    ...initialState,
    reset: () => {
      set(initialState as any)
    },
  }
}

/**
 * Dev tools middleware - connects to Redux DevTools
 */
export const devtools = <T>(
  config: StateCreator<T>,
  name: string
): StateCreator<T> => {
  if (typeof window === 'undefined' || !window.__REDUX_DEVTOOLS_EXTENSION__) {
    return config
  }

  const extension = window.__REDUX_DEVTOOLS_EXTENSION__

  return (set, get, api) => {
    const initialState = get()
    let isDispatching = false

    const devtoolsSet: typeof set = (args) => {
      isDispatching = true
      set(args)
      isDispatching = false
    }

    const store = config(devtoolsSet, get, api)

    const connection = extension.connect({ name })

    connection.init(initialState)

    api.subscribe((state, prevState) => {
      if (!isDispatching) {
        connection.send(
          { type: 'STATE_UPDATE', prevState },
          state
        )
      }
    })

    return store
  }
}

// Extend Window interface for Redux DevTools
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: (options: { name: string }) => {
        init: (state: any) => void
        send: (action: any, state: any) => void
      }
    }
  }
}

/**
 * Immer middleware (simplified) - enables immutable updates with mutable syntax
 * Note: This is a simplified version. For full immer support, install zustand/middleware/immer
 */
export function immer<T>(config: StateCreator<T>): StateCreator<T> {
  return (set, get, api) =>
    config(
      (partial) => {
        const prevState = get()

        if (typeof partial === 'function') {
          // If partial is a function, call it with current state
          const nextState = partial(prevState)
          set(nextState as any)
        } else {
          set(partial as any)
        }
      },
      get,
      api
    )
}

/**
 * Subscribe to store changes with debouncing
 */
export function createDebouncedListener<T>(
  listener: (state: T, prevState: T) => void,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null
  let prevState: T | null = null

  return (state: T) => {
    if (prevState === null) {
      prevState = state
      return
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      listener(state, prevState)
      prevState = state
    }, delay)
  }
}

/**
 * Combine multiple middlewares
 */
export function combineMiddlewares<T>(
  config: StateCreator<T>,
  ...middlewares: Array<(config: StateCreator<T>) => StateCreator<T>>
): StateCreator<T> {
  return middlewares.reduceRight((acc, middleware) => middleware(acc), config)
}

/**
 * Performance monitor middleware - measures state update performance
 */
export function performanceMonitor<T>(config: StateCreator<T>, threshold: number = 16): StateCreator<T> {
  return (set, get, api) => {
    const monitoredSet: typeof set = (args) => {
      const start = performance.now()

      set(args)

      const duration = performance.now() - start

      if (duration > threshold) {
        console.warn(`⚠️ Slow state update detected: ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`)
      }
    }

    return config(monitoredSet, get, api)
  }
}

/**
 * Action tracking middleware - tracks all actions/state changes
 */
export function actionTracker<T>(config: StateCreator<T>, name: string = 'Store'): StateCreator<T> {
  return (set, get, api) => {
    const trackedSet: typeof set = (args) => {
      const prevState = get()
      
      set(args)
      
      const nextState = get()

      // Track action
      if (process.env.NODE_ENV === 'development') {
        const actionName = getActionName(args, prevState, nextState)
        console.log(`[${name}] Action: ${actionName}`)
      }
    }

    return config(trackedSet, get, api)
  }
}

/**
 * Helper to get action name from state diff
 */
function getActionName(args: any, prevState: any, nextState: any): string {
  if (typeof args === 'function') {
    return 'update (function)'
  }

  if (typeof args === 'object' && args !== null) {
    const keys = Object.keys(args)
    if (keys.length === 1) {
      return `set ${keys[0]}`
    }
    return `set ${keys.join(', ')}`
  }

  return 'update'
}

/**
 * Local storage sync middleware (custom implementation)
 */
export function localStorageSync<T>({
  key,
  allowlist,
  denylist,
}: {
  key: string
  allowlist?: (keyof T)[]
  denylist?: (keyof T)[]
}) {
  return (config: StateCreator<T>): StateCreator<T> => {
    return (set, get, api) => {
      const store = config(set, get, api)

      // Load from localStorage on init
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(key)
          if (saved) {
            const parsed = JSON.parse(saved)
            
            // Filter by allowlist/denylist
            const filtered = filterState(parsed, allowlist, denylist)
            
            if (Object.keys(filtered).length > 0) {
              set(filtered as any)
            }
          }
        } catch (error) {
          console.warn(`Failed to load state from localStorage (${key}):`, error)
        }

        // Subscribe to changes and save to localStorage
        api.subscribe((state) => {
          try {
            const toSave = filterState(state, allowlist, denylist)
            localStorage.setItem(key, JSON.stringify(toSave))
          } catch (error) {
            console.warn(`Failed to save state to localStorage (${key}):`, error)
          }
        })
      }

      return store
    }
  }
}

/**
 * Filter state based on allowlist/denylist
 */
function filterState<T>(state: any, allowlist?: (keyof T)[], denylist?: (keyof T)[]): any {
  const keys = Object.keys(state)

  if (allowlist) {
    return allowlist.reduce((acc, key) => {
      if (key in state) {
        acc[key] = state[key]
      }
      return acc
    }, {} as any)
  }

  if (denylist) {
    return keys.reduce((acc, key) => {
      if (!denylist.includes(key as any)) {
        acc[key] = state[key]
      }
      return acc
    }, {} as any)
  }

  return state
}

/**
 * Deep freeze state (for immutability debugging)
 */
export function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  Object.freeze(obj)

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = (obj as any)[prop]

    if (typeof val === 'object' && val !== null && !Object.isFrozen(val)) {
      deepFreeze(val)
    }
  })

  return obj
}
