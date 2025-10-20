'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { 
  PanelLeft, 
  User, 
  LogIn, 
  HatGlasses,
  Eye
 } from 'lucide-react'
import Tooltip from '@/components/ui/tooltip'
import { toast } from 'sonner'
import Avatar from '@/components/ui/avatar'

interface MobileTopHeaderProps {}

export default function MobileTopHeader({}: MobileTopHeaderProps) {
  const { user } = useAuth()
  const [isPrivate, setIsPrivate] = useState(false)
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false)

  // Privacy toggle removed from top header (remains in drawer)

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border transition-colors">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Lx</span>
          </div>
        </Link>

        {/* Right: Avatar or sign in */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href={user ? `/user/${user.id}` : '/login'}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {(() => {
                const avatarUrl = (user as any)?.user_metadata?.avatar_url
                  || (user as any)?.user_metadata?.picture
                  || (user as any)?.identities?.find((i: any) => i?.provider === 'google')?.identity_data?.picture
                  || null
                const displayName = (user as any)?.user_metadata?.name || user.email || 'User'
                return (
                  <div className="rounded-full bg-muted flex items-center justify-center text-muted-foreground w-8 h-8 text-sm shrink-0">
                    <span className="font-semibold">{displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                )
              })()}
            </Link>
          </div>
        ) : (
          <Link
            href="/login?redirect=/"
            className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </header>
  )
}
