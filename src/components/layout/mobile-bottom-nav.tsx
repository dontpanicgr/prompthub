'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/components/auth-provider'
import { 
  Compass, 
  TrendingUp, 
  Plus,
  Award,
  MoreHorizontal,
  Settings as SettingsIcon,
  Moon,
  Sun,
  LogOut
} from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Discover', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/add', label: 'Add', icon: Plus },
    { href: '/rankings', label: 'Rankings', icon: Award },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card backdrop-blur-md border border-border rounded-xl m-3 shadow-md transition-colors">
      <div className="flex items-center justify-around h-16 py-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/' 
            ? (pathname === '/' || pathname === '/discover')
            : pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors min-w-0 flex-1
                ${isActive 
                  ? 'bg-nav-active text-nav-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
        {/* Ellipsis menu trigger */}
        <button
          aria-label="More options"
          className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors min-w-0 flex-1 text-muted-foreground hover:text-foreground"
          onClick={() => setIsSheetOpen(prev => !prev)}
          aria-pressed={isSheetOpen}
        >
          <MoreHorizontal size={20} className="flex-shrink-0" />
          <span className="truncate">More</span>
        </button>
      </div>

      {/* Bottom sheet */}
      {isSheetOpen && (
        <>
          <div className="fixed inset-x-0 bottom-16 z-[61]">
            <div className="mx-2 mb-2 rounded-xl border border-border bg-background">
              <div className="p-2">
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
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark')
                    setIsSheetOpen(false)
                  }}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                {user ? (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base text-red-600 dark:text-red-400 hover:bg-muted/60 transition-colors"
                    onClick={async () => {
                      await signOut()
                      setIsSheetOpen(false)
                      router.push('/')
                    }}
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
