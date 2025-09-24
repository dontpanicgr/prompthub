'use client'

import { toast } from 'sonner'

// Toast utility functions - replace the old Snackbar component
export const useToast = () => {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    })
  }

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 4000,
    })
  }

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    })
  }

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 3000,
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }
}

// Legacy Snackbar component - deprecated, use toast instead
// Usage examples:
//
// Instead of:
// <Snackbar message="Success!" isVisible={showToast} onClose={() => setShowToast(false)} type="success" />
//
// Use:
// const { showSuccess, showError, showInfo } = useToast()
// showSuccess("Operation completed successfully!")
// showError("Something went wrong", "Please try again later")

import { useEffect } from 'react'

interface SnackbarProps {
  message: string
  isVisible: boolean
  onClose: () => void
  type?: 'success' | 'error' | 'info'
}

export default function Snackbar({ message, isVisible, onClose, type = 'success' }: SnackbarProps) {
  useEffect(() => {
    if (isVisible) {
      // Use the new toast system
      const toastFunction = {
        success: () => toast.success(message),
        error: () => toast.error(message),
        info: () => toast.info(message),
      }[type] || (() => toast.success(message))

      toastFunction()

      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose, message, type])

  // Return null since we're using Sonner toasts now
  return null
}
