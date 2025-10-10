'use client'

import { useState } from 'react'
import OfflineIndicator from '@/components/ui/offline-indicator'
import { useOfflineDetection } from '@/hooks/use-offline-detection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function OfflineTestPage() {
  const { isOnline } = useOfflineDetection()
  const [testResult, setTestResult] = useState<string>('')

  const testConnection = async () => {
    setTestResult('Testing...')
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setTestResult(`✅ Connection successful: ${data.status}`)
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Offline Detection Test</h1>
      
      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-500" />
                  Offline
                </>
              )}
            </CardTitle>
            <CardDescription>
              Current connection status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm">
                {isOnline ? 'Connected to the internet' : 'No internet connection'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Offline Indicator Component */}
        <Card>
          <CardHeader>
            <CardTitle>Offline Indicator Component</CardTitle>
            <CardDescription>
              This shows the offline indicator component in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OfflineIndicator showBanner={true} />
          </CardContent>
        </Card>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
            <CardDescription>
              Test the connection to our health endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testConnection} disabled={!isOnline}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
            {testResult && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <code className="text-sm">{testResult}</code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
            <CardDescription>
              Instructions for testing offline functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open your browser's Developer Tools (F12)</li>
              <li>Go to the Network tab</li>
              <li>Check "Offline" to simulate no internet connection</li>
              <li>You should see the offline indicator appear</li>
              <li>Uncheck "Offline" to restore connection</li>
              <li>You should see a "Back online!" message</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
