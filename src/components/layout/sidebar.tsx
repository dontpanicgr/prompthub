'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Plus,
  Search,
  TrendingUp,
  User,
  LogIn,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  PanelLeft,
  Settings,
  Compass,
  Award,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import Avatar from '@/components/ui/avatar'

interface SidebarProps {
  user?: {
    id: string
    name: string
    avatar_url?: string
  } | null
  onSignOut?: () => void
}

// Helper function to get initial collapsed state from localStorage
const getInitialCollapsedState = (): boolean => {
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
}

export default function Sidebar({ user, onSignOut }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState)
  const [isInitialized, setIsInitialized] = useState(false)
  const [userButtonRect, setUserButtonRect] = useState<DOMRect | null>(null)
  const pathname = usePathname()
  const { user: authUser } = useAuth()
  const [isPrivate, setIsPrivate] = useState<boolean>(false)
  const [updatingPrivacy, setUpdatingPrivacy] = useState<boolean>(false)
  const { theme, setTheme } = useTheme()

  // Initialize the sidebar after hydration
  useEffect(() => {
    setIsInitialized(true)
  }, [])

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
        // Dispatch event for other components and show toast if available
        try {
          window.dispatchEvent(new CustomEvent('privacy-mode-change', { detail: { isPrivate: next } }))
        } catch {}
        try {
          toast.success(next ? 'Private mode enabled' : 'Public mode enabled')
        } catch {}
      }
    } finally {
      setUpdatingPrivacy(false)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleSignIn = () => {
    window.location.href = '/login?redirect=/'
  }

  const handleToggleCollapsed = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(next))
        window.dispatchEvent(new CustomEvent('sidebar-state-change', { detail: { collapsed: next } }))
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error)
      }
    }
  }

  // Listen for external sidebar state changes (e.g., from settings page)
  useEffect(() => {
    const handleExternalSidebarChange = (event: CustomEvent) => {
      setIsCollapsed(event.detail.collapsed)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('sidebar-state-change', handleExternalSidebarChange as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sidebar-state-change', handleExternalSidebarChange as EventListener)
      }
    }
  }, [])

  const navItems = [
    { href: '/add', label: 'Add Prompt', icon: Plus },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/rankings', label: 'Rankings', icon: Award },
    authUser ? { href: `/user/${authUser.id}`, label: 'Profile', icon: User } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; icon: any }>

  return (
    <>
      {/* Mobile menu button - Hidden since we use mobile top header now */}
      {/* <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-nav-active text-nav-foreground border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <PanelLeft size={20} />}
      </button> */}

      {/* Sidebar - collapsible - Hidden on mobile */}
      <aside className={`
        hidden lg:block fixed left-0 z-40 text-foreground
        overflow-hidden m-3 rounded-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16 max-w-16 min-w-16 cursor-pointer' : 'w-64 max-w-64 min-w-64'}
        transition-all duration-300 ease-in-out
      `}
        style={{
          background: 'linear-gradient(45deg, rgb(61 3 3), rgb(27 17 56))',
          backdropFilter: 'blur(12px)',
          height: 'calc(-24px + 100vh)'
        }}
        onClick={(e) => {
          // Only expand if clicking on empty areas (not on interactive elements)
          if (isCollapsed && !isOpen) {
            // Check if the click target is the sidebar itself or a non-interactive element
            const target = e.target as HTMLElement
            const isInteractiveElement = target.closest('a, button, [role="button"], [data-navigation="true"]')
            
            // Allow expansion if clicking on the sidebar container or its direct children (like divs)
            const isSidebarContainer = target === e.currentTarget
            const isSidebarChild = target.closest('aside') === e.currentTarget && !isInteractiveElement
            
            if ((isSidebarContainer || isSidebarChild) && !isInteractiveElement) {
              handleToggleCollapsed()
            }
          }
        }}
      >
        <div className="flex flex-col h-full">
          {/* Brand - Fixed at top */}
          <div className="flex-shrink-0 p-4 flex items-center justify-between transition-colors">
            <Link 
              href="/" 
              data-navigation="true"
              className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-3'} group relative transition-all duration-300 ease-in-out`}
              onClick={(e) => {
                if (isCollapsed) {
                  e.preventDefault()
                  e.stopPropagation()
                  handleToggleCollapsed()
                  return
                }
                setIsOpen(false)
              }}
              aria-label="Go to home"
            >
              <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className={`text-white font-bold text-sm transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-100 group-hover:opacity-0' : ''}`}>Lx</span>
                {isCollapsed && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                    <PanelRightClose size={16} className="text-white" />
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-white transition-all duration-300 ease-in-out">
                  Lexee
                </span>
              )}
            </Link>
            {!isCollapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleCollapsed()
                }}
                className="hidden lg:block p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={16} className="text-white/70" />
              </button>
            )}
          </div>

          {/* Navigation - Flexible content */}
          <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-0 min-h-0`}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href.includes('/user/') 
                ? (pathname === `/user/${authUser?.id}`) 
                : (pathname === item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-navigation="true"
                  className={`
                    flex items-center ${isCollapsed ? 'justify-center px-1 w-10' : 'gap-3 px-3 w-full'} h-10 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out group relative
                    ${isActive
                      ? 'bg-white/15 text-white'
                      : isCollapsed 
                        ? 'text-white/70 hover:bg-white/15 hover:text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate transition-all duration-300 ease-in-out">{item.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 dark:bg-gray-700">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer - Fixed at bottom */}
          <div className="flex-shrink-0 p-3 transition-colors">
            <div className="space-y-2">
              {/* Theme Button */}
              <button
                data-navigation="true"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTheme()
                }}
                className={`${isCollapsed ? 'w-10' : 'w-full'} flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} h-10 text-sm font-medium text-white/70 ${isCollapsed ? 'hover:bg-white/15 hover:text-white' : 'hover:bg-white/10 hover:text-white'} rounded-lg transition-all duration-300 ease-in-out group relative`}
                title={isCollapsed ? (theme === 'dark' ? 'Turn lights on' : 'Turn lights off') : undefined}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {!isCollapsed && (
                  <span className="transition-all duration-300 ease-in-out">{theme === 'dark' ? 'Lights on' : 'Lights off'}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-3">
                    <div className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md border border-black/60 dark:bg-white dark:text-black dark:border-white/60 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[99999]">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </div>
                  </div>
                )}
              </button>


              {/* User Button or Sign In */}
              {user ? (
                <div className="relative">
                  <button
                    data-navigation="true"
                    onClick={(e) => {
                      e.stopPropagation()
                      const rect = e.currentTarget.getBoundingClientRect()
                      setUserButtonRect(rect)
                      setIsUserMenuOpen(!isUserMenuOpen)
                    }}
                    className={`${isCollapsed ? 'w-10' : 'w-full'} flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2 px-1'} h-10 text-sm font-medium text-white/70 ${isCollapsed ? 'hover:bg-white/15 hover:text-white' : 'hover:bg-white/10 hover:text-white'} rounded-lg transition-all duration-300 ease-in-out group relative`}
                    title={isCollapsed ? 'User menu' : undefined}
                  >
                    <div className="rounded-full bg-white/20 flex items-center justify-center text-white w-8 h-8 text-sm shrink-0">
                      <span className="font-semibold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                    {!isCollapsed && (
                      <span className="truncate transition-all duration-300 ease-in-out">{user.name}</span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 dark:bg-gray-700">
                        {user.name}
                      </div>
                    )}
                  </button>

                </div>
              ) : (
                <button
                  data-navigation="true"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSignIn()
                  }}
                  className={`${isCollapsed ? 'w-10' : 'w-full'} flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2 px-3'} h-10 text-sm font-medium text-white/70 ${isCollapsed ? 'hover:bg-white/15 hover:text-white' : 'hover:bg-white/10 hover:text-white'} rounded-lg transition-all duration-300 ease-in-out group relative`}
                  title={isCollapsed ? 'Sign in' : undefined}
                >
                  <LogIn size={18} />
                  {!isCollapsed && <span className="transition-all duration-300 ease-in-out">Sign In</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 dark:bg-gray-700">
                      Sign In
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay - Hidden since we use mobile drawer now */}
      {/* {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )} */}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* Floating User Menu */}
      {isUserMenuOpen && userButtonRect && (
        <div 
            className="fixed w-48 bg-card text-card-foreground rounded-lg  border border-border py-1 z-[100]"
          style={{
            left: `${userButtonRect.left}px`,
            bottom: `${window.innerHeight - userButtonRect.top + 8}px`
          }}
        >
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
            {isPrivate ? 'Profile is private' : 'Profile is public'}
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
            onClick={() => {
              setIsUserMenuOpen(false)
              onSignOut?.()
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </>
  )
}
