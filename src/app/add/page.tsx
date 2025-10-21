'use client'

import { Suspense } from 'react'
import MainLayout from '@/components/layout/main-layout'
import CreatePromptForm from '@/components/prompts/create-prompt-form'

export default function AddPromptPage() {
  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6">
        <h1 className="mb-2 text-xl lg:text-2xl font-bold">
          Add Prompt
        </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Share your AI prompt with the community
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
          </div>
        }>
          <CreatePromptForm />
        </Suspense>
      </div>
    </MainLayout>
  )
}
