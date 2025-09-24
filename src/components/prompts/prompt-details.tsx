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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {prompt.title}
                </h1>
                <div className="flex items-center gap-2">
                  {!prompt.is_public && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium flex items-center gap-1">
                      <EyeOff size={14} />
                      Private
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {prompt.model}
                  </span>
                </div>
              </div>
              
              {/* Creator Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  {prompt.creator.avatar_url ? (
                    <img 
                      src={prompt.creator.avatar_url} 
                      alt={prompt.creator.name} 
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <User size={24} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <Link 
                    href={`/user/${prompt.creator.id}`}
                    className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {prompt.creator.name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(prompt.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt Body */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Prompt
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed">
                  {prompt.body}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                  {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                </button>
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isBookmarked 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Bookmark size={18} className={isBookmarked ? 'fill-current' : ''} />
                  {bookmarkCount} {bookmarkCount === 1 ? 'Bookmark' : 'Bookmarks'}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Copy size={18} />
                  Copy
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creator Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About the Creator
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                {prompt.creator.avatar_url ? (
                  <img 
                    src={prompt.creator.avatar_url} 
                    alt={prompt.creator.name} 
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <User size={32} className="text-gray-500" />
                )}
              </div>
              <div>
                <Link 
                  href={`/user/${prompt.creator.id}`}
                  className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {prompt.creator.name}
                </Link>
                {prompt.creator.website_url && (
                  <a
                    href={prompt.creator.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <ExternalLink size={14} />
                    Website
                  </a>
                )}
              </div>
            </div>
            {prompt.creator.bio && (
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {prompt.creator.bio}
              </p>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Manage Prompt
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/prompt/${prompt.id}/edit`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                  Edit Prompt
                </Link>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  {isDeleting ? 'Deleting...' : 'Delete Prompt'}
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Likes</span>
                <span className="font-medium text-gray-900 dark:text-white">{likeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bookmarks</span>
                <span className="font-medium text-gray-900 dark:text-white">{bookmarkCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDate(prompt.created_at)}</span>
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
