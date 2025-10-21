'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
interface AdminMetrics {
  totalPrompts: number
  totalUsers: number
  totalLikes: number
  totalComments: number
  totalBookmarks: number
  totalProjects: number
  promptsToday: number
  usersToday: number
  likesToday: number
  commentsToday: number
  bookmarksToday: number
  projectsToday: number
  topPrompt: string
  topUser: string
  growthRate: number
}
import { 
  FileText, 
  Users, 
  Heart, 
  MessageSquare, 
  Bookmark, 
  FolderOpen,
  TrendingUp,
  Activity
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/metrics')
        if (response.ok) {
          const metrics = await response.json()
          setAnalytics(metrics)
        } else {
          console.error('Failed to fetch metrics:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Prompts',
      value: analytics.totalPrompts.toLocaleString(),
      change: `+${analytics.promptsToday} today`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Users',
      value: analytics.totalUsers.toLocaleString(),
      change: `+${analytics.usersToday} today`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Likes',
      value: analytics.totalLikes.toLocaleString(),
      change: `+${analytics.likesToday} today`,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Total Comments',
      value: analytics.totalComments.toLocaleString(),
      change: `+${analytics.commentsToday} today`,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Bookmarks',
      value: analytics.totalBookmarks.toLocaleString(),
      change: `+${analytics.bookmarksToday} today`,
      icon: Bookmark,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Projects',
      value: analytics.totalProjects.toLocaleString(),
      change: `+${analytics.projectsToday} today`,
      icon: FolderOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your platform's key metrics and performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                    <p className="text-sm text-green-600 mt-1">{metric.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Growth Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Rate
            </CardTitle>
            <CardDescription>Platform growth over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              +{analytics.growthRate}%
            </div>
            <p className="text-sm text-gray-600">
              Compared to previous month
            </p>
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Top Content
            </CardTitle>
            <CardDescription>Most popular content this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Top Prompt</p>
                <p className="text-sm text-gray-600 truncate">{analytics.topPrompt}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Top User</p>
                <p className="text-sm text-gray-600">@{analytics.topUser}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest platform activity and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New prompt created</p>
                <p className="text-xs text-gray-500">"Advanced React Patterns" by john_doe</p>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-500">jane_smith joined the platform</p>
              </div>
              <span className="text-xs text-gray-500">15 min ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-red-100 rounded-full">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">High engagement</p>
                <p className="text-xs text-gray-500">Prompt "AI Best Practices" reached 100 likes</p>
              </div>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
