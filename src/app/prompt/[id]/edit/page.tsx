'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import { useAuth } from '@/components/auth-provider'
import { getPromptById, updatePrompt, deletePrompt } from '@/lib/database'
import { ArrowLeft, Trash2, Save, X, Eye, EyeOff } from 'lucide-react'

interface EditPromptPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPromptPage({ params }: EditPromptPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    model: '',
    is_public: true
  })

  useEffect(() => {
    async function loadPrompt() {
      const { id } = await params
      
      if (!user) {
        router.push('/')
        return
      }

      try {
        const promptData = await getPromptById(id, user.id)
        
        if (!promptData) {
          router.push('/')
          return
        }

        // Check if user owns this prompt
        if (promptData.creator_id !== user.id) {
          router.push('/')
          return
        }

        setPrompt(promptData)
        setFormData({
          title: promptData.title,
          body: promptData.body,
          model: promptData.model,
          is_public: promptData.is_public
        })
      } catch (error) {
        console.error('Error loading prompt:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    loadPrompt()
  }, [params, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt || !user) return

    setSaving(true)
    try {
      const updatedPrompt = await updatePrompt(prompt.id, formData)
      if (updatedPrompt) {
        router.push(`/prompt/${prompt.id}`)
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!prompt || !user) return
    
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const success = await deletePrompt(prompt.id)
      if (success) {
        router.push('/me')
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!prompt) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Prompt not found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The prompt you're looking for doesn't exist or you don't have permission to edit it.
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Prompt
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your prompt details
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a descriptive title for your prompt"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* AI Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AI Model *
              </label>
              <select
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a model</option>
                <option value="ChatGPT">ChatGPT</option>
                <option value="Claude">Claude</option>
                <option value="Gemini">Gemini</option>
                <option value="Grok">Grok</option>
                <option value="Perplexity">Perplexity</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Prompt Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prompt *
              </label>
              <textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={12}
                placeholder="Enter your AI prompt here. Be specific and detailed to get the best results..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
              <div className="mt-1 flex justify-end text-sm text-gray-500 dark:text-gray-400">
                <span>{formData.body.length}/5000</span>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Visibility
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_public"
                    value="true"
                    checked={formData.is_public}
                    onChange={() => setFormData(prev => ({ ...prev, is_public: true }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Anyone can discover and use this prompt
                    </p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_public"
                    value="false"
                    checked={!formData.is_public}
                    onChange={() => setFormData(prev => ({ ...prev, is_public: false }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <EyeOff size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Private</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Only you can see and use this prompt
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting...' : 'Delete Prompt'}
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
