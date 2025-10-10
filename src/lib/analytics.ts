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

// Declare global types for analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    mixpanel: any
    dataLayer: any[]
  }
}

class Analytics {
  private isEnabled = process.env.NODE_ENV === 'production'
  private mixpanelEnabled = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED !== 'false'
  private events: Array<{ type: EventType; data: EventData; timestamp: number }> = []
  private googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  private mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  private mixpanelRetryCount = 0
  private maxMixpanelRetries = 10

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

    // Log in development only when explicitly enabled
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true') {
      // eslint-disable-next-line no-console
      console.log('Analytics Event:', event)
    }

    // Send to analytics services
    if (typeof window !== 'undefined') {
      this.sendToGoogleAnalytics(type, data)
      this.sendToMixpanel(type, data)
    }
  }

  // Send event to Google Analytics
  private sendToGoogleAnalytics(type: EventType, data: EventData) {
    if (!this.googleAnalyticsId || !window.gtag) return

    try {
      if (type === 'page_view') {
        window.gtag('config', this.googleAnalyticsId, {
          page_title: document.title,
          page_location: window.location.href,
          page_path: data.page,
        })
      } else {
        window.gtag('event', type, {
          event_category: data.category || 'general',
          event_label: data.label,
          value: data.value,
          custom_parameters: data.custom,
        })
      }
    } catch (error) {
      console.error('Google Analytics error:', error)
    }
  }

  // Send event to Mixpanel
  private sendToMixpanel(type: EventType, data: EventData) {
    if (!this.mixpanelToken || !this.mixpanelEnabled) return

    // Check if Mixpanel is available and initialized
    if (!window.mixpanel || typeof window.mixpanel.track !== 'function') {
      if (this.mixpanelRetryCount < this.maxMixpanelRetries) {
        this.mixpanelRetryCount++
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true') {
          // eslint-disable-next-line no-console
          console.warn(`Mixpanel not ready, retrying in 1000ms (attempt ${this.mixpanelRetryCount}/${this.maxMixpanelRetries})`)
        }
        setTimeout(() => this.sendToMixpanel(type, data), 1000)
      } else if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true') {
        // eslint-disable-next-line no-console
        console.warn('Mixpanel not ready after max retries, skipping event:', type)
      }
      return
    }

    // Reset retry count on successful connection
    this.mixpanelRetryCount = 0

    try {
      const eventName = this.formatEventName(type, data)
      const properties = {
        ...data.custom,
        category: data.category,
        label: data.label,
        value: data.value,
        page: data.page,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }

      window.mixpanel.track(eventName, properties)
      
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true') {
        // eslint-disable-next-line no-console
        console.log('Mixpanel event sent:', eventName, properties)
      }
    } catch (error) {
      // Only log errors in development, don't spam production logs
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true') {
        // eslint-disable-next-line no-console
        console.warn('Mixpanel error (non-critical):', error)
      }
    }
  }

  // Format event name for Mixpanel
  private formatEventName(type: EventType, data: EventData): string {
    if (type === 'page_view') {
      return 'Page View'
    }
    if (type === 'user_action' && data.action) {
      return data.action.replace(/\s+/g, ' ').trim()
    }
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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

  // Track user identification (for Mixpanel)
  identify(userId: string, userProperties?: Record<string, any>) {
    if (typeof window !== 'undefined' && window.mixpanel && typeof window.mixpanel.identify === 'function') {
      try {
        window.mixpanel.identify(userId)
        if (userProperties && window.mixpanel.people && typeof window.mixpanel.people.set === 'function') {
          window.mixpanel.people.set(userProperties)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Mixpanel identify error:', error)
      }
    } else if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true') {
      // eslint-disable-next-line no-console
      console.warn('Mixpanel not ready for user identification')
    }
  }

  // Track user properties (for Mixpanel)
  setUserProperties(properties: Record<string, any>) {
    if (typeof window !== 'undefined' && window.mixpanel && window.mixpanel.people && typeof window.mixpanel.people.set === 'function') {
      try {
        window.mixpanel.people.set(properties)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Mixpanel set properties error:', error)
      }
    } else if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true') {
      // eslint-disable-next-line no-console
      console.warn('Mixpanel not ready for setting user properties')
    }
  }

  // Track custom events with better naming
  trackCustomEvent(eventName: string, properties?: Record<string, any>) {
    this.trackEvent('user_action', {
      action: eventName,
      custom: properties,
    })
  }

  // Track button clicks
  trackButtonClick(buttonName: string, location?: string) {
    this.trackEvent('user_action', {
      action: 'Button Click',
      category: 'engagement',
      label: buttonName,
      custom: { location },
    })
  }

  // Track form submissions
  trackFormSubmission(formName: string, success: boolean = true) {
    this.trackEvent('user_action', {
      action: 'Form Submission',
      category: 'engagement',
      label: formName,
      custom: { success },
    })
  }

  // Track search queries
  trackSearch(query: string, resultsCount?: number) {
    this.trackEvent('user_action', {
      action: 'Search',
      category: 'engagement',
      label: query,
      custom: { resultsCount },
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
