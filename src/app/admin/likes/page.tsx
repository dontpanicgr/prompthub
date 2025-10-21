'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Heart,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface Like {
  id: string
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
}

export default function AdminLikesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Mock data
  const likes: Like[] = [
    {
      id: '1',
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
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
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
      createdAt: '2024-01-20T09:15:00Z'
    }
  ]

  const filteredLikes = likes.filter(like => 
    like.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    like.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    like.prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    like.prompt.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Likes Management</h1>
        <p className="text-gray-600 mt-2">Monitor user engagement through likes</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search likes..."
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
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">{likes.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
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
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Likes List */}
      <div className="space-y-4">
        {filteredLikes.map((like) => (
          <Card key={like.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={like.user.avatar} />
                    <AvatarFallback>{like.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{like.user.name}</h3>
                      <span className="text-sm text-gray-500">({like.user.email})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>liked</span>
                      <span className="font-medium">"{like.prompt.title}"</span>
                      <span>by</span>
                      <span className="font-medium">{like.prompt.author}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(like.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
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

      {filteredLikes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No likes found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
