// Authentication helper for handling both Supabase and Admin tokens
// File: src/lib/auth-helper.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface AuthResult {
  userId: string
  email: string
  isAdmin: boolean
}

export async function authenticateUser(token: string): Promise<AuthResult | null> {
  try {
    // First, try to authenticate as Supabase user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    const { data: userResult, error } = await supabase.auth.getUser()
    
    if (!error && userResult?.user?.id) {
      return {
        userId: userResult.user.id,
        email: userResult.user.email || '',
        isAdmin: false
      }
    }

    // If Supabase auth fails, try admin token
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: session, error: sessionError } = await supabaseService
      .from('admin_sessions')
      .select('email, expires_at')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return null
    }

    // Check if email is still in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
    const isAdminEmail = adminEmails.includes(session.email.toLowerCase())
    
    if (!isAdminEmail) {
      // Remove session if email is no longer admin
      await supabaseService
        .from('admin_sessions')
        .delete()
        .eq('token', token)
      
      return null
    }

    // For admin users, we need to create a virtual user ID
    // We'll use a hash of the email to create a consistent ID
    const adminUserId = `admin_${Buffer.from(session.email).toString('base64').replace(/[^a-zA-Z0-9]/g, '')}`

    return {
      userId: adminUserId,
      email: session.email,
      isAdmin: true
    }

  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}
