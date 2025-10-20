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
  const fetchInProgressRef = useRef(false)

  const PromptDetails = dynamic(() => import('@/components/prompts/prompt-details'), {
    ssr: false,
    loading: () => null
  })

  // Fetch immediately using route param; then refresh auth flags in background when user loads
  useEffect(() => {
    let isActive = true
    
    // Prevent duplicate fetches in StrictMode
    if (fetchInProgressRef.current) {
      return () => { isActive = false }
    }
    fetchInProgressRef.current = true

    const fetchPromptData = async () => {
      try {
        // Fetch prompt data with user context if available
        const promptData = user 
          ? await getPromptById(id, user.id)
          : await getPromptById(id)
        
        if (!promptData) {
          notFound()
          return
        }
        
        if (isActive) {
          setPrompt(promptData)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching prompt:', error)
        if (isActive) {
          notFound()
        }
      } finally {
        if (isActive) {
          fetchInProgressRef.current = false
        }
      }
    }

    fetchPromptData()

    return () => { 
      isActive = false
      fetchInProgressRef.current = false
    }
  }, [id, user]) // Include user in dependencies to refetch when user changes

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full max-w-4xl mx-auto">
          {/* Skeleton for prompt details */}
          <div className="space-y-4">
            {/* Categories and metadata skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
            </div>
            
            {/* Title skeleton */}
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse"></div>
            
            {/* Action buttons skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-9 w-16 bg-muted rounded animate-pulse"></div>
              <div className="h-9 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-9 w-9 bg-muted rounded animate-pulse"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
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
