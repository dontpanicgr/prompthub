'use client'

import { useEffect, useState } from 'react'
import PromptGrid from '@/components/prompts/prompt-grid'
import PromptList from '@/components/prompts/prompt-list'
import { getPublicPromptsPage } from '@/lib/database'
import type { Prompt } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'

interface BrowsePageClientProps {
  initialPrompts: Prompt[]
  searchQuery: string
  selectedModels: string[]
  selectedCategories: string[]
}

export default function BrowsePageClient({ 
  initialPrompts, 
  searchQuery, 
  selectedModels, 
  selectedCategories 
}: BrowsePageClientProps) {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(initialPrompts.length)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const pageSize = 20
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>('card')


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

  const fetchPrompts = async () => {
    try {
      setLoading(true)
      const fetchedPrompts = await getPublicPromptsPage({ userId: user?.id, limit: pageSize, offset: 0 })
      const sorted = fetchedPrompts.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setPrompts(sorted)
      setOffset(sorted.length)
    } catch (error) {
      console.error('Error fetching prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch full recent list on mount to replace initial limited results
  useEffect(() => {
    fetchPrompts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.body.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesModel = selectedModels.length === 0 || 
      selectedModels.includes(prompt.model)
    
    const matchesCategory = selectedCategories.length === 0 || 
      (prompt.categories && prompt.categories.some(cat => selectedCategories.includes(cat.slug)))
    
    return matchesSearch && matchesModel && matchesCategory
  })

  return (
    <>
      {layoutPref === 'table' ? (
        <PromptList prompts={filteredPrompts} loading={loading} />
      ) : (
        <PromptGrid prompts={filteredPrompts} loading={loading} />
      )}
      {!loading && filteredPrompts.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={async () => {
              try {
                setIsLoadingMore(true)
                const more = await getPublicPromptsPage({ userId: user?.id, limit: pageSize, offset })
                const combined = [...prompts, ...more]
                combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                setPrompts(combined)
                setOffset(prev => prev + more.length)
              } catch (e) {
                console.error('Error loading more prompts:', e)
              } finally {
                setIsLoadingMore(false)
              }
            }}
            disabled={isLoadingMore}
            className="px-4 py-2 border rounded"
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
