'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { 
  Palette, 
  BarChart3, 
  Zap, 
  Code, 
  Settings, 
  TestTube,
  ExternalLink,
  ArrowLeft,
  Shield,
  Lock
} from 'lucide-react'

// Add your email address here
const ADMIN_EMAILS = [
  'your-email@example.com', // Replace with your actual email
  // Add more admin emails if needed
]

const demoPages = [
  {
    title: 'Model Badge Demo',
    description: 'Visual showcase of all AI model badges with different configurations and interactive controls',
    href: '/model-badge-demo',
    icon: Palette,
    status: 'ready',
    category: 'Components'
  },
  {
    title: 'Analytics Test',
    description: 'Test page for analytics tracking and event monitoring',
    href: '/analytics-test',
    icon: BarChart3,
    status: 'ready',
    category: 'Analytics'
  },
  {
    title: 'UI Components Demo',
    description: 'Comprehensive showcase of buttons, typography, cards, and other UI components',
    href: '/ui-demo',
    icon: Code,
    status: 'ready',
    category: 'Components'
  },
  {
    title: 'Skeleton Test',
    description: 'Test page for skeleton loading states and animations',
    href: '/skeleton-test',
    icon: Zap,
    status: 'ready',
    category: 'Loading'
  }
]

const categories = [
  { name: 'Components', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { name: 'Analytics', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { name: 'Loading', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
]

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      // Not logged in, redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent('/admin')}`)
      return
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')
    setIsAuthorized(isAdmin)
    setCheckingAuth(false)

    if (!isAdmin) {
      // Not authorized, redirect to home
      router.push('/')
      return
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message (briefly before redirect)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to App
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-500" />
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Admin Only
              </Badge>
            </div>
          </div>
          <p className="text-xl text-muted-foreground">
            Demo pages, test utilities, and development tools.
            <span className="text-amber-600 dark:text-amber-400 font-medium"> Restricted to authorized administrators only.</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{demoPages.length}</p>
                  <p className="text-sm text-muted-foreground">Demo Pages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">AI Models</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-muted-foreground">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Pages Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Demo Pages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoPages.map((page) => {
              const Icon = page.icon
              return (
                <Card key={page.href} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{page.title}</CardTitle>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${categories.find(c => c.name === page.category)?.color}`}
                          >
                            {page.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {page.status}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {page.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={page.href}>
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        Open Demo
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/model-badge-demo">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Palette className="h-6 w-6" />
                <span>Model Badges</span>
              </Button>
            </Link>
            <Link href="/ui-demo">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Code className="h-6 w-6" />
                <span>UI Components</span>
              </Button>
            </Link>
            <Link href="/analytics-test">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>Analytics</span>
              </Button>
            </Link>
            <Link href="/skeleton-test">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Zap className="h-6 w-6" />
                <span>Loading States</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Development Info */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Development Information</CardTitle>
            <CardDescription>
              Useful information for developers working on this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Available Routes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• /admin - This admin dashboard</li>
                  <li>• /model-badge-demo - Model badge showcase</li>
                  <li>• /ui-demo - UI components demo</li>
                  <li>• /analytics-test - Analytics testing</li>
                  <li>• /skeleton-test - Loading states test</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tech Stack</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Next.js 15 (App Router)</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Supabase</li>
                  <li>• Lucide React Icons</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
