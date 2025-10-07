'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import PromptCard from '@/components/prompts/prompt-card'
import PromptList from '@/components/prompts/prompt-list'
import SearchFilters from '@/components/ui/search-filters'
import UserBioCard from '@/components/ui/user-bio-card'
import { Plus, Heart, Bookmark, User } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { getUserPrompts, getLikedPrompts, getBookmarkedPrompts, toggleLike, toggleBookmark, getUserById, getUserEngagementStats } from '@/lib/database'
import type { Prompt, User as ProfileUser } from '@/lib/database'

export default function MyPromptsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'created' | 'liked' | 'bookmarked'>('created')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [profile, setProfile] = useState<ProfileUser | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>(() => {
    if (typeof window === 'undefined') return 'card'
    const pref = (localStorage.getItem('layout-preference') as 'card' | 'table' | null)
    return pref === 'table' ? 'table' : 'card'
  })
  const [userStats, setUserStats] = useState({
    prompts_created: 0,
    likes_received: 0,
    bookmarks_received: 0,
    prompts_liked: 0,
    prompts_bookmarked: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Me page useEffect - user:', user)
    
    if (!user) {
      console.log('No user, returning early')
      return
    }

    async function fetchUserData() {
      if (!user) return
      
      try {
        console.log('Fetching user data for:', user.id)
        setLoading(true)
        // Load profile details from profiles table
        const profileData = await getUserById(user.id)
        setProfile(profileData)
        
        // Get user's created prompts
        const createdPrompts = await getUserPrompts(user.id, user.id)
        console.log('Created prompts:', createdPrompts)
        
        // Get engagement stats (likes and bookmarks received) - include private prompts for own profile
        const stats = await getUserEngagementStats(user.id, true)
        
        // Get counts of prompts the user has liked and bookmarked
        const likedPrompts = await getLikedPrompts(user.id)
        const bookmarkedPrompts = await getBookmarkedPrompts(user.id)
        
        const updatedStats = {
          ...stats,
          prompts_liked: likedPrompts.length,
          prompts_bookmarked: bookmarkedPrompts.length
        }
        
        console.log('User stats:', updatedStats)
        setUserStats(updatedStats)
        
        // Set initial prompts (created)
        setPrompts(createdPrompts)
        setFilteredPrompts(createdPrompts)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  // Filter prompts when search query or model changes
  useEffect(() => {
    const filtered = prompts.filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesModel = selectedModels.length === 0 || selectedModels.includes(prompt.model)
      return matchesSearch && matchesModel
    })
    
    setFilteredPrompts(filtered)
  }, [searchQuery, selectedModels, prompts])

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      // Redirect to login with current page as redirect parameter
      router.push(`/login?redirect=${encodeURIComponent('/me')}`)
    }
  }, [user, authLoading, router])

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

  // Show loading while auth is loading
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

  if (!user) {
    return null
  }

  const handleTabChange = async (tab: 'created' | 'liked' | 'bookmarked') => {
    if (!user) return
    
    setActiveTab(tab)
    setLoading(true)
    
    try {
      let newPrompts: any[] = []
      
      switch (tab) {
        case 'created':
          // Show ALL prompts created by user (both public and private)
          newPrompts = await getUserPrompts(user.id, user.id)
          break
        case 'liked':
          // Show ALL prompts the user has liked (both public and private)
          newPrompts = await getLikedPrompts(user.id)
          break
        case 'bookmarked':
          // Show ALL prompts the user has bookmarked (both public and private)
          newPrompts = await getBookmarkedPrompts(user.id)
          break
      }
      
      setPrompts(newPrompts)
      setFilteredPrompts(newPrompts)
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

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
        // Also update filtered prompts
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
    } catch (error) {
      console.error('Error toggling like:', error)
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
        // Also update filtered prompts
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
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  const handleSearch = useCallback((query: string, models: string[]) => {
    console.log('Search triggered:', { query, models, totalPrompts: prompts.length })
    setSearchQuery(query)
    setSelectedModels(models)
    
    const filtered = prompts.filter(prompt => {
      const matchesSearch = query === '' || 
                           prompt.title.toLowerCase().includes(query.toLowerCase()) ||
                           prompt.body.toLowerCase().includes(query.toLowerCase())
      const matchesModel = models.length === 0 || models.includes(prompt.model)
      return matchesSearch && matchesModel
    })
    
    console.log('Filtered results:', filtered.length)
    setFilteredPrompts(filtered)
  }, [prompts])

  return (
    <MainLayout>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <UserBioCard
              user={{
                id: user.id,
                name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
                bio: profile?.bio,
                website_url: profile?.website_url
              }}
              stats={userStats}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="mb-2">My Prompts</h1>
              <p className="text-sm text-muted-foreground">Manage your created, liked, and bookmarked prompts</p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTabChange('created')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'created'
                      ? 'bg-nav-active text-nav-foreground'
                      : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                  }`}
                >
                  <User size={16} />
                  My Prompts ({userStats.prompts_created})
                </button>
                <button
                  onClick={() => handleTabChange('liked')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'liked'
                      ? 'bg-nav-active text-nav-foreground'
                      : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                  }`}
                >
                  <Heart size={16} />
                  Liked ({userStats.prompts_liked})
                </button>
                <button
                  onClick={() => handleTabChange('bookmarked')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'bookmarked'
                      ? 'bg-nav-active text-nav-foreground'
                      : 'text-muted-foreground hover:bg-nav-hover hover:text-nav-foreground'
                  }`}
                >
                  <Bookmark size={16} />
                  Bookmarked ({userStats.prompts_bookmarked})
                </button>
              </div>
            </div>

            {/* Search Filters */}
            <div className="mb-6">
              <SearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedModels={selectedModels}
                setSelectedModels={setSelectedModels}
                onSearch={handleSearch}
                placeholder={`Search ${activeTab} prompts...`}
              />
            </div>

            {/* Prompt Grid */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
