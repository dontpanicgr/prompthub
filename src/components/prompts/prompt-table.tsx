'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { getPublicPrompts, toggleLike, toggleBookmark } from '@/lib/database'
import type { Prompt } from '@/lib/database'

interface PromptTableProps {
  prompts?: Prompt[]
  loading?: boolean
}

export default function PromptTable({ prompts: externalPrompts, loading: externalLoading }: PromptTableProps = {}) {
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

  // Prefetch detail routes for the first visible prompts
  useEffect(() => {
    const itemsToPrefetch = (externalPrompts || prompts).slice(0, 30)
    itemsToPrefetch.forEach((p) => router.prefetch(`/prompt/${p.id}`))
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
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 px-4 py-3 text-sm font-medium bg-muted/50">
          <div>Title</div>
          <div>Model</div>
          <div>Creator</div>
          <div>Created</div>
          <div>Likes</div>
          <div>Bookmarks</div>
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="grid grid-cols-6 px-4 py-3 text-sm border-t animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          </div>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-6 px-4 py-3 text-sm font-medium bg-muted/50">
        <div>Title</div>
        <div>Model</div>
        <div>Creator</div>
        <div>Created</div>
        <div>Likes</div>
        <div>Bookmarks</div>
      </div>
      {displayPrompts.map((p) => (
        <div key={p.id} className="grid grid-cols-6 px-4 py-3 text-sm border-t items-center hover:bg-muted/40">
          <Link prefetch href={`/prompt/${p.id}`} className="truncate font-medium hover:underline">{p.title}</Link>
          <div className="truncate">{p.model}</div>
          <div className="truncate">{p.creator?.name || 'Unknown'}</div>
          <div className="truncate">{formatDate(p.created_at)}</div>
          <button onClick={() => handleLike(p.id)} className={`justify-self-start text-left ${p.is_liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{p.like_count ?? 0}</button>
          <button onClick={() => handleBookmark(p.id)} className={`justify-self-start text-left ${p.is_bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{p.bookmark_count ?? 0}</button>
        </div>
      ))}
    </div>
  )
}


