'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import UserPromptsGrid from '@/components/prompts/user-prompts-grid'
import PromptList from '@/components/prompts/prompt-list'
import PromptGrid from '@/components/prompts/prompt-grid'
import SearchFilters from '@/components/ui/search-filters'
import UserBioCard from '@/components/ui/user-bio-card'
import { getUserEngagementStats } from '@/lib/database'
import { supabase } from '@/lib/supabase'

interface UserPageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserPage({ params }: UserPageProps) {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    prompts_created: 0,
    likes_received: 0,
    bookmarks_received: 0
  })
  const [userLoading, setUserLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>(() => {
    if (typeof window === 'undefined') return 'card'
    const pref = (localStorage.getItem('layout-preference') as 'card' | 'table' | null)
    return pref === 'table' ? 'table' : 'card'
  })

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { id } = await params
        
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !userData) {
          notFound()
        }

        setUser(userData)
        setUserLoading(false)

        // Fetch stats separately after user data is loaded
        const userStats = await getUserEngagementStats(id)
        setStats(userStats)
        setStatsLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserLoading(false)
        setStatsLoading(false)
      }
    }

    fetchUserData()
  }, [params])

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
    // Search is handled by the UserPromptsGrid component
  }

  if (userLoading) {
    return (
      <MainLayout>
        <div className="w-full p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64 mb-6"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Prompts Section */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="mb-2">
                {user.name}&apos;s Prompts
              </h1>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <SearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedModels={selectedModels}
                setSelectedModels={setSelectedModels}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                onSearch={handleSearch}
                placeholder="Search user's prompts..."
              />
            </div>

            {/* Prompts Grid/List based on preference */}
            <div>
              {layoutPref === 'table' ? (
                <PromptList />
              ) : (
                <UserPromptsGrid 
                  userId={user.id} 
                  maxColumns={3} 
                  searchQuery={searchQuery}
                  selectedModels={selectedModels}
                  user={{
                    id: user.id,
                    name: user.name,
                    is_private: user.is_private
                  }}
                />
              )}
            </div>
          </div>

          {/* User Profile Card - Sidebar */}
          <div className="lg:col-span-1">
            <UserBioCard
              user={{
                id: user.id,
                name: user.name,
                avatar_url: user.avatar_url,
                bio: user.bio,
                website_url: user.website_url,
                is_private: user.is_private
              }}
              stats={stats}
              showStats={false}
              loading={statsLoading}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
