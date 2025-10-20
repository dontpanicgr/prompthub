'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import { useAuth } from '@/components/auth-provider'
import { getPromptById, updatePrompt, deletePrompt } from '@/lib/database'
import { ArrowLeft, Trash2, Save, X, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModelBadge } from '@/components/ui/model-badge'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import CategoriesDropdown from '@/components/ui/categories-dropdown'
import ProjectSelector from '@/components/ui/project-selector'

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

interface EditPromptPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPromptPage({ params }: EditPromptPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    model: '',
    is_public: true,
    category_ids: [] as string[],
    project_id: null as string | null
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
        // Prefill with AI suggestion if provided via query param
        const suggested = searchParams.get('suggestion')
        setFormData({
          title: promptData.title,
          body: suggested ?? promptData.body,
          model: promptData.model,
          is_public: promptData.is_public,
          category_ids: promptData.categories?.map((cat: any) => cat.id) || [],
          project_id: promptData.project_id || null
        })
      } catch (error) {
        console.error('Error loading prompt:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    loadPrompt()
  }, [params, user, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt || !user) return

    setSaving(true)
    try {
      const updatedPrompt = await updatePrompt(prompt.id, {
        title: formData.title,
        body: formData.body,
        model: formData.model,
        is_public: formData.is_public,
        category_ids: formData.category_ids,
        project_id: formData.project_id
      })
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
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64 mb-6"></div>
            <div className="space-y-6">
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
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
            <h1 className="mb-2 text-xl lg:text-2xl">
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
        <div className="max-w-4xl mx-auto mb-6">
          <h1 className="mb-2 text-xl lg:text-2xl">
            Edit Prompt
          </h1>
          <p className="text-muted-foreground">
            Update your prompt details
          </p>
        </div>

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
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a descriptive title for your prompt"
                    maxLength={48}
                    required
                  />
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
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="Enter your AI prompt here. Be specific and detailed to get the best results..."
                    className="min-h-[120px]"
                    required
                  />
                  <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                    <span>{formData.body.length}/5000</span>
                  </div>
                </div>

                {/* AI Model */}
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
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-md font-medium mb-2">
                    Categories
                  </label>
                  <CategoriesDropdown
                    selectedCategoryIds={formData.category_ids}
                    onCategoryChange={(categoryIds) => setFormData(prev => ({ ...prev, category_ids: categoryIds }))}
                    placeholder="Select categories to help others discover your prompt"
                    disabled={saving}
                  />
                </div>

                {/* Project */}
                {user && (
                  <ProjectSelector
                    selectedProjectId={formData.project_id}
                    onProjectChange={(projectId) => setFormData(prev => ({ ...prev, project_id: projectId }))}
                    userId={user.id}
                    disabled={saving}
                  />
                )}

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
                    disabled={saving}
                    className="flex items-center gap-2 h-10"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 h-10"
                  >
                    <X size={18} />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleting}
                    className="flex items-center gap-2 h-10 ml-auto"
                  >
                    <Trash2 size={16} className="text-destructive" />
                    {deleting ? 'Deleting...' : 'Delete Prompt'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Prompt"
        description="Are you sure you want to delete this prompt? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </MainLayout>
  )
}
