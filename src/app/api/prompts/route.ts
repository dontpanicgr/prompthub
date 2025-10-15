import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    // Prefer bearer token auth if provided (more reliable in dev than SSR cookies)
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

    const supabase = authHeader && authHeader.startsWith('Bearer ')
      ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false }
        })
      : await createClient()

    const body = await req.json()
    const { title, body: content, model, is_public, category_ids } = body || {}

    if (!title || !content || !model || typeof is_public !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure user authenticated (use server session)
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert prompt
    // Attempt insert including project_id; if schema mismatch occurs, retry without
    const { data: inserted, error: insertError } = await supabase
      .from('prompts')
      .insert([{ title, body: content, model, is_public, creator_id: user.id }])
      .select('*')
      .single()

    if (insertError || !inserted) {
      return NextResponse.json({ error: insertError?.message || 'Insert failed' }, { status: 400 })
    }

    // Insert categories if provided (best-effort)
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      const categoryInserts = category_ids.map((categoryId: string) => ({
        prompt_id: inserted.id,
        category_id: categoryId
      }))
      await supabase.from('prompt_categories').insert(categoryInserts)
    }

    return NextResponse.json(inserted, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


