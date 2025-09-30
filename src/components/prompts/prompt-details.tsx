'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { toggleLike, toggleBookmark, deletePrompt } from '@/lib/database'
import Snackbar from '@/components/ui/snackbar'

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

  const handleLike = async () => {
    if (!user) {
      // Redirect to sign in
      router.push('/')
      return
    }

    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1)
    
    try {
      await toggleLike(prompt.id, user.id)
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState)
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1)
      console.error('Error toggling like:', error)
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      // Redirect to sign in
      router.push('/')
      return
    }

    const newBookmarkedState = !isBookmarked
    setIsBookmarked(newBookmarkedState)
    setBookmarkCount(prev => newBookmarkedState ? prev + 1 : prev - 1)
    
    try {
      await toggleBookmark(prompt.id, user.id)
    } catch (error) {
      // Revert on error
      setIsBookmarked(!newBookmarkedState)
      setBookmarkCount(prev => newBookmarkedState ? prev - 1 : prev + 1)
      console.error('Error toggling bookmark:', error)
    }
  }

  const handleDelete = async () => {
    if (!user || prompt.creator_id !== user.id) return
    
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return
    }

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

  const isOwner = user && prompt.creator_id === user.id

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          {/* Title and Models */}
          <div className="mb-6">
            <h1 className="mb-2">
              {prompt.title}
            </h1>
            <div className="flex items-center gap-2">
              {!prompt.is_public && (
                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium border border-border flex items-center gap-1">
                  <EyeOff size={14} />
                  Private
                </span>
              )}
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                {prompt.model}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                {prompt.creator.avatar_url ? (
                  <img
                    src={prompt.creator.avatar_url}
                    alt={prompt.creator.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <User size={24} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <Link
                  href={`/user/${prompt.creator.id}`}
                  className="text-lg font-medium text-card-foreground hover:text-primary transition-colors"
                >
                  {prompt.creator.name}
                </Link>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(prompt.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Prompt Body */}
          <div className="mb-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <pre className="whitespace-pre-wrap text-card-foreground font-mono text-sm leading-relaxed">
                {prompt.body}
              </pre>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="order-2 lg:order-1 lg:col-span-1 space-y-6 sticky top-6">
          {/* Actions */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleLike}
                  variant={isLiked ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                </Button>
                <Button
                  onClick={handleBookmark}
                  variant={isBookmarked ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
                  {bookmarkCount} {bookmarkCount === 1 ? 'Bookmark' : 'Bookmarks'}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Copy size={16} />
                  Copy
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                >
                  <Share2 size={16} />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Creator Profile */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">
              About the Creator
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                {prompt.creator.avatar_url ? (
                  <img
                    src={prompt.creator.avatar_url}
                    alt={prompt.creator.name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <User size={32} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <Link
                  href={`/user/${prompt.creator.id}`}
                  className="text-lg font-medium text-card-foreground hover:text-primary transition-colors"
                >
                  {prompt.creator.name}
                </Link>
                {prompt.creator.website_url && (
                  <a
                    href={prompt.creator.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink size={14} />
                    Website
                  </a>
                )}
              </div>
            </div>
            {prompt.creator.bio && (
              <p className="text-muted-foreground text-sm">
                {prompt.creator.bio}
              </p>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-xl font-semibold text-card-foreground mb-4">
                Manage Prompt
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/prompt/${prompt.id}/edit`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-card-foreground hover:bg-secondary hover:text-secondary-foreground rounded-lg transition-colors"
                >
                  <Edit size={18} />
                  Edit Prompt
                </Link>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2"
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Deleting...' : 'Delete Prompt'}
                </Button>
              </div>
            </div>
          )}

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
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-card-foreground">{formatDate(prompt.created_at)}</span>
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
    </div>
  )
}
