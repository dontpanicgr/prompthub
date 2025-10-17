import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function MeBookmarkedRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/me/bookmarked')
  }
  
  redirect(`/user/${user.id}?tab=bookmarked`)
}
