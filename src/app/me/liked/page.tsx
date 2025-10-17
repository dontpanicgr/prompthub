import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function MeLikedRedirectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/me/liked')
  }
  
  redirect(`/user/${user.id}?tab=liked`)
}
