'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getProjectsByUser, createProject, updateProject, deleteProject } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Folder, 
  FolderOpen, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Project } from '@/lib/database'

interface ProjectsManagementProps {
  userId: string
}

export default function ProjectsManagement({ userId }: ProjectsManagementProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    async function fetchProjects() {
      try {
        const userProjects = await getProjectsByUser(userId)
        setProjects(userProjects)
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProjects()
    }
  }, [userId])

  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    if (projects.length >= 20) {
      toast.error('You can only have up to 20 projects')
      return
    }

    setIsCreating(true)
    try {
      const project = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        user_id: userId
      })

      if (project) {
        setProjects(prev => [...prev, project])
        setFormData({ name: '', description: '' })
        setIsCreateDialogOpen(false)
        toast.success('Project created successfully')
      } else {
        toast.error('Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditProject = async () => {
    if (!editingProject || !formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setIsUpdating(true)
    try {
      const updatedProject = await updateProject(editingProject.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined
      })

      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p))
        setEditingProject(null)
        setFormData({ name: '', description: '' })
        setIsEditDialogOpen(false)
        toast.success('Project updated successfully')
      } else {
        toast.error('Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(true)
    try {
      const success = await deleteProject(projectId)
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        toast.success('Project deleted successfully')
      } else {
        toast.error('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingProject(null)
  }

  const handleDialogClose = () => {
    resetForm()
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Create Project Dialog (opened by the first grid card) */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Provide a name and optional description for your new project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="create-name" className="block text-sm font-medium mb-1">
                Name *
              </label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., My Awesome Project"
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="create-description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
                maxLength={200}
              />
            </div>
            {/* Color removed */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleDialogClose} disabled={isCreating}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={isCreating || !formData.name.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* First card: Create New */}
        <button
          type="button"
          onClick={() => { resetForm(); setIsCreateDialogOpen(true) }}
          disabled={projects.length >= 20}
          className="bg-card rounded-lg border border-border p-4 hover:border-foreground transition-colors duration-200 cursor-pointer text-left h-[168px] flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5" />
            <span className="text-lg font-semibold">Create Project</span>
          </div>
          <p className="text-sm text-muted-foreground mt-auto">Add a new project to organize your prompts</p>
        </button>

        {/* Project cards */}
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`/me/project/${project.id}`)}
            role="button"
            className="bg-card rounded-lg border border-border p-4 hover:border-foreground transition-colors duration-200 cursor-pointer h-[168px] flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <FolderOpen className="w-5 h-5 shrink-0" />
                <h3 className="text-lg font-semibold truncate">{project.name} ({project.prompt_count || 0})</h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => openEditDialog(project)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {project.description && (
              <p className="text-sm text-muted-foreground mb-0 line-clamp-4 mt-auto">
                {project.description.length > 120 ? `${project.description.slice(0, 120)}…` : project.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project’s name or description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                Name *
              </label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., My Awesome Project"
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
                maxLength={200}
              />
            </div>
            {/* Color removed */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleDialogClose} disabled={isUpdating}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditProject}
                disabled={isUpdating || !formData.name.trim()}
              >
                {isUpdating ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

