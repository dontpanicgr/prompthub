'use client'

import { useState } from 'react'
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
  LogOut
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

export default function Sidebar({ user, onSignOut }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sidebar-collapsed')
        return saved ? JSON.parse(saved) : false
      } catch {
        return false
      }
    }
    return false
  })
  const pathname = usePathname()
  const { signIn } = useAuth()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const handleSignIn = async () => {
    await signIn()
  }

  const handleToggleCollapsed = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(next))
        window.dispatchEvent(new CustomEvent('sidebar-state-change', { detail: { collapsed: next } }))
      } catch {}
    }
  }

  const navItems = [
    { href: '/create', label: 'Create Prompt', icon: Plus },
    { href: '/', label: 'Browse Prompts', icon: Search },
    { href: '/popular', label: 'Popular', icon: TrendingUp },
    { href: '/latest', label: 'Latest', icon: Calendar },
    { href: '/me', label: 'My Prompts', icon: User },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card text-card-foreground shadow-md border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - collapsible */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 bg-background text-foreground border-r border-border
        transform transition-all duration-200 ease-out h-screen overflow-hidden
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
                <span className={`text-white font-bold text-sm ${isCollapsed ? 'opacity-100 group-hover:opacity-0 transition-opacity' : ''}`}>P</span>
                {isCollapsed && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Menu size={16} className="text-white" />
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  PromptHub
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
                <Menu size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Navigation - Flexible content */}
          <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto overflow-x-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-3 px-3'} py-2 rounded-lg text-sm font-medium transition-colors group relative
                    ${isActive
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
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
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 dark:bg-gray-700">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t border-border">
            {user ? (
              <div className="space-y-2">
                <Link
                  href={`/user/${user.id}`}
                  className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User size={16} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                  </div>
                </Link>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                  
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg"
                >
                  <LogIn size={20} className="flex-shrink-0" />
                  Sign In
                </button>
                
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
