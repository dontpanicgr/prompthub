'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { useTheme } from '@/components/theme-provider'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  X,
  Plus,
  Search,
  TrendingUp,
  User,
  Sun,
  Moon,
  Settings,
  LogOut,
  LogIn,
  Clock,
  Compass,
  HatGlasses,
  Eye
} from 'lucide-react'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
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

  const navItems = [
    { href: '/create', label: 'New Prompt', icon: Plus },
    { href: '/', label: 'Browse', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/latest', label: 'Latest', icon: Clock },
    { href: '/me', label: 'My Prompts', icon: User },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    onClose()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-background border-r border-border transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link 
              href="/" 
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Lx</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Lexee
              </span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-nav-active text-nav-foreground' 
                      : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                    }
                  `}
                  onClick={onClose}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {/* Privacy Mode Button */}
            {user && (
              <button
                onClick={togglePrivacy}
                disabled={updatingPrivacy}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground transition-colors"
              >
                {isPrivate ? <HatGlasses size={18} /> : <Eye size={18} />}
                {isPrivate ? 'Private on' : 'Public on'}
              </button>
            )}

            {/* Theme Button */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            {/* Settings */}
            {user ? (
              <Link
                href="/settings"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground transition-colors"
                onClick={onClose}
              >
                <Settings size={18} />
                Settings
              </Link>
            ) : null}

            {/* Sign Out / Sign In */}
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-nav-hover transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            ) : (
              <Link
                href="/login?redirect=/"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground transition-colors"
                onClick={onClose}
              >
                <LogIn size={18} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
