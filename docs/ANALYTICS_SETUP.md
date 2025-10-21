# Analytics Setup Guide

This guide explains how to use the analytics system in your Lexee application.

## Environment Variables

Make sure you have the following environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_google_analytics_id
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

## Available Analytics Services

1. **Google Analytics** - For page views and basic event tracking
2. **Mixpanel** - For detailed user behavior and custom events
3. **Vercel Analytics** - For performance and usage metrics (already configured)

## How to Use Analytics

### Basic Usage

```typescript
import { analytics } from '@/lib/analytics'

// Track page views (automatically handled)
analytics.trackPageView('/your-page')

// Track custom events
analytics.trackCustomEvent('User Action', { 
  property1: 'value1',
  property2: 'value2' 
})

// Track button clicks
analytics.trackButtonClick('Button Name', 'page-location')

// Track form submissions
analytics.trackFormSubmission('Form Name', true) // true for success, false for failure

// Track search queries
analytics.trackSearch('search query', 10) // query and results count

// Track errors
analytics.trackError(new Error('Error message'), 'context')

// Track performance metrics
analytics.trackPerformance('metric-name', 150, 'ms')
```

### User Identification (Mixpanel)

```typescript
// Identify a user (for Mixpanel)
analytics.identify('user-id', {
  email: 'user@example.com',
  name: 'User Name',
  plan: 'premium'
})

// Set user properties
analytics.setUserProperties({
  lastLogin: new Date().toISOString(),
  preferences: { theme: 'dark' }
})
```

### Testing Analytics

Visit `/analytics-test` to test your analytics integration. This page allows you to:

- Test different types of events
- View tracked events in real-time
- Check if environment variables are properly set
- Clear stored events for testing

## Event Types

The analytics system supports these event types:

- `page_view` - Page navigation events
- `user_action` - User interactions (clicks, form submissions, etc.)
- `error` - Error tracking
- `performance` - Performance metrics

## Integration Examples

### In React Components

```typescript
'use client'
import { analytics } from '@/lib/analytics'

export function MyComponent() {
  const handleClick = () => {
    analytics.trackButtonClick('My Button', 'my-component')
    // Your click logic here
  }

  const handleSubmit = async (data) => {
    try {
      // Your submit logic here
      analytics.trackFormSubmission('My Form', true)
    } catch (error) {
      analytics.trackFormSubmission('My Form', false)
      analytics.trackError(error, 'my-form')
    }
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  )
}
```

### In API Routes

```typescript
import { analytics } from '@/lib/analytics'

export async function POST(request: Request) {
  try {
    // Your API logic here
    analytics.trackCustomEvent('API Call', { endpoint: '/api/endpoint' })
    return Response.json({ success: true })
  } catch (error) {
    analytics.trackError(error as Error, 'api-route')
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## Debugging

In development mode, all analytics events are logged to the console. You can also:

1. Use the analytics test page at `/analytics-test`
2. Check the browser's Network tab for outgoing requests to Google Analytics and Mixpanel
3. Use browser developer tools to inspect the `dataLayer` and `mixpanel` objects

## Production Considerations

- Analytics only sends data in production mode
- Make sure your environment variables are set in your production environment
- Test your analytics integration before deploying to production
- Consider privacy regulations (GDPR, CCPA) when implementing analytics

## Troubleshooting

1. **Events not showing up**: Check if environment variables are set correctly
2. **Google Analytics not working**: Verify your GA4 property ID is correct
3. **Mixpanel not working**: Check your project token and ensure the script loads
4. **TypeScript errors**: Make sure you have the correct type definitions installed

## Next Steps

1. Set up your Google Analytics and Mixpanel accounts
2. Add your tracking IDs to `.env.local`
3. Test the integration using `/analytics-test`
4. Add analytics tracking to your key user flows
5. Set up dashboards and alerts in your analytics platforms
