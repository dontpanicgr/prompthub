'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  Heart, 
  Bookmark, 
  User, 
  Calendar, 
  Copy, 
  Share2, 
  ExternalLink,
  ArrowLeft,
  Edit,
  Trash2,
  EyeOff,
  MoreHorizontal,
  Flag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModelBadge } from '@/components/ui/model-badge'
import { PrivateBadge } from '@/components/ui/private-badge'
import UserBioCard from '@/components/ui/user-bio-card'
import { useAuth } from '@/components/auth-provider'
import { toggleLike, toggleBookmark, deletePrompt, getCommentCountForPrompt, getUserEngagementStats } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import Snackbar from '@/components/ui/snackbar'
import CommentList from '@/components/comments/comment-list'
import MarkdownRenderer from '@/components/ui/markdown-renderer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

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
        {/* HEAD Section */}
        <div className="mb-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-card-foreground mb-4">
            {prompt.title}
          </h1>
          
          {/* Model • Private • Date • Username */}
          <div className="flex items-center gap-2 mb-4">
            <ModelBadge 
              model={prompt.model as any} 
              variant="secondary" 
              size="sm"
              className="bg-muted text-muted-foreground"
            />
            {!prompt.is_public && (
              <>
                <PrivateBadge size="sm" />
                <span className="text-muted-foreground">•</span>
              </>
            )}
            <span className="text-sm text-muted-foreground">{formatDateShort(prompt.created_at)}</span>
            <span className="text-muted-foreground">•</span>
            <Link 
              href={`/user/${prompt.creator.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {prompt.creator.name}
            </Link>
            {!prompt.is_public && (
              <>
                <span className="text-muted-foreground">•</span>
                <PrivateBadge size="sm" />
              </>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLike}
              variant="outline"
              size="lg"
              className="h-10 gap-2 border"
            >
              <Heart size={16} className={isLiked ? 'fill-primary text-primary' : ''} />
              {likeCount}
            </Button>
            
            <Button
              onClick={handleBookmark}
              variant="outline"
              size="lg"
              className="h-10 gap-2 border"
            >
              <Bookmark size={16} className={isBookmarked ? 'fill-primary text-primary' : ''} />
              {bookmarkCount}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 border">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 size={16} className="mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag size={16} className="mr-2" />
                  Report
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/prompt/${prompt.id}/edit`}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* MAIN Section */}
        <div className="space-y-6">
          {/* Prompt Content */}
          <div className="bg-card rounded-lg border border-border p-4">
            <MarkdownRenderer 
              content={prompt.body}
              className="text-card-foreground mb-6"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              className="h-10 gap-2"
            >
              <Copy size={16} />
              Copy
            </Button>
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
            {/* Prompt Header - 2 columns on desktop, stacked on mobile */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Column 1: Title and Model Badge */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-card-foreground mb-3">
                    {prompt.title}
                  </h1>
                  <div className="flex items-center gap-2 mb-4 lg:mb-0">
                    <ModelBadge 
                      model={prompt.model as any} 
                      variant="secondary" 
                      size="sm"
                      className="bg-muted text-muted-foreground"
                    />
                    {!prompt.is_public && (
                      <PrivateBadge size="sm" />
                    )}
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className="text-muted-foreground text-sm">
                      {formatDate(prompt.created_at)}
                    </span>
                  </div>
                </div>
                
                {/* Column 2: Like, Bookmark and Menu buttons */}
                <div className="flex items-center gap-2 lg:flex-shrink-0">
                  <Button
                    onClick={handleLike}
                    variant="outline"
                    size="lg"
                    className="h-10 gap-2 border"
                  >
                    <Heart size={16} className={isLiked ? 'fill-primary text-primary' : ''} />
                    {likeCount}
                  </Button>
                  
                  <Button
                    onClick={handleBookmark}
                    variant="outline"
                    size="lg"
                    className="h-10 gap-2 border"
                  >
                    <Bookmark size={16} className={isBookmarked ? 'fill-primary text-primary' : ''} />
                    {bookmarkCount}
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-10 border">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 size={16} className="mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Flag size={16} className="mr-2" />
                        Report
                      </DropdownMenuItem>
                      {isOwner && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/prompt/${prompt.id}/edit`}>
                              <Edit size={16} className="mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="mb-6">
              <div className="bg-card rounded-lg border border-border p-4">
                <MarkdownRenderer 
                  content={prompt.body}
                  className="text-card-foreground mb-4"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="h-10 gap-2"
                >
                  <Copy size={16} />
                  Copy
                </Button>
              </div>
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
