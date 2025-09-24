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
  const [selectedModel, setSelectedModel] = useState('All Models')

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

  const handleSearch = (query: string, model: string) => {
    console.log('Search query:', query, 'Model:', model)
    // Search is handled by filtering the prompts
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-32 mb-6"></div>
            <div className="h-4 bg-gray-700 rounded w-64 mb-8"></div>
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
      <div className="w-full p-6">
        {/* User Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name}
              </h1>
              {user.bio && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user.bio}
                </p>
              )}
              {user.website_url && (
                <a
                  href={user.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {user.website_url}
                </a>
              )}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.prompts_created}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Prompts
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.prompts_liked}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Liked
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.prompts_bookmarked}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Bookmarked
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onSearch={handleSearch}
            placeholder="Search user's prompts..."
          />
        </div>

        {/* User's Prompts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {user.name}&apos;s Public Prompts
          </h2>
          <UserPromptsGrid userId={user.id} />
        </div>
      </div>
    </MainLayout>
  )
}
