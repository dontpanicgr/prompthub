'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import Sidebar from './sidebar'
import EmailVerificationBanner from '@/components/ui/email-verification-banner'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, loading, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

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

  // Transform Supabase user to our expected format
  const sidebarUser = user ? {
    id: user.id,
    name: user.user_metadata?.name || user.email || 'User',
    avatar_url: user.user_metadata?.avatar_url
  } : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={sidebarUser} onSignOut={handleSignOut} />
      <main className={`bg-background min-h-screen lg:pt-0 pt-16 pb-16 transition-all duration-150 ease-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Email Verification Banner */}
          {user && !user.email_confirmed_at && (
            <EmailVerificationBanner 
              email={user.email || ''} 
              onVerified={() => window.location.reload()}
            />
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
