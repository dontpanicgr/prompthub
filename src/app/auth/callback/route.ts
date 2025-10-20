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

  // Clean up the next parameter - remove hash fragments
  const cleanNext = next.replace(/#.*$/, '') || '/'
  
  return NextResponse.redirect(`${origin}${cleanNext}`)
}
