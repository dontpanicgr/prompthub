import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Handle hash fragment redirects (common with OAuth providers)
  // If no code parameter, check if this might be a hash-based redirect
  const referer = request.headers.get('referer')
  if (referer && referer.includes('#')) {
    // This might be a hash-based redirect, let the client handle it
    return NextResponse.redirect(origin)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
