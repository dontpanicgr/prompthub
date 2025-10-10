'use client'

import { useEffect, useState } from 'react'
import PromptCard from './prompt-card'
import { getPublicPrompts, toggleLike, toggleBookmark } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Prompt } from '@/lib/database'

interface PromptListProps {
  prompts?: Prompt[]
  loading?: boolean
  onLike?: (promptId: string) => void
  onBookmark?: (promptId: string) => void
  showProjectActions?: boolean
  onRemoveFromProject?: (promptId: string) => void
}

export default function PromptList({ prompts: externalPrompts, loading: externalLoading, onLike: externalOnLike, onBookmark: externalOnBookmark, showProjectActions = false, onRemoveFromProject }: PromptListProps = {}) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  const displayPrompts = externalPrompts || prompts
  const displayLoading = externalLoading !== undefined ? externalLoading : isLoading

  useEffect(() => {
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
    const itemsToPrefetch = (externalPrompts || prompts).slice(0, 20)
    itemsToPrefetch.forEach((p) => {
      router.prefetch(`/prompt/${p.id}`)
    })
  }, [router, externalPrompts, prompts])

  const ensureAuthed = (action: string) => {
    if (!user) {
      toast.error(`Please sign in to ${action} prompts`, {
        action: { label: 'Sign In', onClick: () => router.push('/login') }
      })
      return false
    }
    return true
  }

  const handleLike = async (promptId: string) => {
    if (externalOnLike) {
      externalOnLike(promptId)
      return
    }
    if (!ensureAuthed('like')) return
    try {
      const success = await toggleLike(promptId, user!.id)
      if (success) {
        setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? (p.like_count || 0) - 1 : (p.like_count || 0) + 1 } : p))
      }
    } catch (e) {
      console.error('Error toggling like:', e)
    }
  }

  const handleBookmark = async (promptId: string) => {
    if (externalOnBookmark) {
      externalOnBookmark(promptId)
      return
    }
    if (!ensureAuthed('bookmark')) return
    try {
      const success = await toggleBookmark(promptId, user!.id)
      if (success) {
        setPrompts(prev => prev.map(p => p.id === promptId ? { ...p, is_bookmarked: !p.is_bookmarked, bookmark_count: p.is_bookmarked ? (p.bookmark_count || 0) - 1 : (p.bookmark_count || 0) + 1 } : p))
      }
    } catch (e) {
      console.error('Error toggling bookmark:', e)
    }
  }

  if (displayLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse" />
        ))}
      </div>
    )
  }

  if (displayPrompts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No prompts found</h3>
        <p className="text-muted-foreground">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {displayPrompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onLike={handleLike}
          onBookmark={handleBookmark}
          variant="row"
          showProjectActions={showProjectActions}
          onRemoveFromProject={onRemoveFromProject}
        />
      ))}
    </div>
  )
}


