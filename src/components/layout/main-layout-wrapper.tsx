'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { usePathname } from 'next/navigation'
import { useOfflineDetection } from '@/hooks/use-offline-detection'
import Sidebar from './sidebar'
import MobileTopHeader from './mobile-top-header'
import MobileBottomNav from './mobile-bottom-nav'
import MobileDrawer from './mobile-drawer'
import SecondaryNavMe from './secondary-nav-me'
import EmailVerificationBanner from '@/components/ui/email-verification-banner'

interface MainLayoutWrapperProps {
  children: React.ReactNode
}

export default function MainLayoutWrapper({ children }: MainLayoutWrapperProps) {
  const { user, loading, signOut } = useAuth()
  const { isOnline } = useOfflineDetection()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // On server, always return true to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return true
    }
    
    // On client, try to read from localStorage immediately
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved) {
        return JSON.parse(saved) === true
      }
    } catch (error) {
      console.warn('Failed to parse sidebar state from localStorage:', error)
    }
    
    // Default to collapsed if no saved state
    return true
  })
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const handleSignOut = useCallback(async () => {
    await signOut()
  }, [signOut])

  const handleMobileMenuClick = useCallback(() => {
    setIsMobileDrawerOpen(true)
  }, [])

  const handleMobileDrawerClose = useCallback(() => {
    setIsMobileDrawerOpen(false)
  }, [])

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Listen for sidebar state changes
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed)
    }

    window.addEventListener('sidebar-state-change', handleSidebarStateChange as EventListener)

    return () => {
      window.removeEventListener('sidebar-state-change', handleSidebarStateChange as EventListener)
    }
  }, [])

  // Transform Supabase user to our expected format - memoize to prevent re-renders
  const sidebarUser = useMemo(() => {
    if (!user) return null
    return {
      id: user.id,
      name: user.user_metadata?.name || user.email || 'User',
      avatar_url: user.user_metadata?.avatar_url
    }
  }, [user?.id, user?.user_metadata?.name, user?.email, user?.user_metadata?.avatar_url])

  // Show loading only after hydration to prevent mismatch
  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - This stays mounted and doesn't re-render */}
      <Sidebar user={sidebarUser} onSignOut={handleSignOut} />
      
      {/* Mobile Top Header */}
      <MobileTopHeader onMenuClick={handleMobileMenuClick} />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      
      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={isMobileDrawerOpen} 
        onClose={handleMobileDrawerClose} 
      />
      
      {/* Secondary aside for /me routes - sibling to main, independent of main */}
      {pathname?.startsWith('/me') && (
        <aside
          className={`hidden lg:block fixed inset-y-0 z-30 overflow-y-auto w-[300px] ${sidebarCollapsed ? 'left-16' : 'left-64'}`}
          aria-label="Secondary navigation"
        >
          <SecondaryNavMe />
        </aside>
      )}

      <main className={`bg-background min-h-screen lg:pt-0 pt-16 pb-20 lg:pb-0 transition-colors duration-150 ease-out ${pathname?.startsWith('/me') ? (sidebarCollapsed ? 'lg:ml-[calc(4rem+300px)]' : 'lg:ml-[calc(16rem+300px)]') : (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')}`}>
        {pathname?.startsWith('/me') ? (
          <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
            {/* Offline Banner */}
            {!isOnline && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">You're offline</span>
                <span className="text-xs text-red-600 dark:text-red-300">Check your internet connection</span>
              </div>
            )}
            {/* Email Verification Banner */}
            {user && !user.email_confirmed_at && (
              <EmailVerificationBanner 
                email={user.email || ''} 
                onVerified={() => window.location.reload()}
              />
            )}
            {children}
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Offline Banner */}
          {!isOnline && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">You're offline</span>
              <span className="text-xs text-red-600 dark:text-red-300">Check your internet connection</span>
            </div>
          )}
          
          {/* Email Verification Banner */}
          {user && !user.email_confirmed_at && (
            <EmailVerificationBanner 
              email={user.email || ''} 
              onVerified={() => window.location.reload()}
            />
          )}
          {children}
          </div>
        )}
      </main>
    </div>
  )
}
