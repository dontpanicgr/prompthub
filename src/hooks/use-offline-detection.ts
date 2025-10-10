'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const offlineCheckDisabled = process.env.NEXT_PUBLIC_DISABLE_OFFLINE_CHECKER === 'true'

  useEffect(() => {
    // If offline detection is disabled, force online and skip listeners
    if (offlineCheckDisabled) {
      setIsOnline(true)
      setWasOffline(false)
      return () => {}
    }

    // Set initial state when enabled
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      // Debounce online state changes
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        setIsOnline(true)
        if (wasOffline) {
          toast.success('You\'re back online!', {
            duration: 3000,
            description: 'Connection restored'
          })
          setWasOffline(false)
        }
      }, 500) // 500ms debounce
    }

    const handleOffline = () => {
      // Debounce offline state changes
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        setIsOnline(false)
        setWasOffline(true)
        toast.error('You\'re offline', {
          duration: 0, // Keep showing until online
          description: 'Check your internet connection',
          action: {
            label: 'Retry',
            onClick: () => {
              // Force a network check
              fetch('/api/health', { 
                method: 'HEAD',
                cache: 'no-cache'
              }).then(() => {
                setIsOnline(true)
                setWasOffline(false)
                toast.dismiss()
                toast.success('Connection restored!')
              }).catch(() => {
                // Still offline, keep the error toast
              })
            }
          }
        })
      }, 500) // 500ms debounce
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Also check periodically for more reliable detection
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        
        if (!response.ok) {
          throw new Error('Network error')
        }
        
        if (!isOnline) {
          setIsOnline(true)
          if (wasOffline) {
            toast.success('You\'re back online!', {
              duration: 3000,
              description: 'Connection restored'
            })
            setWasOffline(false)
          }
        }
      } catch (error) {
        if (isOnline) {
          setIsOnline(false)
          setWasOffline(true)
          toast.error('You\'re offline', {
            duration: 0,
            description: 'Check your internet connection',
            action: {
              label: 'Retry',
              onClick: () => checkConnection()
            }
          })
        }
      }
    }

    // Check connection every 60 seconds (less aggressive)
    const interval = setInterval(checkConnection, 60000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [isOnline, wasOffline, offlineCheckDisabled])

  return { isOnline, wasOffline }
}
