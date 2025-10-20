"use client"

import { useEffect, useRef, useState, use as usePromise } from 'react'
import { notFound } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import dynamic from 'next/dynamic'
import { getPromptById } from '@/lib/database'
import { useAuth } from '@/components/auth-provider'

interface PromptPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PromptPage({ params }: PromptPageProps) {
  const { id } = usePromise(params)
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const fetchedPublicRef = useRef<string | null>(null)
  const initialLoadCompleteRef = useRef(false)

  const PromptDetails = dynamic(() => import('@/components/prompts/prompt-details'), {
    ssr: false,
    loading: () => null
  })

  // Fetch immediately using route param; then refresh auth flags in background when user loads
  useEffect(() => {
    let isActive = true
    // Guard against StrictMode double-invoke and subsequent re-renders
    if (fetchedPublicRef.current === id && initialLoadCompleteRef.current) {
      return () => { isActive = false }
    }
    fetchedPublicRef.current = id

    const fetchPublicFirst = async () => {
      try {
        // Fetch minimal, cached prompt data for fast first paint
        const res = await fetch(`/api/prompts/${id}`, { cache: 'force-cache' })
        if (!res.ok) {
          notFound()
          return
        }
        const minimal = await res.json()
        if (isActive) setPrompt(minimal)
        // Fetch counts in background and merge
        fetch(`/api/prompts/${id}/counts`, { cache: 'force-cache' })
          .then(r => r.ok ? r.json() : null)
          .then(counts => {
            if (!counts) return
            if (isActive) setPrompt((prev: any) => prev ? { ...prev, like_count: counts.like_count, bookmark_count: counts.bookmark_count } : prev)
          })
      } catch (error) {
        console.error('Error fetching prompt:', error)
        notFound()
      } finally {
        if (isActive) {
          setLoading(false)
          initialLoadCompleteRef.current = true
        }
      }
    }

    fetchPublicFirst()

    return () => { isActive = false }
  }, [id])

  // When user becomes available, refresh like/bookmark visibility in background
  useEffect(() => {
    let cancelled = false
    const refreshWithAuth = async () => {
      if (!user) return
      getPromptById(id, user.id).then((data) => {
        if (!cancelled && data) setPrompt(data)
      }).catch(() => {})
    }
    refreshWithAuth()
    return () => { cancelled = true }
  }, [user, id])

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
      <div className="w-full max-w-4xl mx-auto">
        <PromptDetails prompt={prompt} />
      </div>
    </MainLayout>
  )
}
