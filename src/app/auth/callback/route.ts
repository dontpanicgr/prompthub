import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(error_description || '')}`)
  }

  // Create Supabase client to handle OAuth session
  const supabase = await createClient()

  // Get the code from the URL
  const code = searchParams.get('code')
  
  if (code) {
    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=exchange_failed&description=${encodeURIComponent(exchangeError.message)}`)
    }

    if (data.session) {
      // Session created successfully, redirect to the intended destination
      const cleanNext = next.replace(/#.*$/, '') || '/'
      return NextResponse.redirect(`${origin}${cleanNext}`)
    }
  }

  // If no code or session creation failed, redirect to home
  return NextResponse.redirect(`${origin}/`)
}
