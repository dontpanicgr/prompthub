'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import UserPromptsGrid from '@/components/prompts/user-prompts-grid'
import SearchFilters from '@/components/ui/search-filters'
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
    prompts_liked: 0,
    prompts_bookmarked: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])

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

        // Get user's stats
        const { data: prompts } = await supabase
          .from('prompts')
          .select('id')
          .eq('creator_id', id)
          .eq('is_public', true)

        const { data: likes } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', id)

        const { data: bookmarks } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', id)

        const userStats = {
          prompts_created: prompts?.length || 0,
          prompts_liked: likes?.length || 0,
          prompts_bookmarked: bookmarks?.length || 0
        }

        setUser(userData)
        setStats(userStats)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [params])

  const handleSearch = (query: string, models: string[]) => {
    console.log('Search query:', query, 'Models:', models)
    // Search is handled by filtering the prompts
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64 mb-8"></div>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Profile Card - Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
              <div className="flex flex-col items-start">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name} 
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <h2 className="text-xl font-bold text-card-foreground mb-4 truncate">
                    {user.name}
                  </h2>
                  {user.bio && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {user.bio}
                    </p>
                  )}
                  {user.website_url && (
                    <a
                      href={user.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mb-6 block"
                    >
                      {user.website_url}
                    </a>
                  )}
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Prompts</p>
                      <p className="text-xl font-bold text-card-foreground">{stats.prompts_created}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Likes</p>
                      <p className="text-xl font-bold text-card-foreground">{stats.prompts_liked}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">Bookmarks</p>
                      <p className="text-xl font-bold text-card-foreground">{stats.prompts_bookmarked}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prompts Section */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="mb-2">
                {user.name}&apos;s Prompts
              </h1>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
              <SearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedModels={selectedModels}
                setSelectedModels={setSelectedModels}
                onSearch={handleSearch}
                placeholder="Search user's prompts..."
              />
            </div>

            {/* Prompts Grid */}
            <div>
              <UserPromptsGrid userId={user.id} maxColumns={3} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
