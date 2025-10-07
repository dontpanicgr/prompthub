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

  useEffect(() => {
    async function fetchPrompt() {
      try {
        const { id } = await params
        const promptData = await getPromptById(id, user?.id)
        if (!promptData) {
          notFound()
        }
        setPrompt(promptData)
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
