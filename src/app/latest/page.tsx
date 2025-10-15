'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import PromptGrid from '@/components/prompts/prompt-grid'
import PromptList from '@/components/prompts/prompt-list'
import SearchFilters from '@/components/ui/search-filters'
import { getPublicPrompts } from '@/lib/database'
import type { Prompt } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'
import { deferToIdle, debounce } from '@/lib/performance-utils'

export default function LatestPage() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>('card') // Always start with card to prevent blocking

  useEffect(() => {
    async function fetchLatestPrompts() {
      try {
        setLoading(true)
        const latestPrompts = await getPublicPrompts(user?.id)
        // Sort by created_at descending (most recent first)
        const sortedPrompts = latestPrompts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setPrompts(sortedPrompts)
      } catch (error) {
        console.error('Error fetching latest prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestPrompts()
  }, [user])

  // Restore layout preference after hydration
  useEffect(() => {
    const restoreLayout = () => {
      try {
        const pref = localStorage.getItem('layout-preference') as 'card' | 'table' | null
        if (pref === 'table') {
          setLayoutPref('table')
        }
      } catch (error) {
        console.warn('Failed to restore layout preference:', error)
      }
    }
    
    return deferToIdle(restoreLayout, 500)
  }, [])

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

  const handleSearch = useCallback((query: string, models: string[], categories: string[]) => {
    console.log('Search query:', query, 'Models:', models, 'Categories:', categories)
    setSearchQuery(query)
    setSelectedModels(models)
    setSelectedCategories(categories)
    // Search is handled by filtering the prompts
  }, [])

  // Memoize filtered prompts to prevent expensive re-computation on every render
  const filteredPrompts = useMemo(() => {
    if (!searchQuery && selectedModels.length === 0 && selectedCategories.length === 0) {
      return prompts // No filtering needed
    }

    return prompts.filter(prompt => {
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesModel = selectedModels.length === 0 || 
        selectedModels.includes(prompt.model)
      
      const matchesCategory = selectedCategories.length === 0 ||
        (prompt.categories && prompt.categories.some(cat => selectedCategories.includes(cat.slug)))
      
      return matchesSearch && matchesModel && matchesCategory
    })
  }, [prompts, searchQuery, selectedModels, selectedCategories])

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="mb-2">
          Latest Prompts
        </h1>
        <p className="text-gray-400 mb-6">
          Discover the most recently added prompts from our community
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
