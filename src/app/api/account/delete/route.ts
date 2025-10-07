import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
  }

  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Client with user's bearer token to identify the user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: userResult, error: getUserError } = await userClient.auth.getUser()
    if (getUserError || !userResult?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = userResult.user.id

    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    // Admin client to bypass RLS and delete auth user
    const admin = createClient(supabaseUrl, serviceRoleKey)

    // Best-effort cleanup of user-owned rows before deleting auth user
    // Order: child tables first, then profile, finally auth user
    const tablesToClean = [
      { name: 'likes', column: 'user_id' },
      { name: 'bookmarks', column: 'user_id' },
      { name: 'comments', column: 'user_id' },
      { name: 'prompts', column: 'creator_id' },
      { name: 'profiles', column: 'id' },
    ] as const

    for (const t of tablesToClean) {
      await admin.from(t.name).delete().eq(t.column, userId)
      // Ignore errors for idempotency; main target is auth user deletion
    }

    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId)
    if (deleteAuthError) {
      return NextResponse.json({ error: deleteAuthError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


