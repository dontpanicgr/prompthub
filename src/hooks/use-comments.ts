'use client'

import { useState, useEffect } from 'react'
import { Comment } from '@/lib/database'
import { getCommentsForPrompt } from '@/lib/database'
import { supabase } from '@/lib/supabase'

export function useComments(promptId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const fetchedComments = await getCommentsForPrompt(promptId)
      // Map soft-deleted comments to a placeholder client-side
      setComments(
        (fetchedComments || []).map((c) =>
          c.is_deleted
            ? {
                ...c,
                content: '[deleted]',
                replies: c.replies,
              }
            : c
        )
      )
    } catch (err) {
      console.error('Error fetching comments:', err)
      setError('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()

    // Set up real-time subscription
    const channel = supabase
      .channel(`comments:${promptId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `prompt_id=eq.${promptId}`,
        },
        (payload) => {
          console.log('Comment change received:', payload)
          
          // Refetch comments when any change occurs
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [promptId])

  return {
    comments,
    isLoading,
    error,
    refetch: fetchComments,
  }
}
