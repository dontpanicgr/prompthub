import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(
  request: NextRequest,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
  }

  // We will authenticate using Authorization: Bearer header

  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop() as string
    const { content } = await request.json()

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const { data: userResult } = await supabase.auth.getUser()
    if (!userResult?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id)
      .eq('user_id', userResult.user.id)
      .select(`
        *,
        user:profiles!comments_user_id_fkey(id, name, avatar_url)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
  }

  // We will authenticate using Authorization: Bearer header

  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop() as string

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })

    const { data: userResult } = await supabase.auth.getUser()
    if (!userResult?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fall back to server-side moderation path using service role to bypass RLS
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    // Verify ownership first using admin (no RLS)
    const { data: commentRow, error: fetchError } = await admin
      .from('comments')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !commentRow) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (commentRow.user_id !== userResult.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: adminUpdateError } = await admin
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', id)

    if (adminUpdateError) {
      return NextResponse.json({ error: adminUpdateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
