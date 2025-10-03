'use client'

import MainLayout from '@/components/layout/main-layout'

export default function SkeletonTestPage() {
  return (
    <MainLayout>
      <div className="w-full p-6">
        <h1 className="text-2xl font-bold mb-6">Skeleton Loading Test</h1>
        
        {/* Test different skeleton card layouts */}
        <div className="space-y-8">
          
          {/* Single skeleton card */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Single Skeleton Card</h2>
            <div className="bg-card text-card-foreground rounded-lg border border-border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-4 w-3/4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Grid of skeleton cards */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Grid of Skeleton Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card text-card-foreground rounded-lg border border-border p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-4 w-3/4"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Different skeleton shapes */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Different Skeleton Shapes</h2>
            <div className="space-y-4">
              {/* Header skeleton */}
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64 mb-6"></div>
              </div>

              {/* Avatar skeleton */}
              <div className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                </div>
              </div>

              {/* Form skeleton */}
              <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>

          {/* Color comparison */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Color Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Old gray-700</h3>
                <div className="bg-card text-card-foreground rounded-lg border border-border p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">New gray-800</h3>
                <div className="bg-card text-card-foreground rounded-lg border border-border p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
