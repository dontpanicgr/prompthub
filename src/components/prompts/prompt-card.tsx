'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Bookmark, User, Calendar, Copy } from 'lucide-react'

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
}

interface PromptCardProps {
  prompt: Prompt
  onLike: (promptId: string) => void
  onBookmark: (promptId: string) => void
}

export default function PromptCard({ prompt, onLike, onBookmark }: PromptCardProps) {
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Link href={`/prompt/${prompt.id}`} className="group">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-750 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-2">
              {prompt.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs font-medium border border-gray-600">
                {prompt.model}
              </span>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
            title="Copy prompt"
          >
            <Copy size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Prompt Body */}
        <p className="text-gray-300 mb-4 line-clamp-4">
          {truncateText(prompt.body, 150)}
        </p>

        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            {prompt.creator.avatar_url ? (
              <img 
                src={prompt.creator.avatar_url} 
                alt={prompt.creator.name} 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User size={16} className="text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {prompt.creator.name}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(prompt.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors border ${
                isLiked 
                  ? 'bg-red-900/20 text-red-400 border-red-700' 
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <Heart size={14} className={isLiked ? 'fill-current' : ''} />
              {likeCount}
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors border ${
                isBookmarked 
                  ? 'bg-blue-900/20 text-blue-400 border-blue-700' 
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
            >
              <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
              {bookmarkCount}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
