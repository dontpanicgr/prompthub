'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import PromptCard from '@/components/prompts/prompt-card'
import PromptList from '@/components/prompts/prompt-list'
import SearchFilters from '@/components/ui/search-filters'
import { ArrowLeft, Folder, FolderOpen, Plus, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { getProjectsByUser, getPromptsByProject, movePromptToProject, deleteProject } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { FloatingMenu } from '@/components/ui/dropdown-menu'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Prompt, Project } from '@/lib/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateProject } from '@/lib/database'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [layoutPref, setLayoutPref] = useState<'card' | 'table'>(() => {
    if (typeof window === 'undefined') return 'card'
    const pref = (localStorage.getItem('layout-preference') as 'card' | 'table' | null)
    return pref === 'table' ? 'table' : 'card'
  })
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    async function loadProjectData() {
      const { id } = await params
      
      if (!user) {
        router.push('/login')
        return
      }

      // Validate project ID format (should be a UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        console.error('Invalid project ID format:', id)
        toast.error('Invalid project ID')
        router.push(`/user/${user.id}`)
        return
      }

      try {
        setLoading(true)
        
        // Load user's projects to find the specific project
        const userProjects = await getProjectsByUser(user.id)
        const foundProject = userProjects.find(p => p.id === id)
        
        if (!foundProject) {
          toast.error('Project not found')
          router.push(`/user/${user.id}`)
          return
        }
        
        setProject(foundProject)
        
        // Load prompts for this project
        console.log('Loading prompts for project:', id)
        const projectPrompts = await getPromptsByProject(id, user.id)
        console.log('Loaded prompts:', projectPrompts.length)
        setPrompts(projectPrompts)
        setFilteredPrompts(projectPrompts)
        
      } catch (error) {
        console.error('Error loading project:', error)
        toast.error('Failed to load project')
        router.push(`/user/${user.id}`)
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [params, user, router])

  // Listen for layout preference changes
  useEffect(() => {
    const handleLayoutChange = (event: CustomEvent) => {
      setLayoutPref(event.detail.layout)
    }

    window.addEventListener('layout-preference-change', handleLayoutChange as EventListener)
    return () => window.removeEventListener('layout-preference-change', handleLayoutChange as EventListener)
  }, [])

  const handleSearch = (query: string, models: string[], categories: string[]) => {
    setSearchQuery(query)
    setSelectedModels(models)
    setSelectedCategories(categories)
    
    const filtered = prompts.filter(prompt => {
      const matchesSearch = !query || 
        prompt.title.toLowerCase().includes(query.toLowerCase()) ||
        prompt.body.toLowerCase().includes(query.toLowerCase())
      
      const matchesModel = models.length === 0 || 
        models.includes(prompt.model)
      
      const matchesCategory = categories.length === 0 ||
        (prompt.categories && prompt.categories.some(cat => categories.includes(cat.slug)))
      
      return matchesSearch && matchesModel && matchesCategory
    })
    
    setFilteredPrompts(filtered)
  }

  const handleLike = async (promptId: string) => {
    if (!user) return
    
    try {
      const { toggleLike } = await import('@/lib/database')
      const success = await toggleLike(promptId, user.id)
      
      if (success) {
        setPrompts(prev => prev.map(p => 
          p.id === promptId 
            ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 }
            : p
        ))
        setFilteredPrompts(prev => prev.map(p => 
          p.id === promptId 
            ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 }
            : p
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    }
  }

  const handleBookmark = async (promptId: string) => {
    if (!user) return
    
    try {
      const { toggleBookmark } = await import('@/lib/database')
      const success = await toggleBookmark(promptId, user.id)
      
      if (success) {
        setPrompts(prev => prev.map(p => 
          p.id === promptId 
            ? { ...p, is_bookmarked: !p.is_bookmarked, bookmark_count: p.is_bookmarked ? p.bookmark_count - 1 : p.bookmark_count + 1 }
            : p
        ))
        setFilteredPrompts(prev => prev.map(p => 
          p.id === promptId 
            ? { ...p, is_bookmarked: !p.is_bookmarked, bookmark_count: p.is_bookmarked ? p.bookmark_count - 1 : p.bookmark_count + 1 }
            : p
        ))
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to update bookmark')
    }
  }

  const handleRemoveFromProject = async (promptId: string) => {
    if (!project) return
    
    try {
      const success = await movePromptToProject(promptId, null)
      
      if (success) {
        setPrompts(prev => prev.filter(p => p.id !== promptId))
        setFilteredPrompts(prev => prev.filter(p => p.id !== promptId))
        toast.success('Prompt removed from project')
      } else {
        toast.error('Failed to remove prompt from project')
      }
    } catch (error) {
      console.error('Error removing prompt from project:', error)
      toast.error('Failed to remove prompt from project')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card text-card-foreground rounded-lg border border-border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="w-full">
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Project not found</h2>
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push(`/user/${user?.id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Prompts
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-bold text-2xl mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FloatingMenu
                align="end"
                trigger={
                  <Button variant="outline" size="icon" aria-label="Project actions" className="w-10 h-10 bg-card">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                }
                items={[
                  {
                    label: 'Edit',
                    icon: <Pencil className="w-4 h-4" />,
                    onClick: () => {
                      if (!project) return
                      setEditName(project.name)
                      setEditDescription(project.description || '')
                      setIsEditOpen(true)
                    }
                  },
                  { separator: true, label: 'separator' },
                  {
                    label: 'Delete',
                    icon: <Trash2 className="w-4 h-4" />,
                    variant: 'destructive',
                    onClick: () => setConfirmDeleteOpen(true)
                  }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="mb-6">
          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            onSearch={handleSearch}
            placeholder="Search prompts in this project..."
          />
        </div>

        {/* Prompts */}
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchQuery || selectedModels.length > 0 ? (
                <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
              ) : (
                <FileText className="w-16 h-16 mx-auto" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || selectedModels.length > 0 ? 'No prompts found' : 'No prompts in this project yet'}
            </h3>
            <p className="text-gray-400">
              {searchQuery || selectedModels.length > 0 
                ? 'Try adjusting your search or filter criteria.'
                : 'Add prompts to this project to get started.'
              }
            </p>
            {!searchQuery && selectedModels.length === 0 && (
              <div className="mt-4">
                <Button onClick={() => router.push('/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Prompt
                </Button>
              </div>
            )}
          </div>
        ) : (
          layoutPref === 'table' ? (
            <PromptList 
              prompts={filteredPrompts} 
              loading={false} 
              onLike={handleLike} 
              onBookmark={handleBookmark}
              showProjectActions={true}
              onRemoveFromProject={handleRemoveFromProject}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  showProjectActions={true}
                  onRemoveFromProject={handleRemoveFromProject}
                />
              ))}
            </div>
          )
        )}
      </div>
      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete project?"
        description="This will permanently delete the project. Prompts will remain but be unassigned."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleting}
        onConfirm={async () => {
          if (!project) return
          try {
            setDeleting(true)
            const ok = await deleteProject(project.id)
            if (ok) {
              toast.success('Project deleted')
              router.push(`/user/${user?.id}`)
            } else {
              toast.error('Failed to delete project')
            }
          } catch (e) {
            console.error(e)
            toast.error('Failed to delete project')
          } finally {
            setDeleting(false)
          }
        }}
      />
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Change the project name or description and save your updates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="proj-edit-name" className="block text-sm font-medium mb-1">Name *</label>
              <Input
                id="proj-edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="proj-edit-desc" className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                id="proj-edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!project) return
                  if (!editName.trim()) {
                    toast.error('Project name is required')
                    return
                  }
                  try {
                    setIsUpdating(true)
                    const updated = await updateProject(project.id, {
                      name: editName.trim(),
                      description: editDescription.trim() || undefined,
                    })
                    if (updated) {
                      setProject(updated)
                      toast.success('Project updated')
                      setIsEditOpen(false)
                    } else {
                      toast.error('Failed to update project')
                    }
                  } catch (err) {
                    console.error('Error updating project:', err)
                    toast.error('Failed to update project')
                  } finally {
                    setIsUpdating(false)
                  }
                }}
                disabled={isUpdating || !editName.trim()}
              >
                {isUpdating ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
