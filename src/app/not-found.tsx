import Link from 'next/link'
import MainLayout from '@/components/layout/main-layout'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-white">404</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Page not found</h1>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/">
                <Home size={20} className="mr-2" />
                Go back home
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/popular">
                <Search size={20} className="mr-2" />
                Browse prompts
              </Link>
            </Button>
          </div>

          {/* Help text */}
          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              If you think this is an error, please{' '}
              <Link href="/" className="text-primary hover:underline">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
