"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { 
  Heart, 
  Bookmark,
  Copy,
  Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModelBadge } from '@/components/ui/model-badge'
import { CategoryBadge } from '@/components/ui/category-badge'
import { PrivateBadge } from '@/components/ui/private-badge'
const UserBioCard = dynamic(() => import('@/components/ui/user-bio-card'), {
  ssr: false,
  loading: () => (
    <div className="bg-card rounded-lg border border-border p-6 animate-pulse h-40" />
  )
})
import { useAuth } from '@/components/auth-provider'
import { toggleLike, toggleBookmark, deletePrompt, getCommentCountForPrompt, getUserEngagementStats } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import Snackbar from '@/components/ui/snackbar'
const CommentList = dynamic(() => import('@/components/comments/comment-list'), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <div className="h-6 bg-muted rounded animate-pulse" />
      <div className="h-6 bg-muted rounded animate-pulse" />
      <div className="h-6 bg-muted rounded animate-pulse" />
    </div>
  )
})

const MarkdownRenderer = dynamic(() => import('@/components/ui/markdown-renderer'), {
  ssr: false,
  loading: () => (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="h-6 bg-muted rounded w-1/3 mb-3 animate-pulse" />
      <div className="h-4 bg-muted rounded w-full mb-2 animate-pulse" />
      <div className="h-4 bg-muted rounded w-5/6 mb-2 animate-pulse" />
      <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
    </div>
  )
})
import PromptMenu from '@/components/ui/prompt-menu'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import SuggestionDialog from '@/components/ui/suggestion-dialog'

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
  const [isLiked, setIsLiked] = useState(prompt.is_liked || false)
  const [isBookmarked, setIsBookmarked] = useState(prompt.is_bookmarked || false)
  const [likeCount, setLikeCount] = useState(prompt.like_count || 0)
  const [bookmarkCount, setBookmarkCount] = useState(prompt.bookmark_count || 0)
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '', type: 'success' as 'success' | 'error' | 'info' })
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [creatorStats, setCreatorStats] = useState({
    prompts_created: 0,
    likes_received: 0,
    bookmarks_received: 0
  })
  const [commentCount, setCommentCount] = useState(0)

  // Fetch creator stats and comment count
  useEffect(() => {
    async function fetchCreatorStats() {
      try {
        const stats = await getUserEngagementStats(prompt.creator.id, false) // false = only public prompts
        setCreatorStats(stats)
      } catch (error) {
        console.error('Error fetching creator stats:', error)
      }
    }

    async function fetchCommentCount() {
      try {
        const count = await getCommentCountForPrompt(prompt.id)
        setCommentCount(count)
      } catch (error) {
        console.error('Error fetching comment count:', error)
      }
    }

    fetchCreatorStats()
    fetchCommentCount()
  }, [prompt.creator.id, prompt.id])

  const handleLike = async () => {
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
    
    try {
      await toggleLike(prompt.id, user.id)
      
      // Show toast notification
      if (newLikedState) {
        toast.success('Prompt liked!')
      } else {
        toast.info('Prompt unliked')
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState)
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1)
      console.error('Error toggling like:', error)
      toast.error('Failed to update like status')
    }
  }

  const handleBookmark = async () => {
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
    
    try {
      await toggleBookmark(prompt.id, user.id)
      
      // Show toast notification
      if (newBookmarkedState) {
        toast.success('Prompt bookmarked!')
      } else {
        toast.info('Prompt removed from bookmarks')
      }
    } catch (error) {
      // Revert on error
      setIsBookmarked(!newBookmarkedState)
      setBookmarkCount(prev => newBookmarkedState ? prev - 1 : prev + 1)
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to update bookmark status')
    }
  }

  const handleDelete = async () => {
    if (!user || prompt.creator_id !== user.id) return
    
    setIsDeleting(true)
    try {
      const success = await deletePrompt(prompt.id)
      if (success) {
        router.push('/me')
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.body)
      setSnackbar({ isVisible: true, message: 'Prompt copied to clipboard!', type: 'success' })
    } catch (err) {
      console.error('Failed to copy text: ', err)
      setSnackbar({ isVisible: true, message: 'Failed to copy prompt', type: 'error' })
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setSnackbar({ isVisible: true, message: 'Link copied to clipboard!', type: 'success' })
    } catch (err) {
      console.error('Failed to copy URL: ', err)
      setSnackbar({ isVisible: true, message: 'Failed to copy link', type: 'error' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOwner = user && prompt.creator_id === user.id

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* HEAD Section - Mobile layout */}
        <div className="mb-6">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-card-foreground mb-4 leading-tight">
            {prompt.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            {/* Categories (before model) */}
            {Array.isArray(prompt.categories) && prompt.categories.length > 0 && (
              <div className="flex items-center gap-1">
                {prompt.categories.map(cat => (
                  <CategoryBadge
                    key={cat.id}
                    category={cat}
                    size="sm"
                    variant="outline"
                    href={`/?category=${encodeURIComponent(cat.slug)}`}
                    className="border text-foreground bg-card dark:bg-secondary dark:border-secondary dark:text-secondary-foreground cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            )}
            <Link 
              href={`/?model=${encodeURIComponent(prompt.model)}`}
              className="hover:opacity-80 transition-opacity"
            >
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
            <Link 
              href={`/user/${prompt.creator.id}`}
              className="hover:text-foreground transition-colors"
            >
              {prompt.creator.name}
            </Link>
          </div>
        </div>

        {/* MAIN Section */}
        <div className="space-y-6">
          {/* Prompt Content */}
          <div className="bg-card rounded-lg border border-border p-4">
            <MarkdownRenderer 
              content={prompt.body}
              className="text-card-foreground"
            />
          </div>

          {/* Actions - Moved below prompt content */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLike}
              variant="outline"
              size="lg"
              className="h-10 gap-2 border px-6"
            >
              <Heart size={16} className={isLiked ? 'fill-primary text-primary' : ''} />
              {likeCount}
            </Button>
            
            <Button
              onClick={handleBookmark}
              variant="outline"
              size="lg"
              className="h-10 gap-2 border px-6"
            >
              <Bookmark size={16} className={isBookmarked ? 'fill-primary text-primary' : ''} />
              {bookmarkCount}
            </Button>
            
            <PromptMenu
              promptId={prompt.id}
              promptBody={prompt.body}
              isOwner={!!isOwner}
              onCopy={() => handleCopy()}
              onShare={() => handleShare()}
              onDelete={() => setShowDeleteDialog(true)}
              triggerClassName="w-10 h-10 inline-flex items-center justify-center rounded-md bg-card"
            />
          </div>

          {/* Comments Section */}
          <div>
            <CommentList 
              promptId={prompt.id} 
              currentUserId={user?.id} 
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3">
            {/* Prompt Header */}
            <div className="mb-6">
              {/* Title */}
              <h1 className="text-3xl font-semibold text-card-foreground mb-4 leading-tight">
                {prompt.title}
              </h1>
              
              {/* Meta Information Row */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                {/* Categories (before model) */}
                {Array.isArray(prompt.categories) && prompt.categories.length > 0 && (
                  <div className="flex items-center gap-1">
                    {prompt.categories.map(cat => (
                      <CategoryBadge
                        key={cat.id}
                        category={cat}
                        size="sm"
                        variant="outline"
                        href={`/?category=${encodeURIComponent(cat.slug)}`}
                        className="border text-foreground bg-card dark:bg-secondary dark:border-secondary dark:text-secondary-foreground cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </div>
                )}
                <Link 
                  href={`/?model=${encodeURIComponent(prompt.model)}`}
                  className="hover:opacity-80 transition-opacity"
                >
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
                <span>{formatDate(prompt.created_at)}</span>
                <span>·</span>
                <Link 
                  href={`/user/${prompt.creator.id}`}
                  className="hover:text-foreground transition-colors"
                >
                  {prompt.creator.name}
                </Link>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="mb-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <MarkdownRenderer 
                  content={prompt.body}
                  className="text-card-foreground"
                />
              </div>
            </div>

            {/* Action Buttons Row - Moved below prompt content */}
            <div className="flex items-center gap-2 mb-6">
              <Button
                onClick={handleCopy}
                variant="outline"
                size="lg"
                className="h-10 gap-2 border px-6"
              >
                <Copy size={16} />
                Copy
              </Button>
              
              {isOwner && (
                <SuggestionDialog
                  initialText={prompt.body}
                  onApply={(suggestion) => {
                    // Navigate to edit page with prefilled suggestion
                    const editUrl = `/prompt/${prompt.id}/edit?suggestion=${encodeURIComponent(suggestion)}`
                    window.open(editUrl, '_blank')
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-10 gap-2 border px-6"
                    >
                      <Wand2 size={16} />
                      Improve with AI
                    </Button>
                  }
                />
              )}
              
              <Button
                onClick={handleLike}
                variant="outline"
                size="lg"
                className="h-10 gap-2 border px-6"
              >
                <Heart size={16} className={isLiked ? 'fill-primary text-primary' : ''} />
                {likeCount}
              </Button>
              
              <Button
                onClick={handleBookmark}
                variant="outline"
                size="lg"
                className="h-10 gap-2 border px-6"
              >
                <Bookmark size={16} className={isBookmarked ? 'fill-primary text-primary' : ''} />
                {bookmarkCount}
              </Button>
              
              <PromptMenu
                promptId={prompt.id}
                promptBody={prompt.body}
                isOwner={!!isOwner}
                onCopy={() => handleCopy()}
                onShare={() => handleShare()}
                onDelete={() => setShowDeleteDialog(true)}
              triggerClassName="w-10 h-10 inline-flex items-center justify-center rounded-md bg-card"
              />
            </div>

            {/* Comments Section */}
            <div className="mb-6">
              <CommentList 
                promptId={prompt.id} 
                currentUserId={user?.id} 
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            {/* Creator Profile */}
            <UserBioCard
              user={{
                id: prompt.creator.id,
                name: prompt.creator.name,
                avatar_url: prompt.creator.avatar_url,
                bio: prompt.creator.bio,
                website_url: prompt.creator.website_url
              }}
              stats={creatorStats}
            />

            {/* Stats */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Likes</span>
                  <span className="font-medium text-card-foreground">{likeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bookmarks</span>
                  <span className="font-medium text-card-foreground">{bookmarkCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-medium text-card-foreground">{commentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium text-card-foreground">{formatDate(prompt.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Snackbar */}
      <Snackbar
        message={snackbar.message}
        isVisible={snackbar.isVisible}
        onClose={() => setSnackbar({ ...snackbar, isVisible: false })}
        type={snackbar.type}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Prompt"
        description="Are you sure you want to delete this prompt? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
