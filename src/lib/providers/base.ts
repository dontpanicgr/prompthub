// Base provider interface and shared utilities
// File: src/lib/providers/base.ts

export interface ProviderClient {
  suggest(args: SuggestArgs): Promise<SuggestResponse>
  chat(args: ChatArgs): Promise<ChatResponse>
  testConnection(): Promise<boolean>
}

export interface SuggestArgs {
  text: string
  variant: 'rewrite' | 'clarify' | 'shorten' | 'expand' | 'variables'
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatArgs {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface SuggestResponse {
  suggestion: string
  meta: {
    provider: string
    model: string
    tokensUsed?: number
    costUsd?: number
  }
}

export interface ChatResponse {
  content: string
  meta: {
    provider: string
    model: string
    tokensUsed?: number
    costUsd?: number
  }
}

export interface ProviderConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

// Shared HTTP utilities
export class HttpClient {
  private config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      ...config
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = this.config.baseUrl 
      ? `${this.config.baseUrl}${endpoint}`
      : endpoint

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const statusCode = response.status
        const isRetryable = statusCode >= 500 || statusCode === 429
        let safeMessage = `HTTP ${statusCode}`
        try {
          // Try to parse JSON and extract a safe error message
          const textBody = await response.text()
          // Avoid echoing secrets/tokens from provider error bodies
          if (statusCode === 401 || statusCode === 403) {
            safeMessage = statusCode === 401 ? 'Invalid API credentials' : 'Forbidden'
          } else if (textBody) {
            // Best-effort parse
            try {
              const parsed = JSON.parse(textBody)
              const msg = parsed?.error?.message || parsed?.message
              safeMessage = msg ? `${safeMessage}: ${msg}` : `${safeMessage}: ${textBody.slice(0, 200)}`
            } catch {
              safeMessage = `${safeMessage}: ${textBody.slice(0, 200)}`
            }
          }
        } catch {
          // ignore parsing errors, keep generic message
        }

        throw new ProviderError(
          safeMessage,
          'unknown',
          statusCode,
          isRetryable
        )
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ProviderError) {
        throw error
      }

      const isRetryable = error.name === 'AbortError' || 
        (error instanceof Error && error.message.includes('fetch'))
      
      if (isRetryable && retryCount < this.config.maxRetries!) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.request<T>(endpoint, options, retryCount + 1)
      }

      throw new ProviderError(
        error instanceof Error ? error.message : 'Unknown error',
        'unknown',
        undefined,
        isRetryable
      )
    }
  }
}

// Utility to generate key fingerprint for display
export function generateKeyFingerprint(apiKey: string): string {
  // Simple hash of first 8 chars for display purposes
  const hash = btoa(apiKey.substring(0, 8)).substring(0, 8)
  return hash
}

// Rate limiting utilities
export interface RateLimit {
  requestsPerDay: number
  requestsPerHour: number
  requestsPerMinute: number
}

export const DEFAULT_RATE_LIMITS: Record<string, RateLimit> = {
  managed: {
    requestsPerDay: 50,
    requestsPerHour: 10,
    requestsPerMinute: 2
  },
  byok: {
    requestsPerDay: 1000,
    requestsPerHour: 100,
    requestsPerMinute: 10
  }
}
