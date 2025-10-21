'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  Bookmark,
  TrendingUp,
  Calendar,
  Eye,
  MoreHorizontal
} from 'lucide-react'

interface Bookmark {
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

export default function AdminBookmarksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Mock data
  const bookmarks: Bookmark[] = [
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
    }
  ]

  const filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bookmarks Management</h1>
        <p className="text-gray-600 mt-2">Monitor user bookmarks and saved content</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search bookmarks..."
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
                <p className="text-sm font-medium text-gray-600">Total Bookmarks</p>
                <p className="text-2xl font-bold text-gray-900">{bookmarks.length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Bookmark className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
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
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookmarks List */}
      <div className="space-y-4">
        {filteredBookmarks.map((bookmark) => (
          <Card key={bookmark.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={bookmark.user.avatar} />
                    <AvatarFallback>{bookmark.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{bookmark.user.name}</h3>
                      <span className="text-sm text-gray-500">({bookmark.user.email})</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Bookmark className="h-4 w-4 text-yellow-500" />
                      <span>bookmarked</span>
                      <span className="font-medium">"{bookmark.prompt.title}"</span>
                      <span>by</span>
                      <span className="font-medium">{bookmark.prompt.author}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(bookmark.createdAt).toLocaleString()}</span>
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

      {filteredBookmarks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No bookmarks found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
