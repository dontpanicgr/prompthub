import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()
    
    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Authentication failed' }, { status: 403 })
    }

    // Check if admin user exists
    const { data: adminUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (fetchError || !adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the password
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())

    if (updateError) {
      console.error('Error updating admin password')
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    // Invalidate all existing sessions for this user
    await supabase
      .from('admin_sessions')
      .delete()
      .eq('email', email.toLowerCase())

    return NextResponse.json({ 
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Admin password change error')
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
