/**
 * Avatar utility functions to help prevent rate limiting and optimize image loading
 */

// Cache for avatar URLs to prevent duplicate requests
const avatarCache = new Map<string, { loaded: boolean; error: boolean; timestamp: number }>()

// Rate limiting: track requests per domain
const requestTimestamps = new Map<string, number[]>()
const MAX_REQUESTS_PER_MINUTE = 10
const REQUEST_WINDOW_MS = 60000 // 1 minute

/**
 * Check if we can make a request to a domain without hitting rate limits
 */
export function canMakeRequest(url: string): boolean {
  try {
    const domain = new URL(url).hostname
    const now = Date.now()
    const timestamps = requestTimestamps.get(domain) || []
    
    // Remove timestamps older than the window
    const recentTimestamps = timestamps.filter(ts => now - ts < REQUEST_WINDOW_MS)
    
    // Update the timestamps
    requestTimestamps.set(domain, recentTimestamps)
    
    // Check if we're under the limit
    return recentTimestamps.length < MAX_REQUESTS_PER_MINUTE
  } catch {
    return true // If URL parsing fails, allow the request
  }
}

/**
 * Record a request timestamp for rate limiting
 */
export function recordRequest(url: string): void {
  try {
    const domain = new URL(url).hostname
    const now = Date.now()
    const timestamps = requestTimestamps.get(domain) || []
    timestamps.push(now)
    requestTimestamps.set(domain, timestamps)
  } catch {
    // Ignore URL parsing errors
  }
}

/**
 * Get cached avatar state
 */
export function getCachedAvatarState(url: string): { loaded: boolean; error: boolean } | null {
  const cached = avatarCache.get(url)
  if (!cached) return null
  
  // Cache expires after 5 minutes
  const CACHE_EXPIRY_MS = 5 * 60 * 1000
  if (Date.now() - cached.timestamp > CACHE_EXPIRY_MS) {
    avatarCache.delete(url)
    return null
  }
  
  return { loaded: cached.loaded, error: cached.error }
}

/**
 * Set cached avatar state
 */
export function setCachedAvatarState(url: string, loaded: boolean, error: boolean): void {
  avatarCache.set(url, {
    loaded,
    error,
    timestamp: Date.now()
  })
}

/**
 * Optimize Google profile image URL for better performance
 */
export function optimizeGoogleAvatarUrl(url: string): string {
  if (!url.includes('googleusercontent.com')) return url
  
  try {
    const urlObj = new URL(url)
    
    // Add size parameter for consistent sizing
    if (!urlObj.searchParams.has('sz')) {
      urlObj.searchParams.set('sz', '96') // 96px is a good default
    }
    
    // Add cache busting parameter to prevent stale images
    urlObj.searchParams.set('v', Date.now().toString())
    
    return urlObj.toString()
  } catch {
    return url // Return original if URL parsing fails
  }
}

/**
 * Check if an avatar URL is from a rate-limited domain
 */
export function isRateLimitedDomain(url: string): boolean {
  const rateLimitedDomains = [
    'lh3.googleusercontent.com',
    'lh4.googleusercontent.com',
    'lh5.googleusercontent.com',
    'lh6.googleusercontent.com',
    'avatars.githubusercontent.com',
    'cdn.discordapp.com'
  ]
  
  try {
    const domain = new URL(url).hostname
    return rateLimitedDomains.some(limitedDomain => domain.includes(limitedDomain))
  } catch {
    return false
  }
}

/**
 * Get a fallback avatar URL for common services
 */
export function getFallbackAvatarUrl(service: 'google' | 'github' | 'discord' | 'default'): string {
  const fallbacks = {
    google: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMjIgNTYuM0MxMi4xIDY2LjIgMCA1NyAwIDQ4VjQ4QzAgMjEuNSAyMS41IDAgNDggMHM0OCAyMS41IDQ4IDQ4djBjMCA5LjItMTIuMSAxOC4yLTIyIDguM1oiIGZpbGw9IiM0Mjg1RjQiLz4KPC9zdmc+Cjwvc3ZnPgo=',
    github: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMEM1LjM3MyAwIDAgNS4zNzMgMCAxMmMwIDUuMzAzIDMuNDM4IDkuOCA4LjIwNyAxMS4zODcuNi4xMTEuODI2LS4yNjEuODI2LS41ODNWMTguNDc0Yy0zLjMzNy43MjYtNC4wMzMtMS40MTYtNC4wMzMtMS40MTYtLjU0Ni0xLjM4Ny0xLjMzMy0xLjc1Ni0xLjMzMy0xLjc1Ni0xLjA4OS0uNzQ1LjA4My0uNzI5LjA4My0uNzI5IDEuMjA1LjA4NCAxLjgzOSAxLjIzNyAxLjgzOSAxLjIzNyAxLjA3IDEuODM0IDIuNzggMS4zMDUgMy40NjEuOTk4LjEwOC0uNzc2LjQxNy0x4MDUuNzYtMS4zNzUtMi43NjctLjQ5OS0xLjU2Ny0xLjY2OS0xLjk5NS0xLjY2OS0xLjk5NS0xLjM2MS0uOTI5LjEwNC0uOTI5LjEwNC0uOTI5IDEuNTA0LjEwNSAyLjI5NiAxLjU0NCAyLjI5NiAxLjU0NCAxLjMzMyAyLjI4NSAzLjU2NyAxLjYyNCA0LjQzIDEuMjQzLjEzNi0uOTY0LjU1LTEuNjI0IDEuMDAxLTEuOTk2LTMuNDc1LS40MDUtNy4xMzMtMS43NC03LjEzMy03Ljc0IDAtMS43MS42MTEtMy4xIDEuNjE0LTQuMTk1LS4xNjEtLjQwNS0uNjk5LTIuMDM1LjE1My00LjI0NCAwIDAgMS4zMTUtLjQzIDQuMzA4IDEuNjQ0IDEuMjUtLjM0NyAyLjU5Mi0uNTIgMy45MjUtLjUyNyAxLjMzMy4wMDcgMi42NzUuMTggMy45MjUuNTI3IDIuOTkzLTIuMDc0IDQuMzA4LTEuNjQ0IDQuMzA4LTEuNjQ0Ljg1MiAyLjIwOS4zMTQgMy44MzkuMTUzIDQuMjQ0IDEuMDA0IDEuMDk1IDEuNjE0IDIuNDg1IDEuNjE0IDQuMTk1IDAgNi4wMDItMy42NTggNy4zMzUtNy4xMzMgNy43MjIuNTY2LjQ4NiAxLjA2MiAxLjQ0NyAxLjA2MiAyLjkxNXY0LjI5MmMwIC40MzIuMjQ5LjgxNS44MjYuNTg2QzIwLjU2MiAyMS43OTcgMjQgMTcuMzAzIDI0IDEyYzAtNi42MjctNS4zNzMtMTItMTItMTJ6IiBmaWxsPSIjMjQyOTJGIi8+Cjwvc3ZnPgo8L3N2Zz4K',
    discord: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMjAuMzE3IDQuMzY5YTkuOTk5IDkuOTk5IDAgMDAtLjk5OS0uOTk5QzE3LjQ5OSAyIDEyIDIgMTIgMnMtNS40OTkgMC03LjMxOCAxLjM3YTkuOTk5IDkuOTk5IDAgMDAtLjk5OS45OTlDMiA2LjE4MSAyIDguNjgxIDIgMTJzMCA1LjgxOSAxLjM4MSA3LjYzMWMuMTgxLjMxOC40MzEuNTk5Ljk5OS45OTlDNi41MDEgMjIgMTIgMjIgMTIgMjJzNS40OTkgMCA3LjMxOC0xLjM2OWMuNTY4LS40LjgxOC0uNjgxLjk5OS0uOTk5QzIyIDE3LjgxOSAyMiAxNS4zMTkgMjIgMTJzMC01LjgxOS0xLjM4MS03LjYzMXoiIGZpbGw9IiM1ODY1RjYiLz4KPC9zdmc+Cjwvc3ZnPgo=',
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0OCIgcj0iNDgiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTQgMC0yLjIxLTEuNzktNC00LTQtMi4yMSAwLTQgMS43OS00IDQgMCAyLjIxIDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiIGZpbGw9IiM2Qjc0ODAiLz4KPC9zdmc+Cjwvc3ZnPgo='
  }
  
  return fallbacks[service] || fallbacks.default
}
