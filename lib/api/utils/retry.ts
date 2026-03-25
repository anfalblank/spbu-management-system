/**
 * Retry Utility
 * Handles request retry logic with exponential backoff
 */

export interface RetryConfig {
  attempts: number
  delay: number
  backoffMultiplier: number
  maxDelay?: number
  retryableStatuses?: number[]
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  attempts: 3,
  delay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.delay * Math.pow(config.backoffMultiplier, attempt - 1)
  return Math.min(delay, config.maxDelay || DEFAULT_RETRY_CONFIG.maxDelay)
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  // Network errors are retryable
  if (error.name === 'TypeError' || error.code === 'NETWORK_ERROR') {
    return true
  }

  // Abort errors are not retryable
  if (error.name === 'AbortError') {
    return false
  }

  // Check status code
  if (error.status) {
    return config.retryableStatuses?.includes(error.status) || false
  }

  return false
}

/**
 * Retry request with exponential backoff
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  const mergedConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: any

  for (let attempt = 1; attempt <= mergedConfig.attempts; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error

      // Check if error is retryable
      if (!isRetryableError(error, mergedConfig)) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === mergedConfig.attempts) {
        throw error
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, mergedConfig)

      // Log retry attempt
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retry attempt ${attempt + 1}/${mergedConfig.attempts} after ${delay}ms`)
      }

      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Create a retriable function
 */
export function createRetriableFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config?: RetryConfig
): T {
  return (async (...args: Parameters<T>) => {
    return retryRequest(() => fn(...args), config)
  }) as T
}
