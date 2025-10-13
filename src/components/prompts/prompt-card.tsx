'use client'

import { useState, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Bookmark, X } from 'lucide-react'
import { toast } from 'sonner'
import { ModelBadge } from '@/components/ui/model-badge'
import { PrivateBadge } from '@/components/ui/private-badge'
import { CategoryBadge } from '@/components/ui/category-badge'
import { useAuth } from '@/components/auth-provider'
import PromptMenu from '@/components/ui/prompt-menu'

interface Prompt {
  id: string
  title: string
  body: string
  model: string
  categories?: { id: string, slug: string, name: string }[]
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
  variant?: 'card' | 'row'
  showProjectActions?: boolean
  onRemoveFromProject?: (promptId: string) => void
}

const PromptCard = memo(function PromptCard({ prompt, onLike, onBookmark, variant = 'card', showProjectActions = false, onRemoveFromProject }: PromptCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(prompt.is_liked || false)
  const [isBookmarked, setIsBookmarked] = useState(prompt.is_bookmarked || false)
  const [likeCount, setLikeCount] = useState(prompt.like_count)
  const [bookmarkCount, setBookmarkCount] = useState(prompt.bookmark_count)
  const isOwner = user?.id === prompt.creator.id

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error('Please sign in to like prompts', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login')
        }
      })
      return
    }
    
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1)
    onLike(prompt.id)
    
    // Show toast notification
    if (newLikedState) {
      toast.success('Prompt liked!')
    } else {
      toast.info('Prompt unliked')
    }
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error('Please sign in to bookmark prompts', {
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login')
        }
      })
      return
    }
    
    const newBookmarkedState = !isBookmarked
    setIsBookmarked(newBookmarkedState)
    setBookmarkCount(prev => newBookmarkedState ? prev + 1 : prev - 1)
    onBookmark(prompt.id)
    
    // Show toast notification
    if (newBookmarkedState) {
      toast.success('Prompt bookmarked!')
    } else {
      toast.info('Prompt removed from bookmarks')
    }
  }

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleCopy = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation() }
    navigator.clipboard.writeText(prompt.body).then(() => toast.success('Prompt copied'))
  }

  const handleShare = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation() }
    navigator.clipboard.writeText(`${window.location.origin}/prompt/${prompt.id}`).then(() => toast.success('Link copied'))
  }

  const CardInner = () => (
    <>
      {variant === 'row' ? (
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-card-foreground truncate mb-2">{prompt.title}</h3>
            <div className="flex items-center gap-2 min-w-0">
              {Array.isArray(prompt.categories) && prompt.categories.length > 0 && (
                <CategoryBadge
                  category={prompt.categories[0]}
                  size="sm"
                  variant="outline"
                  onClick={(e?: any) => {
                    if (e?.preventDefault) { e.preventDefault(); e.stopPropagation() }
                    router.push(`/?category=${encodeURIComponent(prompt.categories[0].slug)}`)
                  }}
                  className="border text-foreground bg-card dark:bg-secondary dark:border-secondary dark:text-secondary-foreground cursor-pointer"
                />
              )}
              <div
                className="hover:opacity-80 transition-opacity"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/?model=${encodeURIComponent(prompt.model)}`) }}
                role="button"
                aria-label={`Filter by model ${prompt.model}`}
              >
                <ModelBadge 
                  model={prompt.model as any} 
                  variant="outline" 
                  size="sm"
                  className="border text-foreground bg-card dark:bg-secondary dark:border-secondary dark:text-secondary-foreground cursor-pointer"
                />
              </div>
              {user && prompt.is_public === false && (
                <PrivateBadge size="sm" />
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                <span>{formatDate(prompt.created_at)}</span>
                <span className="text-muted-foreground">·</span>
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
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 self-center">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-md transition-all duration-200 text-card-foreground font-semibold rounded-md px-2 py-1 hover:bg-secondary`}
            >
              <Heart size={16} className={`${isLiked ? 'fill-primary text-primary' : ''}`} />
              {likeCount}
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 text-md transition-all duration-200 text-card-foreground font-semibold rounded-md px-2 py-1 hover:bg-secondary`}
            >
              <Bookmark size={16} className={`${isBookmarked ? 'fill-primary text-primary' : ''}`} />
              {bookmarkCount}
            </button>
            <PromptMenu
              promptId={prompt.id}
              promptBody={prompt.body}
              isOwner={isOwner}
              onCopy={() => handleCopy()}
              onShare={() => handleShare()}
              onDelete={() => router.push(`/prompt/${prompt.id}/edit`)}
            />
            {showProjectActions && onRemoveFromProject && (
              <button
                onClick={() => onRemoveFromProject(prompt.id)}
                className="flex items-center gap-1 text-md transition-all duration-200 text-destructive font-semibold rounded-md px-2 py-1 hover:bg-destructive/10"
                title="Remove from project"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {Array.isArray(prompt.categories) && prompt.categories.length > 0 && (
                <CategoryBadge
                  category={prompt.categories[0]}
                  size="sm"
                  variant="outline"
                  onClick={(e?: any) => {
                    if (e?.preventDefault) { e.preventDefault(); e.stopPropagation() }
                    router.push(`/?category=${encodeURIComponent(prompt.categories[0].slug)}`)
                  }}
                  className="border text-foreground bg-card dark:bg-secondary dark:border-secondary dark:text-secondary-foreground cursor-pointer"
                />
              )}
              <div
                className="hover:opacity-80 transition-opacity"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/?model=${encodeURIComponent(prompt.model)}`) }}
                role="button"
                aria-label={`Filter by model ${prompt.model}`}
              >
                <ModelBadge 
                  model={prompt.model as any} 
                  variant="outline" 
                  size="sm"
                  className="border text-foreground bg-card dark:bg-secondary dark:border-secondary dark:text-secondary-foreground cursor-pointer"
                />
              </div>
              {user && prompt.is_public === false && (
                <PrivateBadge size="sm" />
              )}
            </div>
            {/* No copy button in list/card header */}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-1 line-clamp-2 leading-tight">{prompt.title}</h3>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-muted-foreground">{formatDate(prompt.created_at)}</span>
              <span className="text-muted-foreground">·</span>
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
          </div>
          {/* Truncated content visible only in card variant */}
          <div className="text-sm text-muted-foreground mb-2 line-clamp-5 flex-1 break-words whitespace-pre-wrap">
            {prompt.body}
          </div>
          <div className="flex items-center justify-start gap-1 mt-auto">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-md transition-all duration-200 text-card-foreground font-semibold rounded-md px-2 py-1 hover:bg-secondary`}
            >
              <Heart size={16} className={`${isLiked ? 'fill-primary text-primary' : ''}`} />
              {likeCount}
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 text-md transition-all duration-200 text-card-foreground font-semibold rounded-md px-2 py-1 hover:bg-secondary`}
            >
              <Bookmark size={16} className={`${isBookmarked ? 'fill-primary text-primary' : ''}`} />
              {bookmarkCount}
            </button>
            <PromptMenu
              promptId={prompt.id}
              promptBody={prompt.body}
              isOwner={isOwner}
              onCopy={() => handleCopy()}
              onShare={() => handleShare()}
              onDelete={() => router.push(`/prompt/${prompt.id}/edit`)}
            />
            {showProjectActions && onRemoveFromProject && (
              <button
                onClick={() => onRemoveFromProject(prompt.id)}
                className="flex items-center gap-1 text-md transition-all duration-200 text-destructive font-semibold rounded-md px-2 py-1 hover:bg-destructive/10"
                title="Remove from project"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </>
      )}
    </>
  )

  return (
    <Link prefetch href={`/prompt/${prompt.id}`} className="group">
      <div className={`${variant === 'row' ? 'bg-card rounded-lg border border-border p-4 hover:border-foreground transition-colors duration-200 cursor-pointer w-full' : 'bg-card rounded-lg border border-border p-4 hover:border-foreground transition-colors duration-200 cursor-pointer card-height flex flex-col'}`}>
        <CardInner />
      </div>
    </Link>
  )
})

export default PromptCard
