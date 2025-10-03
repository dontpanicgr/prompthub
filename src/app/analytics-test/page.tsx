'use client'

import { useState } from 'react'
import { analytics } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AnalyticsTestPage() {
  const [events, setEvents] = useState<any[]>([])

  const refreshEvents = () => {
    setEvents(analytics.getEvents())
  }

  const clearEvents = () => {
    analytics.clearEvents()
    setEvents([])
  }

  const testPageView = () => {
    analytics.trackPageView('/analytics-test', { test: true })
    refreshEvents()
  }

  const testButtonClick = () => {
    analytics.trackButtonClick('Test Button', 'analytics-test-page')
    refreshEvents()
  }

  const testCustomEvent = () => {
    analytics.trackCustomEvent('Test Custom Event', { 
      testProperty: 'test-value',
      timestamp: new Date().toISOString()
    })
    refreshEvents()
  }

  const testFormSubmission = () => {
    analytics.trackFormSubmission('Test Form', true)
    refreshEvents()
  }

  const testSearch = () => {
    analytics.trackSearch('test query', 5)
    refreshEvents()
  }

  const testError = () => {
    analytics.trackError(new Error('Test error for analytics'), 'test-context')
    refreshEvents()
  }

  const testPerformance = () => {
    analytics.trackPerformance('test-metric', 150, 'ms')
    refreshEvents()
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Analytics Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Analytics Events</CardTitle>
            <CardDescription>
              Click these buttons to test different analytics events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testPageView} className="w-full">
              Test Page View
            </Button>
            <Button onClick={testButtonClick} className="w-full">
              Test Button Click
            </Button>
            <Button onClick={testCustomEvent} className="w-full">
              Test Custom Event
            </Button>
            <Button onClick={testFormSubmission} className="w-full">
              Test Form Submission
            </Button>
            <Button onClick={testSearch} className="w-full">
              Test Search
            </Button>
            <Button onClick={testError} className="w-full">
              Test Error Tracking
            </Button>
            <Button onClick={testPerformance} className="w-full">
              Test Performance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics Events</CardTitle>
            <CardDescription>
              View tracked events in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <Button onClick={refreshEvents} size="sm">
                Refresh Events
              </Button>
              <Button onClick={clearEvents} size="sm" variant="outline">
                Clear Events
              </Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No events tracked yet. Click the test buttons to see events here.
                </p>
              ) : (
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                      <div className="font-medium">{event.type}</div>
                      <div className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                      <pre className="mt-2 text-xs overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Check if your analytics environment variables are set
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Google Analytics ID:</span>{' '}
              <span className={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ? 'Set' : 'Not set'}
              </span>
            </div>
            <div>
              <span className="font-medium">Mixpanel Token:</span>{' '}
              <span className={process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ? 'Set' : 'Not set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
