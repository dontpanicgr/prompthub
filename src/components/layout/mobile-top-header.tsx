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

interface MobileTopHeaderProps {
  onMenuClick: () => void
}

export default function MobileTopHeader({ onMenuClick }: MobileTopHeaderProps) {
  const { user } = useAuth()
  const [isPrivate, setIsPrivate] = useState(false)
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false)

  // Privacy toggle removed from top header (remains in drawer)

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Sidebar menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <PanelLeft size={20} />
        </button>

        {/* Center: Logo (icon only on mobile) */}
        <Link href="/" className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Px</span>
          </div>
        </Link>

        {/* Right: Avatar or sign in (privacy toggle removed, available in drawer) */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href={user ? `/user/${user.id}` : '/login'}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.name || 'User'}
                size="sm"
                fallback={user.user_metadata?.name?.charAt(0)?.toUpperCase() || 'U'}
              />
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
