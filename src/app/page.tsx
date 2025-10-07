'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import PromptGrid from '@/components/prompts/prompt-grid'
import PromptList from '@/components/prompts/prompt-list'
import SearchFilters from '@/components/ui/search-filters'
import { getPublicPrompts, getPopularPrompts } from '@/lib/database'
import type { Prompt } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'
export default function BrowsePage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'bookmarked'>('recent')
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>('card')

  // Initialize selected models from URL parameters
  useEffect(() => {
    const modelParam = searchParams.get('model')
    if (modelParam) {
      setSelectedModels([modelParam])
    }
  }, [searchParams])

  // Load layout preference from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const pref = (localStorage.getItem('layout-preference') as 'card' | 'table' | null)
    if (pref === 'table') setLayoutPref('table')
    else setLayoutPref('card')

    const handler = (e: CustomEvent) => {
      setLayoutPref(e.detail.layout === 'table' ? 'table' : 'card')
    }
    window.addEventListener('layout-preference-change', handler as EventListener)
    return () => window.removeEventListener('layout-preference-change', handler as EventListener)
  }, [])

  useEffect(() => {
    async function fetchPrompts() {
      try {
        setLoading(true)
        let fetchedPrompts: any[] = []
        
        switch (sortBy) {
          case 'popular':
            fetchedPrompts = await getPublicPrompts(user?.id)
            // Apply popularity ranking algorithm: likes * 3 + bookmarks * 5 + reduced time bonus
            fetchedPrompts = fetchedPrompts.sort((a, b) => {
              const getPopularityScore = (prompt: any) => {
                const likes = prompt.like_count || 0
                const bookmarks = prompt.bookmark_count || 0
                const daysSinceCreated = (Date.now() - new Date(prompt.created_at).getTime()) / (1000 * 60 * 60 * 24)
                const timeBonus = Math.max(0, 10 - daysSinceCreated) * 0.5 // Reduced time bonus
                
                return (likes * 3) + (bookmarks * 5) + timeBonus
              }
              
              return getPopularityScore(b) - getPopularityScore(a)
            })
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
    setSearchQuery(query)
    setSelectedModels(models)
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
    </MainLayout>
  )
}
