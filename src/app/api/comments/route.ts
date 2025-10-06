import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
  }

  // We'll handle auth via Authorization: Bearer header instead of cookies

  try {
    const { prompt_id, content, parent_id } = await request.json()

    // Support Authorization: Bearer <token> header for explicit auth
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined

    if (!prompt_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create a Supabase client that forwards the user's bearer token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Resolve the user (for user_id)
    const { data: userResult } = await supabase.auth.getUser()
    const authenticatedUserId = userResult?.user?.id
    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{ prompt_id, user_id: authenticatedUserId, content, parent_id }])
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

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
