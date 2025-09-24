'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import PromptCard from '@/components/prompts/prompt-card'
import SearchFilters from '@/components/ui/search-filters'
import { Plus, Heart, Bookmark, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { getUserPrompts, getLikedPrompts, getBookmarkedPrompts, toggleLike, toggleBookmark } from '@/lib/database'

export default function MyPromptsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'created' | 'liked' | 'bookmarked'>('created')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])

  // Temporary type - should be moved to a shared types file
  type Prompt = {
    id: string
    title: string
    content: string
    model: string
    is_public: boolean
    created_at: string
    updated_at: string
    user_id: string
    like_count?: number
    bookmark_count?: number
    likes?: any[]
    bookmarks?: any[]
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModel, setSelectedModel] = useState('All Models')
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
      const matchesModel = selectedModel === 'All Models' || prompt.model === selectedModel
      return matchesSearch && matchesModel
    })
    
    setFilteredPrompts(filtered)
  }, [searchQuery, selectedModel, prompts])

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
  if (!user) {
    // Redirect to login with current page as redirect parameter
    if (typeof window !== 'undefined') {
      router.push(`/login?redirect=${encodeURIComponent('/me')}`)
    }
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

  const handleSearch = (query: string, model: string) => {
    console.log('Search triggered:', { query, model, totalPrompts: prompts.length })
    setSearchQuery(query)
    setSelectedModel(model)
    
    const filtered = prompts.filter(prompt => {
      const matchesSearch = query === '' || 
                           prompt.title.toLowerCase().includes(query.toLowerCase()) ||
                           prompt.body.toLowerCase().includes(query.toLowerCase())
      const matchesModel = model === 'All Models' || prompt.model === model
      return matchesSearch && matchesModel
    })
    
    console.log('Filtered results:', filtered.length)
    setFilteredPrompts(filtered)
  }

  return (
    <MainLayout>
      <div className="w-full p-6">
        {/* User Header */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata.name || 'User'} 
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-300">
                    {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-gray-400 mb-4">
                Manage your created, liked, and bookmarked prompts
              </p>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {userStats.prompts_created}
                  </div>
                  <div className="text-sm text-gray-400">
                    Prompts
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {userStats.prompts_liked}
                  </div>
                  <div className="text-sm text-gray-400">
                    Liked
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {userStats.prompts_bookmarked}
                  </div>
                  <div className="text-sm text-gray-400">
                    Bookmarked
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onSearch={handleSearch}
            placeholder={`Search ${activeTab} prompts...`}
          />
        </div>

        {/* Prompt Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
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
              {searchQuery || selectedModel !== 'All Models' ? (
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
              {searchQuery || selectedModel !== 'All Models' 
                ? 'No prompts found' 
                : `No ${activeTab} prompts yet`
              }
            </h3>
            <p className="text-gray-400">
              {searchQuery || selectedModel !== 'All Models' 
                ? 'Try adjusting your search or filter criteria.'
                : activeTab === 'created' 
                  ? "You haven't created any prompts yet."
                  : activeTab === 'liked' 
                    ? "You haven't liked any prompts yet."
                    : "You haven't bookmarked any prompts yet."
              }
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
    </MainLayout>
  )
}
