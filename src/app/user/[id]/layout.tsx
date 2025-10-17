import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase-server'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', id)
      .maybeSingle()

    const name = data?.name || 'User'
    return { title: name }
  } catch {
    return { title: 'User' }
  }
}

export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}


