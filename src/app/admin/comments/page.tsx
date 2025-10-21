'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Eye,
  MoreHorizontal
} from 'lucide-react'

interface Comment {
  id: string
  content: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  prompt: {
    id: string
    title: string
    author: string
  }
  createdAt: string
  isModerated: boolean
}

export default function AdminCommentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Mock data
  const comments: Comment[] = [
    {
      id: '1',
      content: 'This is really helpful! Thanks for sharing these patterns.',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      prompt: {
        id: '1',
        title: 'Advanced React Patterns',
        author: 'jane_smith'
      },
      createdAt: '2024-01-20T10:30:00Z',
      isModerated: false
    },
    {
      id: '2',
      content: 'Great insights! I learned a lot from this prompt.',
      user: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
      },
      prompt: {
        id: '2',
        title: 'AI Best Practices',
        author: 'mike_wilson'
      },
      createdAt: '2024-01-20T09:15:00Z',
      isModerated: true
    }
  ]

  const filteredComments = comments.filter(comment => 
    comment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comments Management</h1>
        <p className="text-gray-600 mt-2">Monitor and moderate user comments</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comments.filter(c => c.isModerated).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comments.filter(c => !c.isModerated).length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{comment.user.name}</h3>
                      <span className="text-sm text-gray-500">({comment.user.email})</span>
                      <Badge variant={comment.isModerated ? "default" : "secondary"}>
                        {comment.isModerated ? 'Moderated' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      <span>On: </span>
                      <span className="font-medium">"{comment.prompt.title}"</span>
                      <span> by {comment.prompt.author}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
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

      {filteredComments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No comments found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
