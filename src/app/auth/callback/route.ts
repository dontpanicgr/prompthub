import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')

  // Log for debugging - show full URL and all parameters
  console.log('=== AUTH CALLBACK DEBUG ===')
  console.log('Full URL:', request.url)
  console.log('Search params:', Object.fromEntries(searchParams.entries()))
  console.log('Auth callback received:', { 
    code: !!code, 
    next, 
    error, 
    error_description,
    access_token: !!access_token,
    refresh_token: !!refresh_token
  })
  console.log('========================')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(error_description || '')}`)
  }

  // Handle authorization code flow (PKCE)
  if (code) {
    console.log('Authorization code flow detected, exchanging code for session...')
    console.log('Code to exchange:', code)
    
    try {
      const supabase = await createClient()
      console.log('Server client created, attempting code exchange...')
      
      // Perform server-side code exchange so we can redirect cleanly without the code param
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Code exchange failed:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed&description=${encodeURIComponent(error.message || 'Unknown error')}`)
      }

      console.log('Code exchange successful, user set:', !!data?.user)
      // Redirect to the intended destination without query params
      return NextResponse.redirect(`${origin}${next}`)
      
    } catch (err) {
      console.error('Exception during code exchange:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_exception&description=${encodeURIComponent(err instanceof Error ? err.message : 'Unknown error')}`)
    }
  }

  // Handle implicit flow (access_token and refresh_token in URL) - fallback
  if (access_token && refresh_token) {
    console.log('Implicit flow detected, redirecting to client for session handling')
    // For implicit flow, redirect to the client with tokens in the URL
    // The client-side auth provider will handle setting the session
    return NextResponse.redirect(`${origin}${next}?access_token=${access_token}&refresh_token=${refresh_token}`)
  }

  // Handle hash fragment redirects (common with OAuth providers)
  // If no code parameter, check if this might be a hash-based redirect
  const referer = request.headers.get('referer')
  if (referer && referer.includes('#')) {
    // This might be a hash-based redirect, let the client handle it
    return NextResponse.redirect(origin)
  }

  // Return the user to an error page with instructions
  console.log('No valid OAuth parameters found, redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
