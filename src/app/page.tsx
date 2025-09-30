'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import PromptGrid from '@/components/prompts/prompt-grid'
import SearchFilters from '@/components/ui/search-filters'
import { getPublicPrompts, getPopularPrompts } from '@/lib/database'
import type { Prompt } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'
export default function BrowsePage() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'bookmarked'>('recent')

  useEffect(() => {
    async function fetchPrompts() {
      try {
        setLoading(true)
        let fetchedPrompts: any[] = []
        
        switch (sortBy) {
          case 'popular':
            fetchedPrompts = await getPopularPrompts(user?.id)
            break
          case 'bookmarked':
            const allPrompts = await getPublicPrompts(user?.id)
            fetchedPrompts = allPrompts.filter(p => p.is_bookmarked)
            break
          case 'recent':
          default:
            fetchedPrompts = await getPublicPrompts(user?.id)
            // Sort by created_at descending (most recent first)
            fetchedPrompts = fetchedPrompts.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            break
        }
        
        setPrompts(fetchedPrompts)
      } catch (error) {
        console.error('Error fetching prompts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [user, sortBy])

  const handleSearch = (query: string, models: string[]) => {
    console.log('Search query:', query, 'Models:', models)
    // Search is handled by filtering the prompts
  }

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesModel = selectedModels.length === 0 || 
      selectedModels.includes(prompt.model)
    
    return matchesSearch && matchesModel
  })

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-8">
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
            onSearch={handleSearch}
            placeholder="Search prompts..."
          />

        </div>

        <PromptGrid prompts={filteredPrompts} loading={loading} />
      </div>
    </MainLayout>
  )
}
