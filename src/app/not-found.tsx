import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
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
          <Button asChild>
            <Link href="/">
              <Home size={20} className="mr-2" />
              Go back home
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
  )
}
