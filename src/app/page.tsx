'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getPublicPrompts } from '@/lib/database'
import type { Prompt } from '@/lib/database'
import { useDataCache } from '@/contexts/data-cache-context'
import BrowsePageClient from './browse-page-client'
import SearchFilters from '@/components/ui/search-filters'

export default function BrowsePage() {
  const [initialPrompts, setInitialPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const { getCachedPrompts } = useDataCache()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchInitialPrompts = async () => {
      try {
        const prompts = await getCachedPrompts(
          'browse-prompts',
          () => getPublicPrompts(),
          2 * 60 * 1000 // 2 minutes cache
        )
        setInitialPrompts(prompts.slice(0, 20)) // Limit initial load for faster LCP
      } catch (error) {
        console.error('Error fetching initial prompts:', error)
        setInitialPrompts([])
      } finally {
        setLoading(false)
      }
    }

    fetchInitialPrompts()
  }, [getCachedPrompts])

  // Initialize filters from URL query params so direct links pre-apply filters
  useEffect(() => {
    if (!searchParams) return
    const q = searchParams.get('q') || ''
    const models = searchParams.getAll('model')
    const categories = searchParams.getAll('category')
    setSearchQuery(q)
    setSelectedModels(models)
    setSelectedCategories(categories)
  }, [searchParams])

  const handleSearch = (query: string, models: string[], categories: string[]) => {
    setSearchQuery(query)
    setSelectedModels(models)
    setSelectedCategories(categories)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="mb-2">
          Browse Prompts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Discover and explore prompts from our community
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
          toggleTooltip="Switch to list view"
        />
      </div>
      
      <BrowsePageClient 
        initialPrompts={initialPrompts} 
        searchQuery={searchQuery}
        selectedModels={selectedModels}
        selectedCategories={selectedCategories}
      />
    </div>
  )
}
