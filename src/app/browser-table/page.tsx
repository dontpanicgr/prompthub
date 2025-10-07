'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import SearchFilters from '@/components/ui/search-filters'
import PromptList from '@/components/prompts/prompt-list'
import { getPublicPrompts } from '@/lib/database'
import type { Prompt } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'

export default function BrowserTablePage() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])

  useEffect(() => {
    async function fetchPrompts() {
      try {
        setLoading(true)
        const fetched = await getPublicPrompts(user?.id)
        setPrompts(fetched)
      } catch (e) {
        console.error('Error fetching prompts:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchPrompts()
  }, [user])

  const handleSearch = (query: string, models: string[]) => {
    setSearchQuery(query)
    setSelectedModels(models)
  }

  const filtered = prompts.filter(prompt => {
    const matchesSearch = !searchQuery ||
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesModel = selectedModels.length === 0 || selectedModels.includes(prompt.model)
    return matchesSearch && matchesModel
  })

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="mb-2">Browser (Table)</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Testing table layout for prompts</p>

          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            onSearch={handleSearch}
            placeholder="Search prompts..."
          />
        </div>

        <PromptList prompts={filtered} loading={loading} />
      </div>
    </MainLayout>
  )
}


