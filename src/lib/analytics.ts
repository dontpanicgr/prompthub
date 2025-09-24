// Analytics and monitoring utilities
type EventType = 'page_view' | 'user_action' | 'error' | 'performance'

interface EventData {
  page?: string
  action?: string
  category?: string
  label?: string
  value?: number
  custom?: Record<string, any>
}

class Analytics {
  private isEnabled = process.env.NODE_ENV === 'production'
  private events: Array<{ type: EventType; data: EventData; timestamp: number }> = []

  // Track page views
  trackPageView(page: string, additionalData?: Record<string, any>) {
    this.trackEvent('page_view', { page, ...additionalData })
  }

  // Track user actions
  trackEvent(type: EventType, data: EventData) {
    const event = {
      type,
      data: {
        ...data,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      timestamp: Date.now()
    }

    // Store locally for debugging
    this.events.push(event)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event)
    }

    // In production, you would send this to your analytics service
    if (this.isEnabled && typeof window !== 'undefined') {
      // Example: Send to Google Analytics, Mixpanel, etc.
      // gtag('event', type, data)
    }
  }

  // Track errors
  trackError(error: Error, context?: string) {
    this.trackEvent('error', {
      category: 'error',
      label: context || 'unknown',
      custom: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    })
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit = 'ms') {
    this.trackEvent('performance', {
      category: 'performance',
      label: metric,
      value,
      custom: { unit }
    })
  }

  // Get stored events (for debugging)
  getEvents() {
    return this.events
  }

  // Clear stored events
  clearEvents() {
    this.events = []
  }
}

// Singleton instance
export const analytics = new Analytics()

// Auto-track page views
if (typeof window !== 'undefined') {
  // Track initial page load
  analytics.trackPageView(window.location.pathname)

  // Track route changes (for SPA navigation)
  let currentPath = window.location.pathname
  const observer = new MutationObserver(() => {
    if (currentPath !== window.location.pathname) {
      currentPath = window.location.pathname
      analytics.trackPageView(currentPath)
    }
  })

  observer.observe(document, {
    subtree: true,
    childList: true
  })
}

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    analytics.trackError(event.error, 'global_error')
  })

  window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(
      new Error(event.reason?.toString() || 'Unhandled promise rejection'),
      'unhandled_promise_rejection'
    )
  })
}

export default analytics
