'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { createPrompt } from '@/lib/database'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="max-w-4xl mx-auto">
      <Card className="py-0">
        <CardContent className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
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

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium mb-2">
                AI Model *
              </label>
              <Select value={formData.model} onValueChange={(value) => setFormData(prev => ({ ...prev, model: value }))}>
                <SelectTrigger className={errors.model ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.model && (
                <p className="mt-1 text-sm text-destructive">{errors.model}</p>
              )}
            </div>

            {/* Prompt Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium mb-2">
                Prompt *
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                rows={12}
                placeholder="Enter your AI prompt here. Be specific and detailed to get the best results..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical bg-card text-foreground placeholder:text-muted-foreground ${
                  errors.body ? 'border-destructive' : 'border-input'
                }`}
              />
              <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                <span>{errors.body || ''}</span>
                <span>{formData.body.length}/5000</span>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium mb-3">
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
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                {isSubmitting ? 'Creating...' : 'Create Prompt'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
