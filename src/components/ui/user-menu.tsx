'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  User 
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'

interface UserMenuProps {
  user?: {
    id: string
    name: string
    avatar_url?: string
  } | null
  onSignOut?: () => void
  isCollapsed?: boolean
}

export default function UserMenu({ user, onSignOut, isCollapsed = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full p-2 rounded-lg hover:bg-muted transition-colors group relative`}
        title={isCollapsed ? user.name : undefined}
      >
        <div className="w-8 h-8 rounded-full bg-muted-foreground/30 flex items-center justify-center flex-shrink-0">
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
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
            </p>
          </div>
        )}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {user.name}
          </div>
        )}
      </button>
      
      {/* User Dropdown Menu - Floating above the button */}
      {isOpen && (
        <div className={`absolute ${isCollapsed ? 'bottom-full left-0 right-0 mb-2' : 'bottom-full left-0 right-0 mb-2'} bg-card text-card-foreground rounded-lg shadow-lg border border-border py-1 z-[100]`}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={16} />
            Settings
          </Link>
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted hover:text-red-700 dark:hover:text-red-300"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}

      {/* Click outside to close menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
