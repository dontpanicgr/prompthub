import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function MeCreatedRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/me/created')
  }
  
  redirect(`/user/${user.id}?tab=created`)
}
