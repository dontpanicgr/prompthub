'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { createPrompt } from '@/lib/database'
import { analytics } from '@/lib/analytics'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModelBadge } from '@/components/ui/model-badge'

const MODELS = [
  'GPT',
  'Claude',
  'Gemini',
  'Gemma',
  'Grok',
  'Perplexity',
  'GitHub',
  'Copilot',
  'Mistral',
  'Meta',
  'Ollama',
  'Cohere',
  'Qwen',
  'DeepSeek',
  'Moonshot',
  'Black Forest Labs',
  'Other'
]

export default function CreatePromptForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    model: 'GPT',
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
        // Track successful form submission
        analytics.trackFormSubmission('Create Prompt', true)
        analytics.trackCustomEvent('Prompt Created', {
          promptId: newPrompt.id,
          model: formData.model,
          isPublic: formData.is_public,
          titleLength: formData.title.length,
          bodyLength: formData.body.length
        })
        
        // Redirect to the new prompt
        console.log('Redirecting to:', `/prompt/${newPrompt.id}`)
        router.push(`/prompt/${newPrompt.id}`)
      } else {
        console.error('createPrompt returned null')
        throw new Error('Failed to create prompt')
      }
    } catch (error) {
      console.error('Error creating prompt:', error)
      
      // Track failed form submission
      analytics.trackFormSubmission('Create Prompt', false)
      analytics.trackError(error as Error, 'create-prompt-form')
      
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    analytics.trackButtonClick('Cancel Create Prompt', 'create-prompt-form')
    router.back()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="py-0">
        <CardContent className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-md font-medium mb-2">
                Title *
              </label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title for your prompt"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Prompt Body */}
            <div>
              <label htmlFor="body" className="block text-md font-medium mb-1">
                Prompt *
              </label>
              <span className="flex items-center gap-2 mb-3">
                <span className="text-sm">Markdown supported! Use **bold**, *italic*, `code`, # headers, - lists, and more.</span>
              </span>
              <Textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                placeholder="Enter your AI prompt here. Be specific and detailed to get the best results..."
                className={`min-h-[120px] ${errors.body ? 'border-destructive' : ''}`}
              />
              <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>{formData.body.length}/5000</span>
              </div>
              {errors.body && (
                <p className="mt-1 text-sm text-destructive">{errors.body}</p>
              )}
            </div>

            {/* Model Selection Badges */}
            <div>
              <label className="block text-md font-medium mb-1">
                AI Model *
              </label>
              <p className="mb-3 text-sm text-muted-foreground">Click a model to select it. Only one model can be selected at a time.</p>
              <div className="flex flex-wrap gap-2 p-0 rounded-md">
                {MODELS.map((model) => (
                  <ModelBadge
                    key={model}
                    model={model}
                    showIcon={true}
                    size="sm"
                    variant="outline"
                    onClick={() => setFormData(prev => ({ ...prev, model }))}
                    className={`cursor-pointer transition-all ${
                      formData.model === model 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'hover:bg-muted'
                    }`}
                  />
                ))}
              </div>
              {errors.model && (
                <p className="mt-1 text-sm text-destructive">{errors.model}</p>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-md font-medium mb-3">
                Visibility
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-colors py-0 ${
                    formData.is_public 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, is_public: true }))}
                >
                  <CardContent className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="is_public"
                        value="true"
                        checked={formData.is_public}
                        onChange={() => setFormData(prev => ({ ...prev, is_public: true }))}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye size={16} className="text-green-600" />
                          <span className="text-sm font-medium">Public</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Anyone can discover and use this prompt
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-colors py-0 ${
                    !formData.is_public 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, is_public: false }))}
                >
                  <CardContent className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="is_public"
                        value="false"
                        checked={!formData.is_public}
                        onChange={() => setFormData(prev => ({ ...prev, is_public: false }))}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <EyeOff size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium">Private</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Only you can see and use this prompt
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-start gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 h-10"
              >
                <Save size={18} />
                {isSubmitting ? 'Creating...' : 'Create Prompt'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2 h-10"
              >
                <X size={18} />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
