import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 30

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('prompts')
      .select(`
        id,
        title,
        body,
        model,
        creator_id,
        is_public,
        created_at,
        updated_at,
        creator:profiles(id, name, avatar_url, bio, website_url, is_private),
        prompt_categories(
          category:categories(id, slug, name, description, icon, color, sort_order)
        )
      `)
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (error || !data) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const minimal = {
      ...data,
      categories: (data as any)?.prompt_categories?.map((pc: any) => pc.category).filter(Boolean) || []
    }

    return NextResponse.json(minimal, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30, stale-while-revalidate=120'
      }
    })
  } catch (e) {
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}


