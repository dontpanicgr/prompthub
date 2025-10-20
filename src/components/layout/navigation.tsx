'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  TrendingUp, 
  User, 
  Sun,
  Moon,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Compass,
  Award,
  LogIn,
  Wrench,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/components/auth-provider'
import { Avatar } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function Navigation() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut, signingOut } = useAuth()

  const navItems = [
    { href: '/add', label: 'Add Prompt', icon: Plus, highlight: true },
  { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/rankings', label: 'Rankings', icon: Award },
    { href: user ? `/user/${user.id}` : '/login', label: 'Profile', icon: User },
  ]

  const adminItems = [
    { href: '/admin', label: 'Admin', icon: Wrench },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Load privacy status
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
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-nav-active text-nav-foreground border border-border"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Lexee
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.href.includes('/user/') ? pathname?.startsWith('/user/') : pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-nav-active text-nav-foreground' 
                        : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                      }
                      ${item.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    `}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Admin Link - Only show for authenticated users */}
              {user && adminItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-nav-active text-nav-foreground' 
                        : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                      }
                    `}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Right side - Theme switch and User menu or Sign in */}
            <div className="flex items-center gap-4">
              {/* Theme switch */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={theme === 'dark' ? 'Turn lights on' : 'Turn lights off'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="rounded-full bg-muted flex items-center justify-center text-muted-foreground w-16 h-16 text-xl shrink-0">
                      <span className="font-semibold">{(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-nav-active text-nav-foreground rounded-lg border border-border py-1">
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground"
                      >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        {theme === 'dark' ? 'Lights on' : 'Lights off'}
                      </button>
                      <button
                        onClick={togglePrivacy}
                        disabled={updatingPrivacy}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground disabled:opacity-50"
                      >
                        {isPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                        {isPrivate ? 'Public on' : 'Private on'}
                      </button>
                      <Link
                        href="/settings"
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground disabled:opacity-50"
                      >
                        <LogOut size={16} />
                        {signingOut ? 'Signing Out...' : 'Sign Out'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login?redirect=/"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <LogIn size={18} />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-nav-active text-nav-foreground transition-colors">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.href.includes('/user/') ? pathname?.startsWith('/user/') : pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-nav-active text-nav-foreground' 
                        : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                      }
                      ${item.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Admin Link - Only show for authenticated users */}
              {user && adminItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-nav-active text-nav-foreground' 
                        : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Mobile theme switch and auth */}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    {theme === 'dark' ? 'Lights on' : 'Lights off'}
                  </button>
                  
                  {!user && (
                    <Link
                      href="/login?redirect=/"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LogIn size={18} />
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  )
}
