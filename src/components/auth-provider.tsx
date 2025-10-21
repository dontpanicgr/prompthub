'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { testDatabaseConnection } from '@/lib/database'

interface AuthContextType {
  user: User | null
  loading: boolean
  signingOut: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  clearAuthState: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signingOut: false,
  signInWithGoogle: async () => {},
  signInWithGitHub: async () => {},
  signOut: async () => {},
  clearAuthState: async () => {},
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
        || (authUser as any)?.identities?.find((i: any) => i?.provider === 'github')?.identity_data?.avatar_url
        || null
      const nameFromAuth = (authUser as any)?.user_metadata?.name
        || (authUser as any)?.user_metadata?.full_name
        || (authUser as any)?.identities?.find((i: any) => i?.provider === 'google')?.identity_data?.name
        || (authUser as any)?.identities?.find((i: any) => i?.provider === 'github')?.identity_data?.name
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
    let mounted = true

    // Simple initialization that always completes
    const initialize = async () => {
      try {
        
        // Check for OAuth tokens in URL first
        if (typeof window !== 'undefined') {
          const url = window.location.href
          if (url.includes('access_token=') || url.includes('code=')) {
            // Let Supabase handle the OAuth flow
            try {
              const { data: { session }, error } = await supabase.auth.getSession()
              if (mounted && session?.user) {
                setUser(session.user)
                await syncProfileFromAuth(session.user)
                
                // Clean up the URL and redirect immediately
                const cleanUrl = window.location.pathname
                window.history.replaceState({}, document.title, cleanUrl)
                
                // Redirect immediately if on login page
                if (window.location.pathname === '/login') {
                  const urlParams = new URLSearchParams(window.location.search)
                  const redirectParam = urlParams.get('redirect')
                  const cleanRedirect = redirectParam ? redirectParam.replace(/#.*$/, '') : '/discover'
                  window.location.href = cleanRedirect
                  return
                }
              }
            } catch (oauthError) {
            }
          }
        }
        
        // Get session with timeout protection
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
        
        try {
          const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
          
          if (mounted) {
            if (error) {
              // Session error - continue without session
            } else if (session?.user) {
              setUser(session.user)
              await syncProfileFromAuth(session.user)
            }
          }
        } catch (timeoutError) {
          // Session check timed out, continuing without session
        }
        
        if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        // Auth initialization failed - continue without session
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
          if (session?.user) {
            await syncProfileFromAuth(session.user)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
    const nextParam = encodeURIComponent(currentPath || '/')
    
    // Get the appropriate redirect URL based on environment
    const getRedirectUrl = () => {
      if (typeof window === 'undefined') return 'http://localhost:3000'
      
      const origin = window.location.origin
      // For localhost development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin
      }
      // For production
      return origin
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getRedirectUrl()}/auth/callback?next=${nextParam}`,
        scopes: 'openid email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const signInWithGitHub = async () => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
    const nextParam = encodeURIComponent(currentPath || '/')
    
    // Get the appropriate redirect URL based on environment
    const getRedirectUrl = () => {
      if (typeof window === 'undefined') return 'http://localhost:3000'
      
      const origin = window.location.origin
      // For localhost development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin
      }
      // For production
      return origin
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${getRedirectUrl()}/auth/callback?next=${nextParam}`,
        scopes: 'user:email'
      }
    })
    if (error) {
      console.error('Error signing in with GitHub:', error)
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

  // Development helper to clear all auth state
  const clearAuthState = async () => {
    if (process.env.NODE_ENV === 'development') {
      setUser(null)
      setLoading(false)
      await supabase.auth.signOut()
      
      // Clear any stored session data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-' + supabase.supabaseUrl.split('//')[1].split('.')[0] + '-auth-token')
        sessionStorage.clear()
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signingOut, signInWithGoogle, signInWithGitHub, signOut, clearAuthState }}>
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
