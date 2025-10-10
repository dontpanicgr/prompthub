'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { logger } from '@/lib/utils'
import { getPublicPrompts, getPopularPrompts } from '@/lib/database'
import type { Prompt } from '@/lib/database'

interface DataCacheContextType {
  // Cache for different data types
  promptsCache: { [key: string]: Prompt[] }
  lastFetch: { [key: string]: number }
  
  // Cache management functions
  getCachedPrompts: (key: string, fetcher: () => Promise<Prompt[]>, maxAge?: number) => Promise<Prompt[]>
  invalidateCache: (key?: string) => void
  isStale: (key: string, maxAge?: number) => boolean
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(undefined)

const CACHE_MAX_AGE = 5 * 60 * 1000 // 5 minutes in milliseconds

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const [promptsCache, setPromptsCache] = useState<{ [key: string]: Prompt[] }>({})
  const [lastFetch, setLastFetch] = useState<{ [key: string]: number }>({})

  const isStale = useCallback((key: string, maxAge: number = CACHE_MAX_AGE) => {
    const lastFetchTime = lastFetch[key]
    if (!lastFetchTime) return true
    return Date.now() - lastFetchTime > maxAge
  }, [lastFetch])

  const getCachedPrompts = useCallback(async (
    key: string, 
    fetcher: () => Promise<Prompt[]>, 
    maxAge: number = CACHE_MAX_AGE
  ): Promise<Prompt[]> => {
    // Return cached data if it exists and is not stale
    if (promptsCache[key] && !isStale(key, maxAge)) {
      logger.debug(`📦 Using cached data for ${key}`)
      return promptsCache[key]
    }

    // Fetch fresh data
    logger.debug(`🔄 Fetching fresh data for ${key}`)
    try {
      const data = await fetcher()
      setPromptsCache(prev => ({ ...prev, [key]: data }))
      setLastFetch(prev => ({ ...prev, [key]: Date.now() }))
      return data
    } catch (error) {
      logger.error(`❌ Error fetching data for ${key}:`, error)
      // Return cached data if available, even if stale
      return promptsCache[key] || []
    }
  }, [promptsCache, isStale])

  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      setPromptsCache(prev => {
        const newCache = { ...prev }
        delete newCache[key]
        return newCache
      })
      setLastFetch(prev => {
        const newLastFetch = { ...prev }
        delete newLastFetch[key]
        return newLastFetch
      })
      logger.debug(`🗑️ Invalidated cache for ${key}`)
    } else {
      setPromptsCache({})
      setLastFetch({})
      logger.debug(`🗑️ Invalidated all cache`)
    }
  }, [])

  return (
    <DataCacheContext.Provider value={{
      promptsCache,
      lastFetch,
      getCachedPrompts,
      invalidateCache,
      isStale
    }}>
      {children}
    </DataCacheContext.Provider>
  )
}

export const useDataCache = () => {
  const context = useContext(DataCacheContext)
  if (context === undefined) {
    throw new Error('useDataCache must be used within a DataCacheProvider')
  }
  return context
}
