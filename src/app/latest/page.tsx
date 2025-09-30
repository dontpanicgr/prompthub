'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import PromptGrid from '@/components/prompts/prompt-grid'
import SearchFilters from '@/components/ui/search-filters'
import { getPublicPrompts } from '@/lib/database'
import type { Prompt } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'

export default function LatestPage() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])

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
            onSearch={handleSearch}
            placeholder="Search prompts..."
          />

        </div>

        <PromptGrid prompts={filteredPrompts} loading={loading} />
      </div>
    </MainLayout>
  )
}
