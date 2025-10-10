'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import PromptGrid from '@/components/prompts/prompt-grid'
import PromptList from '@/components/prompts/prompt-list'
import { getPublicPrompts } from '@/lib/database'
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
  const searchParams = useSearchParams()
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'bookmarked'>('recent')
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
      console.log('🔄 Starting to fetch prompts...')
      console.log('User ID:', user?.id)
      console.log('Sort by:', sortBy)
      
      setLoading(true)
      let fetchedPrompts: any[] = []
      
      switch (sortBy) {
        case 'popular':
          console.log('📊 Fetching popular prompts...')
          fetchedPrompts = await getPublicPrompts(user?.id)
          console.log('📊 Raw prompts from database:', fetchedPrompts.length)
          
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
          console.log('🔖 Fetching bookmarked prompts...')
          const allPrompts = await getPublicPrompts(user?.id)
          console.log('🔖 All prompts:', allPrompts.length)
          fetchedPrompts = allPrompts.filter(p => p.is_bookmarked)
          console.log('🔖 Bookmarked prompts:', fetchedPrompts.length)
          break
        case 'recent':
        default:
          console.log('🕒 Fetching recent prompts...')
          fetchedPrompts = await getPublicPrompts(user?.id)
          console.log('🕒 Raw prompts from database:', fetchedPrompts.length)
          
          // Sort by created_at descending (most recent first)
          fetchedPrompts = fetchedPrompts.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          break
      }
      
      console.log('✅ Final prompts to display:', fetchedPrompts.length)
      console.log('📝 Sample prompt:', fetchedPrompts[0])
      setPrompts(fetchedPrompts)
    } catch (error) {
      console.error('❌ Error fetching prompts:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    } finally {
      setLoading(false)
    }
  }

  // Only fetch if sortBy changes (not on initial load since we have initialPrompts)
  useEffect(() => {
    if (sortBy !== 'recent') {
      fetchPrompts()
    }
  }, [sortBy])


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
    </>
  )
}
