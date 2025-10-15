'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { List, Heart, Bookmark, Folder } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'

export default function SecondaryNavMeTabs() {
  const pathname = usePathname()
  const { user } = useAuth()

  const [counts, setCounts] = useState({ created: 0, liked: 0, bookmarked: 0, projects: 0 })

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return

      try {
        const [createdRes, likedRes, bookmarkedRes, projectsRes] = await Promise.all([
          supabase.from('prompts').select('id', { count: 'exact', head: true }).eq('creator_id', user.id),
          supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ])

        setCounts({
          created: createdRes.count || 0,
          liked: likedRes.count || 0,
          bookmarked: bookmarkedRes.count || 0,
          projects: projectsRes.count || 0,
        })
      } catch (e) {
        // fail silently for tabs; keep zeros
      }
    }

    // schedule to avoid blocking
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(load, { timeout: 2000 })
      return () => (window as any).cancelIdleCallback(id)
    } else {
      const timeoutId = setTimeout(load, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [user?.id])

  const items = [
    { key: 'created', label: 'Created', href: '/me/created', icon: List, count: counts.created },
    { key: 'liked', label: 'Liked', href: '/me/liked', icon: Heart, count: counts.liked },
    { key: 'bookmarked', label: 'Bookmarked', href: '/me/bookmarked', icon: Bookmark, count: counts.bookmarked },
    { key: 'projects', label: 'Projects', href: '/me/projects', icon: Folder, count: counts.projects },
  ] as const

  return (
    <nav className="lg:hidden sticky top-16 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-between gap-1">
          {items.map(({ key, label, href, icon: Icon, count }) => {
            const isActive = pathname === href
            return (
              <Link
                key={key}
                href={href}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-none transition-colors ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={18} className="inline-block" />
                <span>{label}</span>
                <span className="text-xs opacity-80">{count}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}


