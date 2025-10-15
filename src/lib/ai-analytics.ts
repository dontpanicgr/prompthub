// Analytics tracking for AI features
// File: src/lib/ai-analytics.ts

import { analytics } from './analytics'

export const aiAnalytics = {
  trackSuggestionRequest: (variant: string, model: string, textLength: number) => {
    analytics.trackCustomEvent('AI Suggestion Requested', {
      variant,
      model,
      textLength,
      timestamp: new Date().toISOString()
    })
  },

  trackSuggestionSuccess: (variant: string, model: string, suggestionLength: number, tokensUsed?: number) => {
    analytics.trackCustomEvent('AI Suggestion Success', {
      variant,
      model,
      suggestionLength,
      tokensUsed,
      timestamp: new Date().toISOString()
    })
  },

  trackSuggestionError: (variant: string, model: string, error: string) => {
    analytics.trackCustomEvent('AI Suggestion Error', {
      variant,
      model,
      error,
      timestamp: new Date().toISOString()
    })
  },

  trackSuggestionApplied: (variant: string, model: string, source: 'create' | 'edit' | 'details') => {
    analytics.trackCustomEvent('AI Suggestion Applied', {
      variant,
      model,
      source,
      timestamp: new Date().toISOString()
    })
  },

  trackProviderKeyAdded: (provider: string) => {
    analytics.trackCustomEvent('AI Provider Key Added', {
      provider,
      timestamp: new Date().toISOString()
    })
  },

  trackProviderKeyRemoved: (provider: string) => {
    analytics.trackCustomEvent('AI Provider Key Removed', {
      provider,
      timestamp: new Date().toISOString()
    })
  },

  trackProviderKeyTested: (provider: string, success: boolean) => {
    analytics.trackCustomEvent('AI Provider Key Tested', {
      provider,
      success,
      timestamp: new Date().toISOString()
    })
  },

  trackRateLimitHit: (provider: string, limitType: 'daily' | 'hourly' | 'minute') => {
    analytics.trackCustomEvent('AI Rate Limit Hit', {
      provider,
      limitType,
      timestamp: new Date().toISOString()
    })
  },

  trackChatRequest: (model: string, messageCount: number, totalLength: number) => {
    analytics.trackCustomEvent('AI Chat Requested', {
      model,
      messageCount,
      totalLength,
      timestamp: new Date().toISOString()
    })
  },

  trackChatSuccess: (model: string, responseLength: number, tokensUsed?: number) => {
    analytics.trackCustomEvent('AI Chat Success', {
      model,
      responseLength,
      tokensUsed,
      timestamp: new Date().toISOString()
    })
  },

  trackChatError: (model: string, error: string) => {
    analytics.trackCustomEvent('AI Chat Error', {
      model,
      error,
      timestamp: new Date().toISOString()
    })
  }
}
