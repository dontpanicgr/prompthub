'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import UserPromptsGrid from '@/components/prompts/user-prompts-grid'
import PromptList from '@/components/prompts/prompt-list'
import PromptCard from '@/components/prompts/prompt-card'
import SearchFilters from '@/components/ui/search-filters'
import { getUserEngagementStats, getUserPrompts, getLikedPrompts, getBookmarkedPrompts, toggleLike, toggleBookmark, getUserById } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { FloatingMenu } from '@/components/ui/dropdown-menu'
import { MoreVertical, Share2, Link as LinkIcon, Flag, List, Heart, Bookmark, Folder, Plus, Edit, Settings, Eye, EyeOff } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PrivateBadge } from '@/components/ui/private-badge'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import type { Prompt, User as ProfileUser } from '@/lib/database'
import ProjectsManagement from '@/components/projects/projects-management'
import { deferToIdle } from '@/lib/performance-utils'

interface UserPageProps {
  params: Promise<{
    id: string
  }>
}

type TabType = 'created' | 'liked' | 'bookmarked' | 'projects'

const tabs = [
  { key: 'created' as const, label: 'Created', icon: List },
  { key: 'liked' as const, label: 'Liked', icon: Heart },
  { key: 'bookmarked' as const, label: 'Bookmarked', icon: Bookmark },
  { key: 'projects' as const, label: 'Projects', icon: Folder },
]

export default function UserPage({ params }: UserPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: currentUser, loading: authLoading } = useAuth()
  
  const [user, setUser] = useState<any>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('created')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [stats, setStats] = useState({
    prompts_created: 0,
    likes_received: 0,
    bookmarks_received: 0,
    prompts_liked: 0,
    prompts_bookmarked: 0
  })
  const [userLoading, setUserLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [promptsLoading, setPromptsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>(() => {
    if (typeof window === 'undefined') return 'card'
    const pref = (localStorage.getItem('layout-preference') as 'card' | 'table' | null)
    return pref === 'table' ? 'table' : 'card'
  })
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
    website_url: ''
  })
  const [isPrivate, setIsPrivate] = useState(false)
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false)

  // Track last fetch key to avoid duplicate fetches (e.g., React StrictMode in dev)
  const lastFetchKeyRef = useRef<string | null>(null)
  const lastTabRef = useRef<TabType>('created')

  // Get tab from URL search params
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType
    if (tab && ['created', 'liked', 'bookmarked', 'projects'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch user data and determine if it's own profile
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { id } = await params
        
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !userData) {
          notFound()
        }

        setUser(userData)
        setUserLoading(false)
        
        // Check if this is the current user's own profile
        const isOwn = currentUser?.id === id
        setIsOwnProfile(isOwn)
        
        // Initialize edit data and privacy status for own profile
        if (isOwn) {
          setEditData({
            name: userData.name || '',
            bio: userData.bio || '',
            website_url: userData.website_url || ''
          })
          setIsPrivate(!!userData.is_private)
        }

        // Fetch stats separately after user data is loaded
        const userStats = await getUserEngagementStats(id, isOwn)
        
        // For own profile, also fetch liked and bookmarked counts
        let promptsLiked = 0
        let promptsBookmarked = 0
        if (isOwn) {
          const [likedPrompts, bookmarkedPrompts] = await Promise.all([
            getLikedPrompts(id),
            getBookmarkedPrompts(id)
          ])
          promptsLiked = likedPrompts.length
          promptsBookmarked = bookmarkedPrompts.length
        }
        
        setStats({
          prompts_created: userStats.prompts_created,
          likes_received: userStats.likes_received,
          bookmarks_received: userStats.bookmarks_received,
          prompts_liked: promptsLiked,
          prompts_bookmarked: promptsBookmarked
        })
        setStatsLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserLoading(false)
        setStatsLoading(false)
      }
    }

    if (currentUser !== undefined) { // Wait for auth to resolve
    fetchUserData()
    }
  }, [params, currentUser])

  // Fetch prompts based on active tab
  useEffect(() => {
    if (!user || !isOwnProfile) return

    const currentKey = `${user.id}:${activeTab}`
    const isDuplicate = lastFetchKeyRef.current === currentKey
    if (isDuplicate) return
    lastFetchKeyRef.current = currentKey

    const tabChanged = lastTabRef.current !== activeTab
    lastTabRef.current = activeTab

    const fetchPrompts = async () => {
      try {
        // Only show skeleton if first load for this tab or no data yet
        if (tabChanged || prompts.length === 0) {
          setPromptsLoading(true)
        }
        let fetchedPrompts: Prompt[] = []

        switch (activeTab) {
          case 'created':
            fetchedPrompts = await getUserPrompts(user.id, user.id)
            break
          case 'liked':
            fetchedPrompts = await getLikedPrompts(user.id)
            break
          case 'bookmarked':
            fetchedPrompts = await getBookmarkedPrompts(user.id)
            break
          case 'projects':
            // Projects are handled by ProjectsManagement component
            fetchedPrompts = []
            break
        }

        setPrompts(fetchedPrompts)
        setFilteredPrompts(fetchedPrompts)
      } catch (error) {
        console.error('Error fetching prompts:', error)
        setPrompts([])
        setFilteredPrompts([])
      } finally {
        setPromptsLoading(false)
      }
    }

    fetchPrompts()
  }, [user, activeTab, isOwnProfile])

  // Redirect if not authenticated and trying to access own profile
  useEffect(() => {
    if (!currentUser && !authLoading && isOwnProfile) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [currentUser, authLoading, isOwnProfile, router])

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
  }, [])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    router.replace(url.pathname + url.search, { scroll: false })
  }

  const handleLike = async (promptId: string) => {
    if (!currentUser) return
    try {
      const success = await toggleLike(promptId, currentUser.id)
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
    if (!currentUser) return
    try {
      const success = await toggleBookmark(promptId, currentUser.id)
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

  const handleUpdateProfile = async () => {
    if (!user || !isOwnProfile) return

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: editData.name,
          bio: editData.bio,
          website_url: editData.website_url,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Update local user state
      setUser((prev: any) => ({
        ...prev,
        name: editData.name,
        bio: editData.bio,
        website_url: editData.website_url
      }))

      toast.success('Profile updated successfully!')
      setIsEditOpen(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTogglePrivacy = async () => {
    if (!user || !isOwnProfile) return

    try {
      setUpdatingPrivacy(true)
      const newPrivacy = !isPrivate
      setIsPrivate(newPrivacy)
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_private: newPrivacy, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error

      // Update local user state
      setUser((prev: any) => ({
        ...prev,
        is_private: newPrivacy
      }))

      const message = newPrivacy ? 'Profile set to private' : 'Profile set to public'
      toast.success(message)
    } catch (e: any) {
      console.error(e)
      setIsPrivate(prev => !prev) // Revert on error
      toast.error('Failed to update privacy')
    } finally {
      setUpdatingPrivacy(false)
    }
  }

  if (userLoading || (isOwnProfile && authLoading)) {
    return (
      <MainLayout>
        <div className="w-full p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64 mb-6"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="w-full">
        {/* Header: avatar, details, actions (mobile full-width) */}
        <div className="mb-0">
          <div className="-mx-4 lg:mx-0">
            <div className="bg-background lg:bg-transparent">
              <div className="flex items-start justify-between p-4 gap-4">
            {/* Left: Avatar + details */}
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-muted flex items-center justify-center text-muted-foreground w-16 h-16 text-xl shrink-0">
                <span className="font-semibold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1>{user.name}</h1>
                  {isOwnProfile && isPrivate && (
                    <PrivateBadge size="sm" />
                  )}
                </div>
                {/* Stats line under username */}
                <div className="text-sm text-muted-foreground mb-2 flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <List size={14} className="text-muted-foreground" />
                    {statsLoading ? '-' : stats.prompts_created} Prompts
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Heart size={14} className="text-muted-foreground" />
                    {statsLoading ? '-' : stats.likes_received} Liked
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Bookmark size={14} className="text-muted-foreground" />
                    {statsLoading ? '-' : stats.bookmarks_received} Bookmarked
                  </span>
                </div>
                {user.bio && (
                  <p className="text-sm text-muted-foreground mb-2">{user.bio}</p>
                )}
                {user.website_url && (
                  <a href={user.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block">{user.website_url}</a>
                )}
              </div>
            </div>
            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  <Button className="hidden sm:inline-flex gap-0" onClick={() => window.location.href = '/create'}>
                    <Plus size={16} />
                    Add
                  </Button>
                  <FloatingMenu
                    align="end"
                    trigger={
                      <Button variant="outline" size="icon" aria-label="More actions">
                        <MoreVertical />
                      </Button>
                    }
                    items={[
                      { 
                        label: 'Edit', 
                        icon: <Edit />,
                        onClick: () => setIsEditOpen(true)
                      },
                      { 
                        label: isPrivate ? 'Profile is private' : 'Profile is public', 
                        icon: isPrivate ? <EyeOff /> : <Eye />,
                        onClick: handleTogglePrivacy
                      },
                      { 
                        label: 'Settings', 
                        icon: <Settings />,
                        onClick: () => window.location.href = '/settings'
                      },
                      { label: 'separator', separator: true },
                      { label: 'Share', icon: <Share2 /> },
                      { label: 'Copy Link', icon: <LinkIcon /> },
                    ]}
                  />
                </>
              ) : (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        Contact
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Messaging is coming soon</DialogTitle>
                        <DialogDescription>
                          We&apos;re building in-app messaging so you can contact creators directly. Reserve your seat for the beta to get early access.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center text-center gap-4">
                        <img src="/globe.svg" alt="Coming soon" className="w-24 h-24 opacity-80" />
                        <Button className="mt-2">Reserve your seat for beta</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <FloatingMenu
                    align="end"
                    trigger={
                      <Button variant="outline" size="icon" aria-label="More actions">
                        <MoreVertical />
                      </Button>
                    }
                    items={[
                      { label: 'Share', icon: <Share2 /> },
                      { label: 'Copy Link', icon: <LinkIcon /> },
                    ]}
                  />
                </>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - only show for own profile (mobile full-width) */}
        {isOwnProfile && (
          <div className="mb-4">
            <div className="-mx-4 lg:mx-0">
              <div className="ml-4 lg:ml-0">
                <div className="border-b border-border">
                <nav className="flex space-x-8">
                {tabs.map(({ key, label, icon: Icon }) => {
                  const isActive = activeTab === key
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleTabChange(key)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  )
                })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters - only for prompt tabs */}
        {isOwnProfile && activeTab !== 'projects' && (
          <div className="mb-6">
            <SearchFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedModels={selectedModels}
              setSelectedModels={setSelectedModels}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              onSearch={handleSearch}
              placeholder={`Search ${activeTab} prompts...`}
            />
          </div>
        )}

        {/* Content Area */}
        <div>
          {isOwnProfile ? (
            // Own profile with tabs
            <>
              {activeTab === 'projects' ? (
                <ProjectsManagement userId={user.id} />
              ) : (
                <>
                  {promptsLoading ? (
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
                            {activeTab === 'created' && <Plus className="w-16 h-16 mx-auto" />}
                            {activeTab === 'liked' && <Heart className="w-16 h-16 mx-auto" />}
                            {activeTab === 'bookmarked' && <Bookmark className="w-16 h-16 mx-auto" />}
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        {searchQuery || selectedModels.length > 0
                          ? 'No prompts found'
                          : `No ${activeTab} prompts yet`}
                      </h3>
                      <p className="text-gray-400">
                        {searchQuery || selectedModels.length > 0
                          ? 'Try adjusting your search or filter criteria.'
                          : activeTab === 'created'
                            ? "You haven't created any prompts yet."
                            : activeTab === 'liked'
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
            </>
          ) : (
            // Other user's profile - only show created prompts
            <>
        <div className="mb-6">
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            onSearch={handleSearch}
            placeholder="Search user's prompts..."
          />
        </div>
        <div>
          {layoutPref === 'table' ? (
            <PromptList />
          ) : (
            <UserPromptsGrid 
              userId={user.id} 
              maxColumns={4} 
              searchQuery={searchQuery}
              selectedModels={selectedModels}
              user={{
                id: user.id,
                name: user.name,
                is_private: user.is_private
              }}
            />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Configure profile details and visibility
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your name"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-bio" className="text-sm font-medium">Bio</label>
              <Textarea
                id="edit-bio"
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                rows={3}
                maxLength={360}
                className={editData.bio.length > 320 ? 'border-yellow-500 focus-visible:border-yellow-500' : ''}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className={editData.bio.length > 320 ? 'text-yellow-600 dark:text-yellow-400' : ''}>
                  {editData.bio.length > 300 ? 'Approaching character limit' : ''}
                </span>
                <span className={editData.bio.length > 320 ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''}>
                  {editData.bio.length}/360
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-website" className="text-sm font-medium">Website</label>
              <Input
                id="edit-website"
                value={editData.website_url}
                onChange={(e) => setEditData(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://yourwebsite.com"
              />
            </div>
            {/* Visibility Section */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Visibility</h3>
                <p className="text-xs text-muted-foreground">Configure profile visibility public or private</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePrivacy}
                    disabled={updatingPrivacy}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      !isPrivate
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    } ${updatingPrivacy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Eye size={14} />
                    Public
                  </button>
                </div>
              </div>
              
              {/* Visibility Options */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Eye size={16} className="text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <span className="font-medium">Public:</span> Your profile is visible; your public prompts are visible to all.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">😮</span>
                  <div className="text-sm">
                    <span className="font-medium">Private:</span> Your profile is visible; your prompts are hidden.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <div className="text-sm">
                    You can also make individual prompts private and keep your profile public.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} disabled={isUpdating || !editData.name.trim()}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}