'use client'

import { useState, useEffect } from 'react'
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
  EyeOff,
  MoreHorizontal,
  Flag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModelBadge } from '@/components/ui/model-badge'
import { PrivateBadge } from '@/components/ui/private-badge'
import UserBioCard from '@/components/ui/user-bio-card'
import { useAuth } from '@/components/auth-provider'
import { toggleLike, toggleBookmark, deletePrompt } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import Snackbar from '@/components/ui/snackbar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const [creatorStats, setCreatorStats] = useState({
    prompts_created: 0,
    prompts_liked: 0,
    prompts_bookmarked: 0
  })

  // Fetch creator stats
  useEffect(() => {
    async function fetchCreatorStats() {
      try {
        // Get creator's public prompts count
        const { data: prompts } = await supabase
          .from('prompts')
          .select('id')
          .eq('creator_id', prompt.creator.id)
          .eq('is_public', true)

        // Get creator's likes count
        const { data: likes } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', prompt.creator.id)

        // Get creator's bookmarks count
        const { data: bookmarks } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', prompt.creator.id)

        setCreatorStats({
          prompts_created: prompts?.length || 0,
          prompts_liked: likes?.length || 0,
          prompts_bookmarked: bookmarks?.length || 0
        })
      } catch (error) {
        console.error('Error fetching creator stats:', error)
      }
    }

    fetchCreatorStats()
  }, [prompt.creator.id])

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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          {/* Prompt Header - 2 columns */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
              {/* Column 1: Title and Model Badge */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-card-foreground mb-3">
                  {prompt.title}
                </h1>
                <div className="flex items-center gap-2">
                  {!prompt.is_public && (
                    <PrivateBadge size="md" />
                  )}
                  <ModelBadge 
                    model={prompt.model as any} 
                    variant="secondary" 
                    size="md"
                    className="bg-muted text-muted-foreground"
                  />
                </div>
              </div>
              
              {/* Column 2: Like, Bookmark and Menu buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleLike}
                  variant={isLiked ? 'default' : 'outline'}
                  className="h-10 gap-2 border"
                >
                  <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                  {likeCount}
                </Button>
                
                <Button
                  onClick={handleBookmark}
                  variant={isBookmarked ? 'default' : 'outline'}
                  className="h-10 gap-2 border"
                >
                  <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
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
                          onClick={handleDelete}
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
            <div className="bg-card rounded-lg border border-border p-6">
              <pre className="whitespace-pre-wrap text-card-foreground font-mono text-sm leading-relaxed mb-4">
                {prompt.body}
              </pre>
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

        </div>

        {/* Sidebar */}
        <div className="order-2 lg:order-1 lg:col-span-1 space-y-6">

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
