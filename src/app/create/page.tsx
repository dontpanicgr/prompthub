'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import CreatePromptForm from '@/components/prompts/create-prompt-form'
import { useAuth } from '@/components/auth-provider'

export default function CreatePromptPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/create')}`)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="max-w-4xl mx-auto mb-6">
          <h1 className="mb-2">
            Add Prompt
          </h1>
          <p className="text-muted-foreground">
            Share your AI prompt with the community
          </p>
        </div>

        <CreatePromptForm />
      </div>
    </MainLayout>
  )
}
