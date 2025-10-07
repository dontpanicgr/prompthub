'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { 
  Menu, 
  User, 
  LogIn 
} from 'lucide-react'

interface MobileTopHeaderProps {
  onMenuClick: () => void
}

export default function MobileTopHeader({ onMenuClick }: MobileTopHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left: Sidebar menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Center: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Lx</span>
          </div>
          <span className="text-xl font-bold text-foreground">
            Lexee
          </span>
        </Link>

        {/* Right: User avatar or sign in button */}
        {user ? (
          <Link
            href="/me"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata.name || 'User'} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User size={16} className="text-gray-500" />
              )}
            </div>
          </Link>
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
