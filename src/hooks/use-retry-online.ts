'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useOfflineDetection } from './use-offline-detection'

interface UseRetryOnlineOptions {
  onOnline?: () => void
  retryDelay?: number
}

export function useRetryOnline({ onOnline, retryDelay = 1000 }: UseRetryOnlineOptions = {}) {
  const { isOnline } = useOfflineDetection()
  const hasTriggeredRef = useRef(false)
  const wasOfflineRef = useRef(false)

  const retry = useCallback(async (fn: () => Promise<any>) => {
    if (!isOnline) {
      console.warn('Still offline, cannot retry')
      return null
    }

    try {
      const result = await fn()
      console.log('Retry successful')
      return result
    } catch (error) {
      console.error('Retry failed:', error)
      throw error
    }
  }, [isOnline])

  useEffect(() => {
    // Only trigger onOnline when we transition from offline to online
    if (isOnline && !wasOfflineRef.current && onOnline && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      wasOfflineRef.current = true
      
      // Small delay to ensure connection is stable
      const timeout = setTimeout(() => {
        console.log('🔄 Connection restored, triggering onOnline callback')
        onOnline()
      }, retryDelay)

      return () => clearTimeout(timeout)
    }
    
    // Reset flags when going offline
    if (!isOnline) {
      hasTriggeredRef.current = false
      wasOfflineRef.current = false
    }
  }, [isOnline, onOnline, retryDelay])

  return { retry, isOnline }
}
