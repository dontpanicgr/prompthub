'use client'

import { useAuth } from '@/components/auth-provider'
import Sidebar from './sidebar'
import EmailVerificationBanner from '@/components/ui/email-verification-banner'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // Transform Supabase user to our expected format
  const sidebarUser = user ? {
    id: user.id,
    name: user.user_metadata?.name || user.email || 'User',
    avatar_url: user.user_metadata?.avatar_url
  } : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Sidebar user={sidebarUser} onSignOut={handleSignOut} />
      <main className="lg:ml-64 bg-white dark:bg-gray-900 min-h-screen">
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
