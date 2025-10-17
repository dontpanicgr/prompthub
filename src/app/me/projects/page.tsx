import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function MeProjectsRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/me/projects')
  }
  
  redirect(`/user/${user.id}?tab=projects`)
}
