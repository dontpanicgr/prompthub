'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Compass, 
  TrendingUp, 
  Clock, 
  Plus 
} from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Browse', icon: Compass },
    { href: '/trending', label: 'Trending', icon: TrendingUp },
    { href: '/latest', label: 'Latest', icon: Clock },
    { href: '/create', label: 'Create', icon: Plus },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-0 flex-1
                ${isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
