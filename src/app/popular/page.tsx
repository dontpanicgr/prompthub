'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/main-layout'
import PromptGrid from '@/components/prompts/prompt-grid'
import SearchFilters from '@/components/ui/search-filters'
import { getPopularPrompts } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'
import { TrendingUp, Bookmark, Clock } from 'lucide-react'

export default function PopularPage() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModel, setSelectedModel] = useState('All Models')

  useEffect(() => {
    async function fetchPrompts() {
      try {
        setLoading(true)
        const data = await getPopularPrompts(user?.id)
        setPrompts(data)
      } catch (error) {
        console.error('Error fetching popular prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [user?.id])

  const handleSearch = (query: string, model: string) => {
    console.log('Search query:', query, 'Model:', model)
    // Search is handled by filtering the prompts
  }

  // Apply popularity ranking algorithm
  const rankedPrompts = prompts.sort((a, b) => {
    // Calculate popularity score: likes * 2 + bookmarks * 3 + time bonus
    const getPopularityScore = (prompt: any) => {
      const likes = prompt.like_count || 0
      const bookmarks = prompt.bookmark_count || 0
      const daysSinceCreated = (Date.now() - new Date(prompt.created_at).getTime()) / (1000 * 60 * 60 * 24)
      const timeBonus = Math.max(0, 10 - daysSinceCreated) // Bonus for recent posts
      
      return (likes * 2) + (bookmarks * 3) + timeBonus
    }
    
    return getPopularityScore(b) - getPopularityScore(a)
  })

  const filteredPrompts = rankedPrompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesModel = selectedModel === 'All Models' || 
      prompt.model === selectedModel
    
    return matchesSearch && matchesModel
  })

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Popular Prompts
          </h1>
          <p className="text-gray-400 mb-6">
            Discover the most liked and bookmarked prompts from the community
          </p>

          {/* Search and Filters */}
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onSearch={handleSearch}
            placeholder="Search prompts..."
          />

        </div>

        <PromptGrid prompts={filteredPrompts} loading={loading} />
      </div>
    </MainLayout>
  )
}
