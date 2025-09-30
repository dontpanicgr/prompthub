'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Bookmark, Copy } from 'lucide-react'

interface Prompt {
  id: string
  title: string
  body: string
  model: string
  creator: {
    id: string
    name: string
    avatar_url?: string
  }
  created_at: string
  like_count: number
  bookmark_count: number
  is_liked?: boolean
  is_bookmarked?: boolean
  is_public?: boolean
}

interface PromptCardProps {
  prompt: Prompt
  onLike: (promptId: string) => void
  onBookmark: (promptId: string) => void
}

export default function PromptCard({ prompt, onLike, onBookmark }: PromptCardProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(prompt.is_liked || false)
  const [isBookmarked, setIsBookmarked] = useState(prompt.is_bookmarked || false)
  const [likeCount, setLikeCount] = useState(prompt.like_count)
  const [bookmarkCount, setBookmarkCount] = useState(prompt.bookmark_count)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    onLike(prompt.id)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
    setBookmarkCount(prev => isBookmarked ? prev - 1 : prev + 1)
    onBookmark(prompt.id)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(prompt.body)
    // TODO: Show toast notification
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Link href={`/prompt/${prompt.id}`} className="group">
      <div className="bg-card rounded-lg border border-border p-4 hover:border-foreground transition-all duration-200 cursor-pointer card-height flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium border border-border flex items-center gap-1">
              {prompt.model === 'ChatGPT' && (
                <svg width="12" height="12" viewBox="0 0 512 509.639" className="text-white">
                  <path fill="currentColor" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.613-115.613 115.613H115.612C52.026 509.64 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z" />
                </svg>
              )}
              {prompt.model === 'Perplexity' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 0h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4H4c-2.21 0-4-1.79-4-4V4c0-2.21 1.79-4 4-4z" />
                </svg>
              )}
              {prompt.model}
            </span>
            {prompt.is_public === false && (
              <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-sm text-xs font-medium border border-destructive/30">
                Private
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary rounded-sm"
            title="Copy prompt"
          >
            <Copy size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-md font-semibold text-card-foreground mb-1 line-clamp-2 leading-tight">
          {prompt.title}
        </h3>

        {/* Meta Information */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-muted-foreground">{formatDate(prompt.created_at)}</span>
          <span className="text-muted-foreground">•</span>
          <button
            className="text-xs font-medium text-muted-foreground truncate hover:bg-secondary hover:text-muted-foreground transition-all duration-200 cursor-pointer rounded-md px-1 py-0.5"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (prompt.creator?.id) {
                router.push(`/user/${prompt.creator.id}`)
              }
            }}
          >
            @{prompt.creator.name}
          </button>
        </div>

        {/* Content Preview */}
        <p className="text-sm text-muted-foreground mb-2 line-clamp-5 flex-1" style={{ lineHeight: 'var(--text-sm--line-height)' }}>
          {prompt.body}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-start gap-3 mt-auto">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm transition-all duration-200 text-card-foreground font-semibold rounded-md px-1 py-0.5 hover:bg-secondary hover:text-muted-foreground ${
              isLiked ? 'text-primary' : ''
            }`}
          >
            <Heart size={16} className={`${isLiked ? 'fill-primary text-primary' : ''}`} />
            {likeCount}
          </button>
          
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1 text-sm transition-all duration-200 text-card-foreground font-semibold rounded-md px-1 py-0.5 hover:bg-secondary hover:text-muted-foreground ${
              isBookmarked ? 'text-primary' : ''
            }`}
          >
            <Bookmark size={16} className={`${isBookmarked ? 'fill-current' : ''}`} />
            {bookmarkCount}
          </button>
        </div>
      </div>
    </Link>
  )
}
