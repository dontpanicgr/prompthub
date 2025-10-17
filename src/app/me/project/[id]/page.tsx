import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function MeProjectRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/login?redirect=/me/project/${id}`)
  }
  
  redirect(`/project/${id}`)
}