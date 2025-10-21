import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    
    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user }, error } = await supabase.auth.getUser()


    if (error || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Not authenticated' })
    }

    // Check if user is admin using environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
    const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '')


    return NextResponse.json({ 
      isAdmin, 
      email: user.email,
      hasAdminEmails: adminEmails.length > 0,
      adminEmails: adminEmails, // For debugging
      userEmailLower: user.email?.toLowerCase() // For debugging
    })
  } catch (error) {
    console.error('Admin check error')
    return NextResponse.json({ isAdmin: false, error: 'Server error' })
  }
}
