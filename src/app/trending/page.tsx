'use client'

import { useState, useEffect } from 'react'
import PromptGrid from '@/components/prompts/prompt-grid'
import PromptList from '@/components/prompts/prompt-list'
import SearchFilters from '@/components/ui/search-filters'
import { getPopularPrompts } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'
import { TrendingUp, Bookmark, Clock } from 'lucide-react'

export default function TrendingPage() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>(() => {
    if (typeof window === 'undefined') return 'card'
    const pref = (localStorage.getItem('layout-preference') as 'card' | 'table' | null)
    return pref === 'table' ? 'table' : 'card'
  })

  useEffect(() => {
    async function fetchPrompts() {
      try {
        setLoading(true)
        const data = await getPopularPrompts(user?.id)
        setPrompts(data)
      } catch (error) {
        console.error('Error fetching trending prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [user?.id])

  // Listen for layout preference changes
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setLayoutPref(e.detail.layout === 'table' ? 'table' : 'card')
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('layout-preference-change', handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('layout-preference-change', handler as EventListener)
      }
    }
  }, [])

  const handleSearch = (query: string, models: string[], categories: string[]) => {
    console.log('Search query:', query, 'Models:', models, 'Categories:', categories)
    setSearchQuery(query)
    setSelectedModels(models)
    setSelectedCategories(categories)
    // Search is handled by filtering the prompts
  }

  // Apply trending ranking algorithm - pure engagement based
  const rankedPrompts = prompts.sort((a, b) => {
    // Calculate trending score: likes * 4 + bookmarks * 6 (no time bonus)
    const getTrendingScore = (prompt: any) => {
      const likes = prompt.like_count || 0
      const bookmarks = prompt.bookmark_count || 0
      
      return (likes * 4) + (bookmarks * 6)
    }
    
    return getTrendingScore(b) - getTrendingScore(a)
  })

  const filteredPrompts = rankedPrompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesModel = selectedModels.length === 0 || 
      selectedModels.includes(prompt.model)
    
    const matchesCategory = selectedCategories.length === 0 ||
      (prompt.categories && prompt.categories.some((cat: any) => selectedCategories.includes(cat.slug)))
    
    return matchesSearch && matchesModel && matchesCategory
  })

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="mb-2">
          Trending Prompts
        </h1>
        <p className="text-gray-400 mb-6">
          Discover the most liked and bookmarked prompts from the community
        </p>

        {/* Search and Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedModels={selectedModels}
          setSelectedModels={setSelectedModels}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          onSearch={handleSearch}
          placeholder="Search prompts..."
          toggleTooltip={layoutPref === 'table' ? 'Switch to card view' : 'Switch to list view'}
        />

      </div>
      {layoutPref === 'table' ? (
        <PromptList prompts={filteredPrompts} loading={loading} />
      ) : (
        <PromptGrid prompts={filteredPrompts} loading={loading} />
      )}
    </div>
  )
}
