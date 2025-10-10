'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import PromptDetails from '@/components/prompts/prompt-details'
import { getPromptById } from '@/lib/database'
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

  // Fetch immediately using route param; then refresh auth flags in background when user loads
  useEffect(() => {
    let isActive = true

    const fetchPublicFirst = async () => {
      try {
        const { id } = await params
        const promptData = await getPromptById(id)
        if (!promptData) {
          notFound()
          return
        }
        if (isActive) setPrompt(promptData)
      } catch (error) {
        console.error('Error fetching prompt:', error)
        notFound()
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchPublicFirst()

    return () => { isActive = false }
  }, [params])

  // When user becomes available, refresh like/bookmark visibility in background
  useEffect(() => {
    let cancelled = false
    const refreshWithAuth = async () => {
      if (!user) return
      const { id } = await params
      getPromptById(id, user.id).then((data) => {
        if (!cancelled && data) setPrompt(data)
      }).catch(() => {})
    }
    refreshWithAuth()
    return () => { cancelled = true }
  }, [user, params])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
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
