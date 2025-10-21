import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Check if session exists and is valid
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('email, expires_at')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()


    if (error || !session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    // Check if email is still in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
    const isAdminEmail = adminEmails.includes(session.email)
    
    if (!isAdminEmail) {
      // Remove session if email is no longer admin
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('token', token)
      
      return NextResponse.json({ error: 'No longer authorized as admin' }, { status: 403 })
    }

    return NextResponse.json({ 
      valid: true,
      email: session.email
    })

  } catch (error) {
    console.error('Admin verify error')
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
