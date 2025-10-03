'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics } from '@/lib/analytics'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    mixpanel: any
  }
}

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views on route changes
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    analytics.trackPageView(url)
  }, [pathname, searchParams])

  return <>{children}</>
}

// Google Analytics setup
export function GoogleAnalytics() {
  useEffect(() => {
    const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

    if (!GA_TRACKING_ID) {
      console.warn('Google Analytics ID not found')
      return
    }

    // Load Google Analytics script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.gtag = function() {
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments)
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }

    gtag('js', new Date())
    gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector(`script[src*="googletagmanager.com"]`)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return null
}

// Mixpanel setup using mixpanel-browser package
export function MixpanelAnalytics() {
  useEffect(() => {
    const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

    if (!MIXPANEL_TOKEN) {
      console.warn('Mixpanel token not found')
      return
    }

    // Dynamically import mixpanel-browser to avoid SSR issues
    const initMixpanel = async () => {
      try {
        const mixpanel = await import('mixpanel-browser')
        
        // Initialize Mixpanel
        mixpanel.default.init(MIXPANEL_TOKEN, {
          debug: process.env.NODE_ENV === 'development',
          track_pageview: false, // We'll handle this manually
        })

        // Make it available globally for the analytics library
        window.mixpanel = mixpanel.default
        
        console.log('Mixpanel initialized successfully')
      } catch (error) {
        console.error('Failed to initialize Mixpanel:', error)
      }
    }

    // Initialize with a small delay to ensure DOM is ready
    setTimeout(initMixpanel, 100)

    return () => {
      // Cleanup if needed
      if (window.mixpanel && typeof window.mixpanel.reset === 'function') {
        try {
          window.mixpanel.reset()
        } catch (error) {
          console.error('Error resetting Mixpanel:', error)
        }
      }
    }
  }, [])

  return null
}

// Declare dataLayer for TypeScript
declare global {
  var dataLayer: any[]
}
