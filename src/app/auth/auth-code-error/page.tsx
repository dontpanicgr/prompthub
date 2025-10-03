'use client'

import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const description = searchParams.get('description')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card text-card-foreground rounded-lg p-8 text-center border border-border">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mb-2">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">
            There was an error signing you in. This could be due to:
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error Details:</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
            {description && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">{description}</p>
            )}
          </div>
        )}

        <div className="text-left mb-6 space-y-2 text-sm text-muted-foreground">
          <p>• The authentication process was cancelled</p>
          <p>• Your session expired</p>
          <p>• There was a network error</p>
          <p>• The redirect URL is not configured correctly</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          
          <div className="text-sm text-muted-foreground">
            <p>Try signing in again, or contact support if the problem persists.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
