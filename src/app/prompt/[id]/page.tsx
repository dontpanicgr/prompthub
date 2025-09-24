'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import PromptDetails from '@/components/prompts/prompt-details'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'

interface PromptPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PromptPage({ params }: PromptPageProps) {
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchPrompt() {
      try {
        const { id } = await params
        
        // Build query - allow public prompts or private prompts owned by current user
        let query = supabase
          .from('prompts')
          .select(`
            *,
            creator:profiles!prompts_creator_id_fkey(
              id,
              name,
              avatar_url,
              bio,
              website_url
            ),
            likes!left(
              user_id
            ),
            bookmarks!left(
              user_id
            )
          `)
          .eq('id', id)

        // If user is authenticated, allow viewing their own private prompts
        if (user) {
          query = query.or(`is_public.eq.true,creator_id.eq.${user.id}`)
        } else {
          // If not authenticated, only allow public prompts
          query = query.eq('is_public', true)
        }

        const { data: promptData, error } = await query.single()

        if (error || !promptData) {
          notFound()
        }

        // Process the data to add like/bookmark status for current user
        const processedPrompt = {
          ...promptData,
          is_liked: user ? promptData.likes?.some((like: any) => like.user_id === user.id) : false,
          is_bookmarked: user ? promptData.bookmarks?.some((bookmark: any) => bookmark.user_id === user.id) : false,
          like_count: promptData.likes?.length || 0,
          bookmark_count: promptData.bookmarks?.length || 0
        }

        setPrompt(processedPrompt)
      } catch (error) {
        console.error('Error fetching prompt:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchPrompt()
  }, [params, user])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      </MainLayout>
    )
  }

  if (!prompt) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="w-full">
        <PromptDetails prompt={prompt} />
      </div>
    </MainLayout>
  )
}
