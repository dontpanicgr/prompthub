'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { List, Heart, Bookmark, Folder } from 'lucide-react'
import { createProject } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function SecondaryNavMe() {
  const pathname = usePathname()
  const { user } = useAuth()

  const [counts, setCounts] = useState({ created: 0, liked: 0, bookmarked: 0 })
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [visibleCount, setVisibleCount] = useState(10)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      try {
        // Fetch counts via lightweight count queries (no heavy data)
        const [createdCountRes, likedCountRes, bookmarkedCountRes] = await Promise.all([
          supabase.from('prompts').select('id', { count: 'exact', head: true }).eq('creator_id', user.id),
          supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
        ])

        setCounts({
          created: createdCountRes.count || 0,
          liked: likedCountRes.count || 0,
          bookmarked: bookmarkedCountRes.count || 0,
        })

        // Fetch first 10 projects only, minimal fields
        const { data: proj, error } = await supabase
          .from('projects')
          .select('id,name,sort_order')
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true })
          .range(0, 9)

        if (!error && proj) {
          setProjects(proj as any)
        } else {
          setProjects([])
        }
      } catch (e) {
        console.error('Failed loading sidebar data', e)
      } finally {
        setLoadingProjects(false)
      }
    }
    // Defer to idle to avoid blocking first paint
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      ;(window as any).requestIdleCallback(load)
    } else {
      setTimeout(load, 0)
    }
  }, [user?.id])

  const createNewProject = async () => {
    if (!user?.id) return
    if (!newProjectName.trim()) {
      toast.error('Project name is required')
      return
    }
    try {
      const project = await createProject({ name: newProjectName.trim(), user_id: user.id })
      if (project) {
        setProjects(prev => [project, ...prev])
        setNewProjectName('')
        setIsCreateOpen(false)
        toast.success('Project created')
      } else {
        toast.error('Failed to create project')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to create project')
    }
  }

  const items = [
    { key: 'created', label: 'Created', href: '/me/created', icon: List },
    { key: 'liked', label: 'Liked', href: '/me/liked', icon: Heart },
    { key: 'bookmarked', label: 'Bookmarked', href: '/me/bookmarked', icon: Bookmark },
  ] as const

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border p-4 h-full">
      {/* Prompts header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prompts</span>
        <Button asChild variant="outline" size="sm" className="h-7 px-2 py-1 text-xs">
          <Link href="/create">+ New</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-1 mb-4">
        {items.map(({ key, label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link key={key} href={href} className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-nav-active text-nav-foreground' : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'}`}>
              <span className="flex items-center gap-2">
                <Icon size={20} />
                {label}
              </span>
              <span className="text-xs opacity-80">{(counts as any)[key] ?? 0}</span>
            </Link>
          )
        })}
      </div>

      {/* Projects header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Projects</span>
        <Button variant="outline" size="sm" className="h-7 px-2 py-1 text-xs" onClick={() => setIsCreateOpen(true)}>+ New</Button>
      </div>

      <div className="flex flex-col gap-1">
        {loadingProjects ? (
          <div className="text-xs text-muted-foreground px-3 py-2">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="text-xs text-muted-foreground px-3 py-2">No projects yet</div>
        ) : (
          <>
            {projects.slice(0, visibleCount).map((p) => (
              <Link key={p.id} href={`/me/project/${p.id}`} className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === `/me/project/${p.id}` ? 'bg-nav-active text-nav-foreground' : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'}`}>
                <span className="flex items-center gap-2">
                  <Folder size={20} />
                  {p.name}
                </span>
                <span className="text-xs opacity-80">{(p as any).prompt_count ?? 0}</span>
              </Link>
            ))}
              {projects.length > visibleCount && (
              <button className="text-xs text-muted-foreground px-3 py-2 text-left hover:text-nav-foreground" onClick={() => setVisibleCount(c => c + 10)}>··· More</button>
            )}
          </>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} maxLength={50} />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-nav-hover" onClick={() => setIsCreateOpen(false)}>Cancel</button>
              <button className="px-3 py-2 rounded-md text-sm bg-nav-active text-nav-foreground" onClick={createNewProject}>Create</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


