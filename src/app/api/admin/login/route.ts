import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Check if email is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
    const isAdminEmail = adminEmails.includes(email.toLowerCase())
    
    if (!isAdminEmail) {
      return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 })
    }

    // Check if admin user exists in database
    const { data: adminUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching admin user')
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // If admin user doesn't exist, create one with default password
    if (!adminUser) {
      const defaultPassword = 'admin123' // You can change this
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)
      
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email: email.toLowerCase(),
          password_hash: hashedPassword,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating admin user')
        return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
      }

      // For new users, return the default password
      return NextResponse.json({ 
        message: 'Admin user created',
        defaultPassword: 'admin123',
        email: email
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64')
    
    // Store session in database
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        email: email.toLowerCase(),
        token: sessionToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })

    if (sessionError) {
      console.error('Error creating admin session')
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }


    return NextResponse.json({ 
      success: true,
      token: sessionToken,
      email: email
    })

  } catch (error) {
    console.error('Admin login error')
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
