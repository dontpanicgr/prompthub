'use client'

import { useState, useEffect } from 'react'
import PromptCard from './prompt-card'
import { getPublicPrompts, toggleLike, toggleBookmark } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Prompt } from '@/lib/database'

interface PromptGridProps {
  prompts?: Prompt[]
  loading?: boolean
  onLike?: (promptId: string) => void
  onBookmark?: (promptId: string) => void
  maxColumns?: 3 | 4
}

export default function PromptGrid({ 
  prompts: externalPrompts, 
  loading: externalLoading,
  onLike: externalOnLike,
  onBookmark: externalBookmark,
  maxColumns = 4
}: PromptGridProps = {}) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  // Use external props if provided, otherwise fetch data
  const displayPrompts = externalPrompts || prompts
  const displayLoading = externalLoading !== undefined ? externalLoading : isLoading

  useEffect(() => {
    // Only fetch if no external prompts provided
    if (externalPrompts) return

    const fetchPrompts = async () => {
      try {
        const data = await getPublicPrompts(user?.id)
        setPrompts(data)
      } catch (error) {
        console.error('Error fetching prompts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrompts()
  }, [user?.id, externalPrompts])

  // Prefetch detail routes for the first visible prompts to make navigation feel instant
  useEffect(() => {
    const itemsToPrefetch = (externalPrompts || prompts).slice(0, 16)
    itemsToPrefetch.forEach((p) => {
      router.prefetch(`/prompt/${p.id}`)
    })
  }, [router, externalPrompts, prompts])

  const handleLike = async (promptId: string) => {
    if (!user) {
      toast.error('Please sign in to like prompts', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login')
        }
      })
      return
    }

    // Use external handler if provided
    if (externalOnLike) {
      externalOnLike(promptId)
      return
    }

    try {
      const success = await toggleLike(promptId, user.id)
      if (success) {
        // Update local state
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
    if (!user) {
      toast.error('Please sign in to bookmark prompts', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login')
        }
      })
      return
    }

    // Use external handler if provided
    if (externalBookmark) {
      externalBookmark(promptId)
      return
    }

    try {
      const success = await toggleBookmark(promptId, user.id)
      if (success) {
        // Update local state
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

  if (displayLoading) {
    const gridClasses = maxColumns === 3 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    
    return (
      <div className={gridClasses}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card text-card-foreground rounded-lg border border-border p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-6 bg-muted rounded w-16"></div>
              <div className="h-4 bg-muted rounded w-12"></div>
            </div>
            <div className="h-5 bg-muted rounded mb-2"></div>
            <div className="flex items-center gap-1 mb-2">
              <div className="h-3 bg-muted rounded w-20"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-4/5"></div>
              <div className="h-3 bg-muted rounded w-3/5"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 bg-muted rounded w-12"></div>
              <div className="h-8 bg-muted rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (displayPrompts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No prompts found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Be the first to create a prompt for the community!
        </p>
      </div>
    )
  }

  const gridClasses = maxColumns === 3 
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"

  return (
    <div className={gridClasses}>
      {displayPrompts.map((prompt) => (
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
