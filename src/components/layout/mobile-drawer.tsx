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
  Compass,
  Award
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


  const navItems = [
    { href: '/add', label: 'Add Prompt', icon: Plus },
    { href: '/', label: 'Browse', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/rankings', label: 'Rankings', icon: Award },
    { href: user ? `/user/${user.id}` : '/login', label: 'My Prompts', icon: User, children: user ? [
      { href: `/user/${user.id}?tab=created`, label: 'Created' },
      { href: `/user/${user.id}?tab=liked`, label: 'Liked' },
      { href: `/user/${user.id}?tab=bookmarked`, label: 'Bookmarked' },
      { href: `/user/${user.id}?tab=projects`, label: 'Projects' },
    ] : [] },
  ] as const

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
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-background border-r border-border transform transition-transform duration-300 ease-in-out transition-colors">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border transition-colors">
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
              const isActive = pathname === item.href || (item.children && item.children.some(c => pathname?.startsWith('/user/')))

              if (!item.children) {
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
              }

              // Accordion item for My Prompts
              const expanded = pathname?.startsWith('/user/')
              return (
                <div key={item.href} className="">
                  <Link
                    href={item.href}
                    className={`
                      flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-nav-active text-nav-foreground' 
                        : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                      }
                    `}
                    onClick={onClose}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={20} />
                      {item.label}
                    </span>
                  </Link>
                  {expanded && (
                    <div className="mt-1 ml-9 flex flex-col gap-1">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`px-3 py-2 rounded-md text-sm transition-colors ${childActive ? 'bg-nav-active text-nav-foreground' : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'}`}
                            onClick={onClose}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2 transition-colors">
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
