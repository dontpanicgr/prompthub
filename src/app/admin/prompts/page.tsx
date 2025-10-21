'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  TrendingUp,
  Heart,
  MessageSquare
} from 'lucide-react'

interface Prompt {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  likes: number
  comments: number
  bookmarks: number
  views: number
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export default function AdminPromptsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Mock data - in a real app, this would come from an API
  const prompts: Prompt[] = [
    {
      id: '1',
      title: 'Advanced React Patterns',
      content: 'A comprehensive guide to advanced React patterns including render props, higher-order components, and custom hooks...',
      author: 'john_doe',
      authorEmail: 'john@example.com',
      likes: 156,
      comments: 23,
      bookmarks: 89,
      views: 1247,
      category: 'React',
      tags: ['react', 'patterns', 'hooks'],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      isPublic: true
    },
    {
      id: '2',
      title: 'AI Best Practices',
      content: 'Essential best practices for working with AI models and prompt engineering...',
      author: 'jane_smith',
      authorEmail: 'jane@example.com',
      likes: 234,
      comments: 45,
      bookmarks: 156,
      views: 2103,
      category: 'AI',
      tags: ['ai', 'prompting', 'best-practices'],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      isPublic: true
    },
    {
      id: '3',
      title: 'TypeScript Tips',
      content: 'Advanced TypeScript techniques and tips for better type safety...',
      author: 'mike_wilson',
      authorEmail: 'mike@example.com',
      likes: 89,
      comments: 12,
      bookmarks: 34,
      views: 567,
      category: 'TypeScript',
      tags: ['typescript', 'types', 'advanced'],
      createdAt: '2024-01-12',
      updatedAt: '2024-01-15',
      isPublic: false
    }
  ]

  const categories = ['all', 'React', 'AI', 'TypeScript', 'JavaScript', 'Python']

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Prompts Management</h1>
        <p className="text-gray-600 mt-2">Manage and moderate all prompts on the platform</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prompts</p>
                <p className="text-2xl font-bold text-gray-900">{prompts.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Public</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prompts.filter(p => p.isPublic).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prompts.reduce((sum, p) => sum + p.likes, 0)}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prompts.reduce((sum, p) => sum + p.comments, 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
                    <Badge variant={prompt.isPublic ? "default" : "secondary"}>
                      {prompt.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    <Badge variant="outline">{prompt.category}</Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{prompt.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>By {prompt.author} ({prompt.authorEmail})</span>
                    <span>•</span>
                    <span>Created {new Date(prompt.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Updated {new Date(prompt.updatedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {prompt.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {prompt.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {prompt.views}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-3">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No prompts found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
