'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { testDatabaseConnection } from '@/lib/database'

interface AuthContextType {
  user: User | null
  loading: boolean
  signingOut: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signingOut: false,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  const syncProfileFromAuth = async (authUser: User) => {
    try {
      const avatarFromAuth = (authUser as any)?.user_metadata?.avatar_url
        || (authUser as any)?.user_metadata?.picture
        || (authUser as any)?.identities?.find((i: any) => i?.provider === 'google')?.identity_data?.picture
        || null
      const nameFromAuth = (authUser as any)?.user_metadata?.name
        || (authUser as any)?.user_metadata?.full_name
        || (authUser as any)?.identities?.find((i: any) => i?.provider === 'google')?.identity_data?.name
        || null

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, name')
        .eq('id', authUser.id)
        .single()

      const needsAvatar = !profile?.avatar_url && !!avatarFromAuth
      const needsName = !profile?.name && !!nameFromAuth
      if (!needsAvatar && !needsName) return

      const update: any = { id: authUser.id, updated_at: new Date().toISOString() }
      if (needsAvatar) update.avatar_url = avatarFromAuth
      if (needsName) update.name = nameFromAuth

      await supabase.from('profiles').upsert(update)
    } catch (e) {
      console.error('Failed to sync profile from auth metadata', e)
    }
  }

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
          console.log('Found authorization code; attempting exchange (with fallback wait)')
          try {
            // Try explicit exchange first; if no verifier present, this may fail
            const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
            if (error) {
              console.warn('Explicit code exchange failed, will wait for auto-exchange:', error)
            } else if (data?.user) {
              const next = urlParams.get('next') || '/'
              window.history.replaceState({}, document.title, next)
              setUser(data.user)
              setLoading(false)
              return
            }
          } catch (e) {
            console.warn('Explicit code exchange threw, will wait for auto-exchange:', e)
          }

          // Fallback: wait briefly for supabase-js auto exchange, then clean URL
          const start = Date.now()
          while (Date.now() - start < 4000) {
            const { data } = await supabase.auth.getSession()
            if (data?.session?.user) {
              const next = urlParams.get('next') || '/'
              window.history.replaceState({}, document.title, next)
              setUser(data.session.user)
              setLoading(false)
              break
            }
            await new Promise(r => setTimeout(r, 200))
          }
          return
        }

        // Handle implicit flow (access_token and refresh_token in URL)
        if (accessToken && refreshToken) {
          console.log('Found OAuth tokens in URL parameters, setting session...')
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (!error && data?.user) {
            console.log('Session set successfully from URL parameters')
            setUser(data.user)
            setLoading(false)
            // Clean up the URL
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('access_token')
            newUrl.searchParams.delete('refresh_token')
            window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search)
          } else {
            console.error('Error setting session from URL parameters:', error)
            setLoading(false)
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
            const { data, error } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken
            })

            if (!error && data?.user) {
              console.log('Session set successfully from hash fragment')
              setUser(data.user)
              setLoading(false)
              // Clean up the URL
              window.history.replaceState({}, document.title, window.location.pathname)
            } else {
              console.error('Error setting session from hash fragment:', error)
              setLoading(false)
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
        if (session?.user) {
          await syncProfileFromAuth(session.user)
        }
      } catch (error) {
        console.error('Failed to get initial session:', error)
      } finally {
        setLoading(false)
      }
    }

		// Run initialization
		const initialize = async () => {
			// Always get session first so UI isn't blocked
			await getInitialSession()

			// In development, run the DB connection test in the background with a short timeout
			if (process.env.NODE_ENV === 'development') {
				const TIMEOUT_MS = 2000
				const timeout = new Promise<void>((resolve) => setTimeout(resolve, TIMEOUT_MS))
				// Fire-and-forget; do not block initialization
				void Promise.race([testConnection(), timeout]).catch((e) => {
					console.warn('Background Supabase connection test warning:', e)
				})
			}
		}

    initialize()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          await syncProfileFromAuth(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
    const nextParam = encodeURIComponent(currentPath || '/')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${nextParam}`,
        scopes: 'openid email profile'
      }
    })
    if (error) {
      console.error('Error signing in:', error)
    }
  }

  const signOut = async () => {
    try {
      setSigningOut(true)
      // Immediately clear user state for instant UI feedback
      setUser(null)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        // If signout failed, we might need to restore the user state
        // But for now, we'll keep it cleared since the user intended to sign out
      }
    } finally {
      setSigningOut(false)
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
