'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
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

  useEffect(() => {
    const loadPrivacy = async () => {
      try {
        if (!user?.id) return
        const { data } = await supabase.from('profiles').select('is_private').eq('id', user.id).single()
        if (data) setIsPrivate(!!data.is_private)
      } catch {}
    }
    loadPrivacy()
  }, [user?.id])

  const togglePrivacy = async () => {
    if (!user?.id || updatingPrivacy) return
    try {
      setUpdatingPrivacy(true)
      const next = !isPrivate
      const { error } = await supabase.from('profiles').update({ is_private: next, updated_at: new Date().toISOString() }).eq('id', user.id)
      if (!error) {
        setIsPrivate(next)
        try {
          window.dispatchEvent(new CustomEvent('privacy-mode-change', { detail: { isPrivate: next } }))
        } catch {}
        try {
          const message = next ? 'Private mode enabled' : 'Public mode enabled'
          const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 1024px)').matches
          if (isMobile) {
            toast.success(message, {
              action: {
                label: 'Refresh',
                onClick: () => window.location.reload()
              }
            })
          } else {
            toast.success(message)
          }
        } catch {}
      }
    } finally {
      setUpdatingPrivacy(false)
    }
  }

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

        {/* Right: Privacy toggle + avatar or sign in */}
        {user ? (
          <div className="flex items-center gap-2">
            <Tooltip
              content={
                <div className="max-w-[240px] p-1">
                  <div className="text-xs font-medium mb-1">Privacy mode</div>
                  <div className="text-xs">
                    <div>👁️ Public: Your profile is visible; your public prompts are visible to all.</div>
                    <div>🥸 Private: Your profile is visible; your prompts are hidden.</div>
                    <div>💡 You can also make individual prompts private and keep your profile public.</div>
                  </div>
                </div>
              }
            >
              <button
                onClick={togglePrivacy}
                disabled={updatingPrivacy}
                className={`p-2 rounded-lg transition-colors ${isPrivate ? 'bg-privacy text-privacy-foreground' : 'hover:bg-muted'}`}
                aria-label="Toggle privacy mode"
                title={isPrivate ? 'Private on' : 'Public on'}
              >
                {isPrivate ? <HatGlasses size={18} /> : <Eye size={18} />}
              </button>
            </Tooltip>
            <Link
              href="/me"
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
