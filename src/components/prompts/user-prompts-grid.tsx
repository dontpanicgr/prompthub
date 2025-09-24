'use client'

import { useEffect, useState } from 'react'
import PromptCard from './prompt-card'
import { getPublicPrompts, toggleLike, toggleBookmark } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'

interface UserPromptsGridProps {
  userId: string
}

export default function UserPromptsGrid({ userId }: UserPromptsGridProps) {
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchUserPrompts() {
      try {
        const allPrompts = await getPublicPrompts()
        // Filter prompts by the specific user
        const userPrompts = allPrompts.filter(prompt => prompt.creator_id === userId)
        setPrompts(userPrompts)
      } catch (error) {
        console.error('Error fetching user prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPrompts()
  }, [userId])

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
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No prompts yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          This user hasn&apos;t created any public prompts yet.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {prompts.map((prompt) => (
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
