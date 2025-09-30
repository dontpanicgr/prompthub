'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import PromptCard from '@/components/prompts/prompt-card'
import SearchFilters from '@/components/ui/search-filters'
import { Plus, Heart, Bookmark, User } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { getUserPrompts, getLikedPrompts, getBookmarkedPrompts, toggleLike, toggleBookmark, getUserById } from '@/lib/database'
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
  const [userStats, setUserStats] = useState({
    prompts_created: 0,
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
        
        // Get liked and bookmarked prompts for stats
        const likedPrompts = await getLikedPrompts(user.id)
        const bookmarkedPrompts = await getBookmarkedPrompts(user.id)
        
        const stats = {
          prompts_created: createdPrompts.length,
          prompts_liked: likedPrompts.length,
          prompts_bookmarked: bookmarkedPrompts.length
        }
        
        console.log('User stats:', stats)
        setUserStats(stats)
        
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

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-32 mb-6"></div>
            <div className="h-4 bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      // Redirect to login with current page as redirect parameter
      router.push(`/login?redirect=${encodeURIComponent('/me')}`)
    }
  }, [user, authLoading, router])

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

  const handleSearch = (query: string, models: string[]) => {
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
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
              <div className="flex flex-col items-start">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  {(profile?.avatar_url || user.user_metadata?.avatar_url) ? (
                    <img
                      src={(profile?.avatar_url || user.user_metadata?.avatar_url) as string}
                      alt={profile?.name || user.user_metadata?.name || 'User'}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {(profile?.name?.charAt(0) || user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U') as string}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <h2 className="text-xl font-bold text-card-foreground mb-4 truncate">
                    {profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  </h2>
                  {profile?.bio && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {profile.bio}
                    </p>
                  )}
                  {profile?.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mb-6 block"
                    >
                      {profile.website_url}
                    </a>
                  )}
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Prompts</p>
                      <p className="text-xl font-bold text-card-foreground">{userStats.prompts_created}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Likes</p>
                      <p className="text-xl font-bold text-card-foreground">{userStats.prompts_liked}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Bookmarks</p>
                      <p className="text-xl font-bold text-card-foreground">{userStats.prompts_bookmarked}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="mb-2">My Prompts</h1>
              <p className="text-sm text-muted-foreground">Manage your created, liked, and bookmarked prompts</p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTabChange('created')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'created'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <User size={16} />
                  My Prompts ({userStats.prompts_created})
                </button>
                <button
                  onClick={() => handleTabChange('liked')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'liked'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <Heart size={16} />
                  Liked ({userStats.prompts_liked})
                </button>
                <button
                  onClick={() => handleTabChange('bookmarked')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'bookmarked'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-card text-card-foreground rounded-lg border border-border p-6 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {searchQuery || selectedModels.length > 0 ? (
                    <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
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
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
