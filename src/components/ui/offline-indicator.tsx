'use client'

import { useOfflineDetection } from '@/hooks/use-offline-detection'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface OfflineIndicatorProps {
  showToast?: boolean
  showBanner?: boolean
  className?: string
}

export function OfflineIndicator({ 
  showToast = true, 
  showBanner = true, 
  className = '' 
}: OfflineIndicatorProps) {
  const { isOnline, wasOffline } = useOfflineDetection()

  const handleRetry = async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        toast.success('Connection restored!')
      } else {
        throw new Error('Still offline')
      }
    } catch (error) {
      toast.error('Still offline. Check your connection.')
    }
  }

  if (!showBanner) return null

  return (
    <div className={`${className}`}>
      {!isOnline && (
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
            <span className="text-xs text-red-600 dark:text-red-300">
              Check your internet connection
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}
      
      {isOnline && wasOffline && (
        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
          <Wifi className="w-4 h-4" />
          <span className="text-sm">Back online!</span>
        </div>
      )}
    </div>
  )
}

export default OfflineIndicator
