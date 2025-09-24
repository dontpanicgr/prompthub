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
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { FloatingMenu, FloatingMenuItem } from '@/components/ui/dropdown-menu'
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load persisted state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      return saved ? JSON.parse(saved) : false
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

  // Persist sidebar state
  const handleToggleCollapsed = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed))
    }
  }

  const handleSignIn = async () => {
    await signIn()
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-all duration-200 ease-out h-screen overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}>
        <div className="flex flex-col h-screen">
          {/* Brand - Fixed at top */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-3 group relative"
              onClick={() => isCollapsed && setIsCollapsed(false)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  PromptHub
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  PromptHub
                </div>
              )}
            </Link>
            {!isCollapsed && (
              <button
                onClick={handleToggleCollapsed}
                className="hidden lg:block p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Collapse sidebar"
              >
                <Menu size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Navigation - Flexible content */}
          <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-1 overflow-y-auto overflow-x-hidden`}>
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
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[100] border border-gray-700 dark:border-gray-600">
                      {item.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section - Fixed at bottom */}
          <div className={`flex-shrink-0 ${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200 dark:border-gray-700`}>
            {user ? (
              <FloatingMenu
                trigger={
                  <button
                    className={`flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-3'} w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative`}
                    title={isCollapsed ? user.name : undefined}
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
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-[100] border border-gray-700 dark:border-gray-600">
                        {user.name}
                      </div>
                    )}
                  </button>
                }
                items={[
                  {
                    label: 'Profile',
                    icon: <User size={16} />,
                    href: '/me'
                  },
                  {
                    label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
                    icon: theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />,
                    onClick: toggleTheme,
                    shortcut: '⌘⇧L'
                  },
                  {
                    label: 'Settings',
                    icon: <Settings size={16} />,
                    href: '/settings',
                    shortcut: '⌘,'
                  },
                  {
                    label: 'separator',
                    separator: true
                  },
                  {
                    label: 'Sign Out',
                    icon: <LogOut size={16} />,
                    onClick: onSignOut,
                    variant: 'destructive',
                    shortcut: '⌘⇧Q'
                  }
                ]}
                align="start"
                side={isCollapsed ? 'right' : 'top'}
                className="w-48"
              />
            ) : (
              <button
                onClick={handleSignIn}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg group relative`}
                title={isCollapsed ? 'Sign In' : undefined}
              >
                <LogIn size={20} className="flex-shrink-0" />
                {!isCollapsed && 'Sign In'}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Sign In
                  </div>
                )}
              </button>
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
