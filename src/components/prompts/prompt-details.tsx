"use client"

import Link from 'next/link'
import { ModelBadge } from '@/components/ui/model-badge'
import { CategoryBadge } from '@/components/ui/category-badge'
import { PrivateBadge } from '@/components/ui/private-badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Copy } from 'lucide-react'
import PromptMenu from '@/components/ui/prompt-menu'
import { useAuth } from '@/components/auth-provider'
import { toggleLike, toggleBookmark, deletePrompt } from '@/lib/database'
import dynamic from 'next/dynamic'

const MarkdownRenderer = dynamic(() => import('@/components/ui/markdown-renderer'), {
  ssr: false,
  // Avoid a second loading state; the page-level loader already handles initial load
  loading: () => null
})

interface Prompt {
  id: string
  title: string
  body: string
  model: string
  creator_id: string
  is_public: boolean
  creator: {
    id: string
    name: string
    avatar_url?: string
    bio?: string
    website_url?: string
  }
  created_at: string
  updated_at: string
  like_count: number
  bookmark_count: number
  is_liked?: boolean
  is_bookmarked?: boolean
  categories?: { id: string, slug: string, name: string }[]
}

interface PromptDetailsProps {
  prompt: Prompt
}

export default function PromptDetails({ prompt }: PromptDetailsProps) {
  const router = useRouter()
  const { user } = useAuth()

  const [isLiked, setIsLiked] = useState(Boolean(prompt.is_liked))
  const [isBookmarked, setIsBookmarked] = useState(Boolean(prompt.is_bookmarked))
  const [likeCount, setLikeCount] = useState(prompt.like_count || 0)
  const [bookmarkCount, setBookmarkCount] = useState(prompt.bookmark_count || 0)
  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOwner = user && prompt.creator_id === user.id

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.body)
      toast.success('Prompt copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy prompt')
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like prompts')
      return
    }
    const newLiked = !isLiked
    setIsLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
    try {
      await toggleLike(prompt.id, user.id)
      if (newLiked) toast.success('Prompt liked!')
    } catch (e) {
      setIsLiked(!newLiked)
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1)
      toast.error('Failed to update like')
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark prompts')
      return
    }
    const newBookmarked = !isBookmarked
    setIsBookmarked(newBookmarked)
    setBookmarkCount(prev => newBookmarked ? prev + 1 : prev - 1)
    try {
      await toggleBookmark(prompt.id, user.id)
      if (newBookmarked) toast.success('Prompt bookmarked!')
    } catch (e) {
      setIsBookmarked(!newBookmarked)
      setBookmarkCount(prev => newBookmarked ? prev - 1 : prev + 1)
      toast.error('Failed to update bookmark')
    }
  }

  const handleDelete = async () => {
    if (!user || prompt.creator_id !== user.id) return
    if (!window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) return
    try {
      const success = await deletePrompt(prompt.id)
      if (success) router.push('/me')
    } catch (e) {
      toast.error('Failed to delete prompt')
    }
  }

  return (
    <div className="w-full">
      <div className="mb-3 text-sm text-muted-foreground flex flex-wrap items-center gap-2">
        {Array.isArray(prompt.categories) && prompt.categories.length > 0 && (
          <div className="flex items-center gap-1">
            {prompt.categories.map(cat => (
              <CategoryBadge
                key={cat.id}
                category={cat}
                size="sm"
                variant="outline"
                href={"/?category=" + encodeURIComponent(cat.slug)}
                className="border text-foreground bg-card dark:bg-secondary dark:border-secondary dark:text-secondary-foreground cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </div>
        )}
        <Link href={"/?model=" + encodeURIComponent(prompt.model)} className="hover:opacity-80 transition-opacity">
          <ModelBadge 
            model={prompt.model as any}
            variant="outline"
            size="sm"
            className="border text-foreground bg-card dark:bg-secondary dark:border-secondary dark:text-secondary-foreground cursor-pointer"
          />
        </Link>
        {!prompt.is_public && (
          <>
            <PrivateBadge size="sm" />
            <span>·</span>
          </>
        )}
        <span>{formatDateShort(prompt.created_at)}</span>
        <span>·</span>
        <Link href={"/user/" + prompt.creator.id} className="hover:text-foreground transition-colors">
          {"Created by @" + prompt.creator.name}
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-3">{prompt.title}</h1>

      <div className="flex items-center gap-2 mb-4">
        <Button onClick={handleCopy} variant="outline" size="sm" className="h-9 gap-2 border px-4">
          <Copy size={16} />
          Copy
        </Button>

        <Button onClick={handleLike} variant="outline" size="sm" className="h-9 gap-2 border px-4">
          <Heart size={16} className={isLiked ? 'fill-primary text-primary' : ''} />
          {likeCount}
        </Button>

        <Button onClick={handleBookmark} variant="outline" size="sm" className="h-9 gap-2 border px-4">
          <Bookmark size={16} className={isBookmarked ? 'fill-primary text-primary' : ''} />
          {bookmarkCount}
        </Button>

        <PromptMenu
          promptId={prompt.id}
          promptBody={prompt.body}
          isOwner={!!isOwner}
          onCopy={handleCopy}
          onShare={handleShare}
          onDelete={handleDelete}
          triggerClassName="w-9 h-9 inline-flex items-center justify-center rounded-md bg-card"
        />
      </div>
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <MarkdownRenderer content={prompt.body} className="text-card-foreground" />
      </div>

      <div className="mt-6">
        {/* Client-only comments */}
        {typeof window !== 'undefined' && (
          // Dynamically import to keep this client-only
          (() => {
            const DynamicCommentList = dynamic(() => import('@/components/comments/comment-list'), { ssr: false })
            return <DynamicCommentList promptId={prompt.id} currentUserId={user?.id} />
          })()
        )}
      </div>
    </div>
  )
}
