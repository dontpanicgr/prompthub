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
  Calendar,
  Sun,
  Moon,
  LogOut,
  PanelLeft,
  Settings,
  Compass,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useTheme } from '@/components/theme-provider'

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
  if (typeof window === 'undefined') return false
  
  try {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed === true
    }
  } catch (error) {
    console.warn('Failed to parse sidebar state from localStorage, clearing corrupted data:', error)
    localStorage.removeItem('sidebar-collapsed')
  }
  
  return false
}

export default function Sidebar({ user, onSignOut }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState)
  const [userButtonRect, setUserButtonRect] = useState<DOMRect | null>(null)
  const pathname = usePathname()
  useAuth()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
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
    { href: '/create', label: 'New Prompt', icon: Plus },
    { href: '/', label: 'Browse', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/latest', label: 'Latest', icon: Calendar },
    { href: '/me', label: 'My Prompts', icon: User },
  ]

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
        hidden lg:block fixed inset-y-0 left-0 z-40 bg-background text-foreground border-r border-border
        transform transition-all duration-150 ease-out h-screen overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16 cursor-pointer' : 'w-64'}
      `}
        onClick={() => {
          if (isCollapsed && !isOpen) {
            handleToggleCollapsed()
          }
        }}
      >
        <div className="flex flex-col h-screen">
          {/* Brand - Fixed at top */}
          <div className="flex-shrink-0 p-4 border-b border-border flex items-center justify-between">
            <Link 
              href="/" 
              className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-3'} group relative`}
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
                <span className={`text-white font-bold text-sm ${isCollapsed ? 'opacity-100 group-hover:opacity-0 transition-opacity' : ''}`}>Lx</span>
                {isCollapsed && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PanelRightClose size={16} className="text-white" />
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
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
                <PanelLeftClose size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Navigation - Flexible content */}
          <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3`}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-3 px-3'} h-10 rounded-lg text-sm font-medium transition-colors group relative
                    ${isActive
                      ? 'bg-nav-active text-nav-foreground'
                      : isCollapsed 
                        ? 'text-muted-foreground hover:bg-nav-active hover:text-nav-foreground'
                        : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
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
                    <span className="truncate">{item.label}</span>
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
          <div className="flex-shrink-0 p-3 border-t border-border">
            <div className="space-y-2">
              {/* Theme Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTheme()
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} h-10 text-sm font-medium text-muted-foreground ${isCollapsed ? 'hover:bg-nav-active hover:text-nav-foreground' : 'hover:bg-nav-hover hover:text-nav-foreground'} rounded-lg transition-colors group relative`}
                title={isCollapsed ? (theme === 'dark' ? 'Turn lights on' : 'Turn lights off') : undefined}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {!isCollapsed && (
                  <span>{theme === 'dark' ? 'Lights on' : 'Lights off'}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 dark:bg-gray-700">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </div>
                )}
              </button>

              {/* User Button or Sign In */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const rect = e.currentTarget.getBoundingClientRect()
                      setUserButtonRect(rect)
                      setIsUserMenuOpen(!isUserMenuOpen)
                    }}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2 px-3'} h-10 text-sm font-medium text-muted-foreground ${isCollapsed ? 'hover:bg-nav-active hover:text-nav-foreground' : 'hover:bg-nav-hover hover:text-nav-foreground'} rounded-lg transition-colors group relative`}
                    title={isCollapsed ? 'User menu' : undefined}
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name} 
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User size={14} className="text-gray-500" />
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className="truncate">{user.name}</span>
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
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSignIn()
                  }}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-2 px-3'} h-10 text-sm font-medium text-muted-foreground ${isCollapsed ? 'hover:bg-nav-active hover:text-nav-foreground' : 'hover:bg-nav-hover hover:text-nav-foreground'} rounded-lg transition-colors group relative`}
                  title={isCollapsed ? 'Sign in' : undefined}
                >
                  <LogIn size={18} />
                  {!isCollapsed && <span>Sign In</span>}
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
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-nav-hover"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </>
  )
}
