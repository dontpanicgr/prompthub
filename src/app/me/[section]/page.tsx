'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import PromptCard from '@/components/prompts/prompt-card'
import PromptList from '@/components/prompts/prompt-list'
import SearchFilters from '@/components/ui/search-filters'
import { User, Heart, Bookmark, Folder, Plus } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { getUserPrompts, getLikedPrompts, getBookmarkedPrompts, toggleLike, toggleBookmark, getUserById, getUserEngagementStats } from '@/lib/database'
import type { Prompt, User as ProfileUser, Project } from '@/lib/database'
import { getProjectsByUser, createProject } from '@/lib/database'
import { deferToIdle, debounce } from '@/lib/performance-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import ProjectsManagement from '@/components/projects/projects-management'
import Link from 'next/link'

const sections = [
  { key: 'created', label: 'Created', icon: User, href: '/me/created' },
  { key: 'liked', label: 'Liked', icon: Heart, href: '/me/liked' },
  { key: 'bookmarked', label: 'Bookmarked', icon: Bookmark, href: '/me/bookmarked' },
  { key: 'projects', label: 'Projects', icon: Folder, href: '/me/projects' },
]

export default function MyPromptsSectionPage() {
  const params = useParams<{ section: string }>()
  const sectionParam = (params?.section || 'created') as 'created' | 'liked' | 'bookmarked' | 'projects'
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [activeSection, setActiveSection] = useState<'created' | 'liked' | 'bookmarked' | 'projects'>(sectionParam)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>('card') // Always start with card to prevent blocking
  const [userStats, setUserStats] = useState({
    prompts_created: 0,
    likes_received: 0,
    bookmarks_received: 0,
    prompts_liked: 0,
    prompts_bookmarked: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveSection(sectionParam)
  }, [sectionParam])

  useEffect(() => {
    if (!user) return
    const fetchAll = async () => {
      try {
        setLoading(true)
        const profileData = await getUserById(user.id)
        setProfile(profileData)
        const createdPrompts = await getUserPrompts(user.id, user.id)
        const stats = await getUserEngagementStats(user.id, true)
        const likedPrompts = await getLikedPrompts(user.id)
        const bookmarkedPrompts = await getBookmarkedPrompts(user.id)
        const updatedStats = {
          ...stats,
          prompts_liked: likedPrompts.length,
          prompts_bookmarked: bookmarkedPrompts.length
        }
        setUserStats(updatedStats)
        // initial dataset depends on section
        switch (sectionParam) {
          case 'created':
            setPrompts(createdPrompts)
            setFilteredPrompts(createdPrompts)
            break
          case 'liked':
            setPrompts(likedPrompts)
            setFilteredPrompts(likedPrompts)
            break
          case 'bookmarked':
            setPrompts(bookmarkedPrompts)
            setFilteredPrompts(bookmarkedPrompts)
            break
          case 'projects':
            setPrompts([])
            setFilteredPrompts([])
            break
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [user, sectionParam])

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      router.push(`/login?redirect=${encodeURIComponent('/me/created')}`)
    }
  }, [user, authLoading, router])

  // Restore layout preference after hydration
  useEffect(() => {
    const restoreLayout = () => {
      try {
        const pref = localStorage.getItem('layout-preference') as 'card' | 'table' | null
        if (pref === 'table') {
          setLayoutPref('table')
        }
      } catch (error) {
        console.warn('Failed to restore layout preference:', error)
      }
    }
    
    return deferToIdle(restoreLayout, 500)
  }, [])

  // Listen for layout preference changes
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setLayoutPref(e.detail.layout === 'table' ? 'table' : 'card')
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('layout-preference-change', handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('layout-preference-change', handler as EventListener)
      }
    }
  }, [])

  // Memoize filtered prompts to prevent expensive re-computation on every render
  const memoizedFilteredPrompts = useMemo(() => {
    if (!searchQuery && selectedModels.length === 0 && selectedCategories.length === 0) {
      return prompts // No filtering needed
    }

    return prompts.filter(prompt => {
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesModel = selectedModels.length === 0 || 
        selectedModels.includes(prompt.model)
      
      const matchesCategory = selectedCategories.length === 0 ||
        (prompt.categories && prompt.categories.some(cat => selectedCategories.includes(cat.slug)))
      
      return matchesSearch && matchesModel && matchesCategory
    })
  }, [prompts, searchQuery, selectedModels, selectedCategories])

  // Update filtered prompts when memoized result changes
  useEffect(() => {
    setFilteredPrompts(memoizedFilteredPrompts)
  }, [memoizedFilteredPrompts])

  const handleSearch = useCallback((query: string, models: string[], categories: string[]) => {
    setSearchQuery(query)
    setSelectedModels(models)
    setSelectedCategories(categories)
    // Filtering is now handled by memoized computation above
  }, [])

  const handleLike = async (promptId: string) => {
    if (!user) return
    try {
      const success = await toggleLike(promptId, user.id)
      if (success) {
        setPrompts(prev => prev.map(prompt => 
          prompt.id === promptId 
            ? { 
                ...prompt, 
                is_liked: !prompt.is_liked,
                like_count: prompt.is_liked ? prompt.like_count - 1 : prompt.like_count + 1
              }
            : prompt
        ))
        setFilteredPrompts(prev => prev.map(prompt => 
          prompt.id === promptId 
            ? { 
                ...prompt, 
                is_liked: !prompt.is_liked,
                like_count: prompt.is_liked ? prompt.like_count - 1 : prompt.like_count + 1
              }
            : prompt
        ))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleBookmark = async (promptId: string) => {
    if (!user) return
    try {
      const success = await toggleBookmark(promptId, user.id)
      if (success) {
        setPrompts(prev => prev.map(prompt => 
          prompt.id === promptId 
            ? { 
                ...prompt, 
                is_bookmarked: !prompt.is_bookmarked,
                bookmark_count: prompt.is_bookmarked ? prompt.bookmark_count - 1 : prompt.bookmark_count + 1
              }
            : prompt
        ))
        setFilteredPrompts(prev => prev.map(prompt => 
          prompt.id === promptId 
            ? { 
                ...prompt, 
                is_bookmarked: !prompt.is_bookmarked,
                bookmark_count: prompt.is_bookmarked ? prompt.bookmark_count - 1 : prompt.bookmark_count + 1
              }
            : prompt
        ))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const SecondaryNav = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [loadingProjects, setLoadingProjects] = useState(true)
    const [visibleCount, setVisibleCount] = useState(10)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')

    useEffect(() => {
      const load = async () => {
        if (!user?.id) return
        try {
          setLoadingProjects(true)
          const list = await getProjectsByUser(user.id)
          setProjects(list)
        } catch (e) {
          console.error('Failed to load projects', e)
        } finally {
          setLoadingProjects(false)
        }
      }
      load()
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

    const counts = {
      created: userStats.prompts_created,
      liked: userStats.prompts_liked,
      bookmarked: userStats.prompts_bookmarked,
    }

    return (
      <div className="bg-card text-card-foreground rounded-lg border border-border p-3">
        {/* Prompts header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prompts</span>
          <Link href="/create" className="text-xs px-2 py-1 rounded-md bg-nav-hover text-nav-foreground hover:opacity-90 transition-opacity">+ New</Link>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          {sections.filter(s => s.key !== 'projects').map(({ key, label, icon: Icon, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={key}
                href={href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-nav-active text-nav-foreground' : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'}`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} />
                  {label}
                </span>
                <span className="text-xs opacity-80">{counts[key as 'created' | 'liked' | 'bookmarked'] ?? 0}</span>
              </Link>
            )
          })}
        </div>

        {/* Projects header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Projects</span>
          <button onClick={() => setIsCreateOpen(true)} className="text-xs px-2 py-1 rounded-md bg-nav-hover text-nav-foreground hover:opacity-90 transition-opacity">+ New</button>
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
                    <Folder size={16} />
                    {p.name}
                  </span>
                  {typeof (p as any).prompt_count === 'number' && (
                    <span className="text-xs opacity-80">{(p as any).prompt_count}</span>
                  )}
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

  if (authLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) return null

  return (
    <MainLayout>
      <div className="w-full">
        {/* Desktop: place beside secondary aside; Mobile: keep safe margins */}
        <div className="lg:flex lg:gap-6 px-2">
          {/* Secondary nav moved to global layout; keep only main here */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="mb-2">{activeSection === 'created' ? 'Created prompts' : activeSection === 'liked' ? 'Liked prompts' : activeSection === 'bookmarked' ? 'Bookmarked prompts' : 'Projects'}</h1>
              <p className="text-sm text-muted-foreground">Manage your created, liked, and bookmarked prompts</p>
            </div>

            {/* Search Filters */}
            {activeSection !== 'projects' && (
              <div className="mb-6">
                <SearchFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedModels={selectedModels}
                  setSelectedModels={setSelectedModels}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  onSearch={handleSearch}
                  placeholder={`Search ${activeSection} prompts...`}
                />
              </div>
            )}

            {/* Projects Management */}
            {activeSection === 'projects' && user && (
              <ProjectsManagement userId={user.id} />
            )}

            {/* Prompt Grid */}
            {activeSection !== 'projects' && (
              <>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-card text-card-foreground rounded-lg border border-border p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPrompts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      {searchQuery || selectedModels.length > 0 ? (
                        <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🔍</span>
                        </div>
                      ) : (
                        <>
                          {activeSection === 'created' && <Plus className="w-16 h-16 mx-auto" />}
                          {activeSection === 'liked' && <Heart className="w-16 h-16 mx-auto" />}
                          {activeSection === 'bookmarked' && <Bookmark className="w-16 h-16 mx-auto" />}
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {searchQuery || selectedModels.length > 0
                        ? 'No prompts found'
                        : `No ${activeSection} prompts yet`}
                    </h3>
                    <p className="text-gray-400">
                      {searchQuery || selectedModels.length > 0
                        ? 'Try adjusting your search or filter criteria.'
                        : activeSection === 'created'
                          ? "You haven't created any prompts yet."
                          : activeSection === 'liked'
                            ? "You haven't liked any prompts yet."
                            : "You haven't bookmarked any prompts yet."}
                    </p>
                  </div>
                ) : (
                  layoutPref === 'table' ? (
                    <PromptList prompts={filteredPrompts} loading={false} onLike={handleLike} onBookmark={handleBookmark} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredPrompts.map((prompt) => (
                        <PromptCard
                          key={prompt.id}
                          prompt={prompt}
                          onLike={handleLike}
                          onBookmark={handleBookmark}
                        />
                      ))}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}


