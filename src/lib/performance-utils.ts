// Performance utilities to prevent React scheduler violations
// File: src/lib/performance-utils.ts

/**
 * Defers execution to the next idle period to prevent blocking the main thread
 * @param callback Function to execute during idle time
 * @param timeout Maximum time to wait before executing (default: 2000ms)
 * @returns Cleanup function to cancel the deferred execution
 */
export function deferToIdle(callback: () => void, timeout: number = 2000): () => void {
  if (typeof window === 'undefined') {
    // Server-side: execute immediately
    callback()
    return () => {}
  }

  if ('requestIdleCallback' in window) {
    const id = (window as any).requestIdleCallback(callback, { timeout })
    return () => (window as any).cancelIdleCallback(id)
  } else {
    // Fallback for browsers without requestIdleCallback
    const timeoutId = setTimeout(callback, 0)
    return () => clearTimeout(timeoutId)
  }
}

/**
 * Batches multiple state updates to prevent multiple re-renders
 * @param updates Array of state update functions
 */
export function batchStateUpdates(updates: (() => void)[]): void {
  if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    requestAnimationFrame(() => {
      updates.forEach(update => update())
    })
  } else {
    updates.forEach(update => update())
  }
}

/**
 * Debounces a function to prevent excessive calls
 * @param func Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Throttles a function to limit execution frequency
 * @param func Function to throttle
 * @param limit Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Creates a memoized version of a function that only recalculates when dependencies change
 * @param fn Function to memoize
 * @param deps Dependencies array
 * @returns Memoized function result
 */
export function createMemo<T>(fn: () => T, deps: any[]): T {
  let lastDeps: any[] | null = null
  let lastResult: T | null = null
  
  const hasChanged = !lastDeps || deps.some((dep, i) => dep !== lastDeps[i])
  
  if (hasChanged) {
    lastResult = fn()
    lastDeps = deps
  }
  
  return lastResult!
}

/**
 * Splits heavy operations into smaller chunks to prevent blocking
 * @param items Array of items to process
 * @param processor Function to process each item
 * @param chunkSize Number of items to process per chunk (default: 10)
 * @returns Promise that resolves when all items are processed
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T, index: number) => R | Promise<R>,
  chunkSize: number = 10
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize)
    const chunkResults = await Promise.all(
      chunk.map((item, index) => processor(item, i + index))
    )
    results.push(...chunkResults)
    
    // Yield control back to the browser
    if (i + chunkSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
  
  return results
}

/**
 * Measures execution time of a function for performance monitoring
 * @param fn Function to measure
 * @param label Label for the measurement
 * @returns Function result and execution time
 */
export function measurePerformance<T>(
  fn: () => T,
  label: string
): { result: T; time: number } {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  const time = end - start
  
  if (time > 16) { // More than one frame (16ms at 60fps)
    console.warn(`[Performance] ${label} took ${time.toFixed(2)}ms`)
  }
  
  return { result, time }
}

/**
 * Creates a performance-optimized version of React.useEffect
 * that automatically defers heavy operations
 */
export function useOptimizedEffect(
  effect: () => void | (() => void),
  deps: any[],
  options: { defer?: boolean; timeout?: number } = {}
): void {
  const { defer = true, timeout = 2000 } = options
  
  if (defer) {
    const cleanup = deferToIdle(effect, timeout)
    return cleanup
  } else {
    return effect()
  }
}
