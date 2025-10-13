import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 30

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [likesRes, bookmarksRes] = await Promise.all([
      supabase.from('likes').select('id', { count: 'exact', head: true }).eq('prompt_id', id),
      supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('prompt_id', id)
    ])

    const like_count = likesRes.count || 0
    const bookmark_count = bookmarksRes.count || 0

    return NextResponse.json({ like_count, bookmark_count }, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=120'
      }
    })
  } catch (e) {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}


