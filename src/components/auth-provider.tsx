'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { testDatabaseConnection } from '@/lib/database'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        const dbConnected = await testDatabaseConnection()
        if (dbConnected) {
          console.log('Database connection test successful')
        } else {
          console.error('Database connection test failed')
        }
      } catch (error) {
        console.error('Supabase connection failed:', error)
      }
    }

    // Handle OAuth redirects (both hash fragments and URL parameters)
    const handleOAuthRedirect = async () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')

        // Handle PKCE authorization code flow
        if (code) {
          console.log('Found authorization code in URL, exchanging for session...')
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            
            if (error) {
              console.error('Code exchange error:', error)
            } else {
              console.log('Code exchange successful!')
              console.log('Session data:', data)
            }
            
            // Clean up the URL
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('code')
            window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search)
            return
          } catch (err) {
            console.error('Exception during code exchange:', err)
            return
          }
        }

        // Handle implicit flow (access_token and refresh_token in URL)
        if (accessToken && refreshToken) {
          console.log('Found OAuth tokens in URL parameters, setting session...')
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (!error) {
            console.log('Session set successfully from URL parameters')
            // Clean up the URL
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('access_token')
            newUrl.searchParams.delete('refresh_token')
            window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search)
          } else {
            console.error('Error setting session from URL parameters:', error)
          }
          return
        }

        // Check hash fragment (fallback)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const hashAccessToken = hashParams.get('access_token')
          const hashRefreshToken = hashParams.get('refresh_token')

          if (hashAccessToken && hashRefreshToken) {
            console.log('Found OAuth tokens in hash fragment, setting session...')
            const { error } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken
            })

            if (!error) {
              console.log('Session set successfully from hash fragment')
              // Clean up the URL
              window.history.replaceState({}, document.title, window.location.pathname)
            } else {
              console.error('Error setting session from hash fragment:', error)
            }
          }
        }
      }
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        await handleOAuthRedirect()
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else {
          console.log('Session retrieved successfully:', !!session)
        }
        
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to get initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    // Run initialization
    const initialize = async () => {
      if (process.env.NODE_ENV === 'development') {
        await testConnection()
      }
      await getInitialSession()
    }

    initialize()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      console.error('Error signing in:', error)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
