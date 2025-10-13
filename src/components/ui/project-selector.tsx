'use client'

import { useState, useEffect } from 'react'
import { getProjectsByUser } from '@/lib/database'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Folder, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import type { Project } from '@/lib/database'

interface ProjectSelectorProps {
  selectedProjectId: string | null
  onProjectChange: (projectId: string | null) => void
  userId: string
  disabled?: boolean
}

export default function ProjectSelector({ 
  selectedProjectId, 
  onProjectChange, 
  userId, 
  disabled = false 
}: ProjectSelectorProps) {
  const NONE_VALUE = '__none__'
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newProject, setNewProject] = useState({
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
    if (!newProject.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setIsCreating(true)
    try {
      const { createProject } = await import('@/lib/database')
      const project = await createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim() || undefined,
        user_id: userId
      })

      if (project) {
        setProjects(prev => [...prev, project])
        onProjectChange(project.id)
        setNewProject({ name: '', description: '' })
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

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading projects..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="project-select">Project (Optional)</Label>
      <div className="flex gap-2">
        <Select 
          value={selectedProjectId ?? NONE_VALUE} 
          onValueChange={(value) => onProjectChange(value === NONE_VALUE ? null : value)}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select a project...">
              {selectedProject && (
                <div className="flex items-center gap-2">
                  {selectedProjectId ? (
                    <FolderOpen className="w-4 h-4" />
                  ) : (
                    <Folder className="w-4 h-4" />
                  )}
                  <span>{selectedProject.name}</span>
                  {selectedProject.prompt_count && selectedProject.prompt_count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({selectedProject.prompt_count})
                    </span>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span>No Project</span>
              </div>
            </SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <span>{project.name}</span>
                  {project.prompt_count && project.prompt_count > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      ({project.prompt_count})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" disabled={disabled}>
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a project to organize related prompts.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Name *</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Awesome Project"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                  rows={3}
                  maxLength={200}
                />
              </div>
              {/* Color removed */}
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateProject}
                  disabled={isCreating || !newProject.name.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
