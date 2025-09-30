'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { createPrompt } from '@/lib/database'

const MODELS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Grok',
  'Perplexity',
  'Other'
]

export default function CreatePromptForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    model: 'ChatGPT',
    is_public: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Prompt body is required'
    } else if (formData.body.length < 10) {
      newErrors.body = 'Prompt must be at least 10 characters'
    } else if (formData.body.length > 5000) {
      newErrors.body = 'Prompt must be less than 5000 characters'
    }

    if (!formData.model) {
      newErrors.model = 'Model is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (!user) {
      console.error('User not authenticated')
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('Creating prompt with data:', {
        title: formData.title,
        body: formData.body,
        model: formData.model,
        is_public: formData.is_public,
        creator_id: user.id
      })

      const newPrompt = await createPrompt({
        title: formData.title,
        body: formData.body,
        model: formData.model,
        is_public: formData.is_public,
        creator_id: user.id
      })

      console.log('Created prompt result:', newPrompt)

      if (newPrompt) {
        // Redirect to the new prompt
        console.log('Redirecting to:', `/prompt/${newPrompt.id}`)
        router.push(`/prompt/${newPrompt.id}`)
      } else {
        console.error('createPrompt returned null')
        throw new Error('Failed to create prompt')
      }
    } catch (error) {
      console.error('Error creating prompt:', error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a descriptive title for your prompt"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Model *
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.model 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          >
            {MODELS.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          {errors.model && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model}</p>
          )}
        </div>

        {/* Prompt Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompt *
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            rows={12}
            placeholder="Enter your AI prompt here. Be specific and detailed to get the best results..."
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
              errors.body 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
          />
          <div className="mt-1 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{errors.body || ''}</span>
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
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={18} />
            {isSubmitting ? 'Creating...' : 'Create Prompt'}
          </button>
        </div>
      </form>
    </div>
  )
}
