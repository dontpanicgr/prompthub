'use client'

import { useEffect, useState } from 'react'
import PromptCard from './prompt-card'
import { getPublicPrompts, toggleLike, toggleBookmark } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'
import { HatGlasses, Search, FileText } from 'lucide-react'

interface UserPromptsGridProps {
  userId: string
  maxColumns?: 3 | 4
  searchQuery?: string
  selectedModels?: string[]
  user?: {
    id: string
    name: string
    is_private?: boolean
  }
}

export default function UserPromptsGrid({ userId, maxColumns = 4, searchQuery = '', selectedModels = [], user: profileUser }: UserPromptsGridProps) {
  const [prompts, setPrompts] = useState<any[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchUserPrompts() {
      try {
        const allPrompts = await getPublicPrompts()
        // Filter prompts by the specific user
        const userPrompts = allPrompts.filter(prompt => prompt.creator_id === userId)
        setPrompts(userPrompts)
        setFilteredPrompts(userPrompts)
      } catch (error) {
        console.error('Error fetching user prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPrompts()
  }, [userId])

  // Filter prompts when search query or models change
  useEffect(() => {
    const filtered = prompts.filter(prompt => {
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesModel = selectedModels.length === 0 || 
        selectedModels.includes(prompt.model)
      
      return matchesSearch && matchesModel
    })
    
    setFilteredPrompts(filtered)
  }, [searchQuery, selectedModels, prompts])

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

  if (loading) {
    const gridClasses = maxColumns === 3 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    
    return (
      <div className={gridClasses}>
        {[...Array(6)].map((_, i) => (
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
    )
  }

  if (filteredPrompts.length === 0) {
    const isPrivateProfile = profileUser?.is_private
    const isSearching = searchQuery || selectedModels.length > 0
    
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          {isSearching ? (
            <Search className="w-16 h-16 mx-auto" />
          ) : isPrivateProfile ? (
            <HatGlasses className="w-16 h-16 mx-auto" />
          ) : (
            <FileText className="w-16 h-16 mx-auto" />
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isSearching ? 'No prompts found' : (isPrivateProfile ? 'Profile is private' : 'No prompts yet')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isSearching 
            ? 'Try adjusting your search or filter criteria.'
            : isPrivateProfile 
              ? "This user's profile is private. Their prompts are not visible to other users."
              : "This user hasn't created any public prompts yet."}
        </p>
      </div>
    )
  }

  const gridClasses = maxColumns === 3 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

  return (
    <div className={gridClasses}>
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
}
