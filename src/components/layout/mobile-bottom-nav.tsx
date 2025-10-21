'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { 
  Compass, 
  TrendingUp, 
  Plus,
  Award,
  MoreHorizontal,
  Settings as SettingsIcon,
  Moon,
  Sun,
  LogOut,
  User,
  Eye,
  EyeOff
} from 'lucide-react'

// Configuration constants
const NAV_CONFIG = {
  // Dimensions
  height: '56px', // Updated height
  containerHeight: 'h-14', // Tailwind class for container
  
  // Spacing
  margin: 'm-3',
  padding: 'p-2',
  itemPadding: 'py-2', // Reduced padding for better centering
  
  // Visual styling
  borderRadius: 'rounded-xl',
  backdropBlur: 'backdrop-blur-md',
  shadow: 'shadow-md',
  
  // Z-index layers
  navZIndex: 'z-50',
  overlayZIndex: 'z-[60]',
  sheetZIndex: 'z-[61]',
  
  // Icon size
  iconSize: 20,
  
  // Gradient colors (you can customize these)
  gradientColors: {
    primary: 'rgb(61 3 3)',
    secondary: 'rgb(27 17 56)',
    angle: '45deg'
  }
} as const

// Navigation items configuration
const NAV_ITEMS = [
  { href: '/', label: 'Discover', icon: Compass },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/add', label: 'Add', icon: Plus },
  { href: '/rankings', label: 'Rankings', icon: Award },
] as const

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut, signingOut } = useAuth()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [updatingPrivacy, setUpdatingPrivacy] = useState<boolean>(false)

  // Close menu when pathname changes (navigation occurs)
  useEffect(() => {
    setIsSheetOpen(false)
  }, [pathname])

  // Load privacy status
  useEffect(() => {
    const loadPrivacy = async () => {
      try {
        if (!user?.id) return
        const { data, error } = await supabase
          .from('profiles')
          .select('is_private')
          .eq('id', user.id)
          .single()
        if (!error && data) {
          setIsPrivate(!!data.is_private)
        }
      } catch {}
    }
    loadPrivacy()
  }, [user?.id])

  const togglePrivacy = async () => {
    if (!user?.id || updatingPrivacy) return
    try {
      setUpdatingPrivacy(true)
      const next = !isPrivate
      const { error } = await supabase
        .from('profiles')
        .update({ is_private: next, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (!error) {
        setIsPrivate(next)
        const message = next ? 'Profile set to private' : 'Profile set to public'
        toast.success(message)
      } else {
        toast.error('Failed to update privacy')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to update privacy')
    } finally {
      setUpdatingPrivacy(false)
    }
  }

  return (
    <nav 
      className={`lg:hidden fixed bottom-0 left-0 right-0 ${NAV_CONFIG.navZIndex} bg-card ${NAV_CONFIG.backdropBlur} border border-border ${NAV_CONFIG.borderRadius} ${NAV_CONFIG.margin} ${NAV_CONFIG.shadow} transition-colors`}
      style={{
        background: `linear-gradient(${NAV_CONFIG.gradientColors.angle}, ${NAV_CONFIG.gradientColors.primary}, ${NAV_CONFIG.gradientColors.secondary})`,
        height: NAV_CONFIG.height
      }}
    >
      <div className={`flex items-center ${NAV_CONFIG.containerHeight} ${NAV_CONFIG.padding}`}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/' 
            ? (pathname === '/' || pathname === '/discover')
            : pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-center ${NAV_CONFIG.itemPadding} rounded-lg text-xs font-medium transition-colors flex-1 h-full
                ${isActive 
                  ? 'bg-white/15 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={NAV_CONFIG.iconSize} className="flex-shrink-0" />
            </Link>
          )
        })}
        {/* Avatar or More menu trigger */}
        <button
          aria-label={user ? "User menu" : "More options"}
          className={`flex items-center justify-center ${NAV_CONFIG.itemPadding} rounded-lg text-xs font-medium transition-colors flex-1 h-full ${
            user && (pathname === `/user/${user.id}` || pathname.startsWith('/me'))
              ? 'bg-white/15 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
          onClick={() => setIsSheetOpen(prev => !prev)}
          aria-pressed={isSheetOpen}
        >
          {user ? (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm shrink-0">
              <span className="font-semibold">
                {(() => {
                  const displayName = (user as any)?.user_metadata?.name || user.email || 'User'
                  return displayName?.charAt(0)?.toUpperCase() || 'U'
                })()}
              </span>
            </div>
          ) : (
            <MoreHorizontal size={NAV_CONFIG.iconSize} className="flex-shrink-0" />
          )}
        </button>
      </div>

      {/* Bottom sheet */}
      {isSheetOpen && (
        <>
          {/* Click outside to close overlay */}
          <div 
            className={`fixed inset-0 ${NAV_CONFIG.overlayZIndex}`}
            onClick={() => setIsSheetOpen(false)}
          />
          <div className={`fixed inset-x-0 bottom-16 ${NAV_CONFIG.sheetZIndex}`}>
            <div className={`${NAV_CONFIG.borderRadius} border border-border bg-background`}>
              <div className="p-2">
                {/* Only show menu items for logged in users */}
                {user && (
                  <>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        setIsSheetOpen(false)
                        router.push(`/user/${user.id}`)
                      }}
                    >
                      <User size={18} />
                      Profile
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                        setIsSheetOpen(false)
                      }}
                    >
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      {theme === 'dark' ? 'Lights on' : 'Lights off'}
                    </button>
                    <button
                      onClick={togglePrivacy}
                      disabled={updatingPrivacy}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
                      {isPrivate ? 'Switch to public' : 'Switch to private'}
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-foreground hover:bg-muted transition-colors"
                      onClick={() => {
                        setIsSheetOpen(false)
                        router.push('/settings')
                      }}
                    >
                      <SettingsIcon size={18} />
                      Settings
                    </button>
                  </>
                )}
                {user ? (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-red-600 dark:text-red-400 hover:bg-muted/60 transition-colors disabled:opacity-50"
                    disabled={signingOut}
                    onClick={async () => {
                      await signOut()
                      setIsSheetOpen(false)
                      router.push('/')
                    }}
                  >
                    <LogOut size={18} />
                    {signingOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                ) : (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-foreground hover:bg-muted transition-colors"
                    onClick={() => {
                      setIsSheetOpen(false)
                      router.push('/login?redirect=/')
                    }}
                  >
                    <LogOut size={18} />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
