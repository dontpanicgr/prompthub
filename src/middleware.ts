import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Handle OAuth redirects to prevent login page flash
  const path = request.nextUrl.pathname
  const url = request.nextUrl
  
  // Skip OAuth handling in middleware - let the callback route handle it properly
  // The callback route will exchange the code for a session and redirect appropriately

  // Admin routes are handled by the admin layout component
  // No middleware redirect needed - the layout will show login form if not authenticated

  // Only perform auth lookups for protected routes to avoid stalling all requests
  const isProtected = path.startsWith('/settings') || path.startsWith('/project/')
  if (isProtected) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Example protection for other routes (currently not enforcing redirect):
      // if (!user) {
      //   return NextResponse.redirect(new URL('/', request.url))
      // }
    } catch {
      // Swallow SSR auth errors to avoid blocking navigation
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
