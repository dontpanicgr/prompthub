// One-off script to backfill profiles.avatar_url from Supabase Auth (Google) metadata
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-avatars.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function extractAvatarFromUser(user) {
  const meta = user?.user_metadata || {}
  // Prefer explicit avatar_url, then generic picture
  const fromMetadata = meta.avatar_url || meta.picture || null
  // Try identity_data.picture for Google identity
  const googleIdentity = (user?.identities || []).find((i) => i?.provider === 'google')
  const fromGoogleIdentity = googleIdentity?.identity_data?.picture || null
  return fromMetadata || fromGoogleIdentity || null
}

async function getUsersPage(page, perPage) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
  if (error) throw error
  return data
}

async function getProfileAvatar(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') { // not found is okay
    throw error
  }
  return data?.avatar_url || null
}

async function upsertProfileAvatar(userId, avatarUrl) {
  const update = { id: userId, avatar_url: avatarUrl, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('profiles').upsert(update)
  if (error) throw error
}

async function main() {
  const perPage = 1000
  let page = 1
  let totalUpdated = 0
  let totalSeen = 0

  console.log('Starting avatar backfill...')
  // Paginate through all users
  // listUsers returns: { users, total, lastPage, page, perPage }
  // We'll iterate until page > lastPage
  // Guard: some self-hosts may not return lastPage reliably; also stop when no users
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pageData = await getUsersPage(page, perPage)
    const users = pageData?.users || []
    const lastPage = pageData?.lastPage || page

    if (users.length === 0) break

    for (const user of users) {
      totalSeen += 1
      const avatarFromAuth = extractAvatarFromUser(user)
      if (!avatarFromAuth) continue

      try {
        const current = await getProfileAvatar(user.id)
        if (!current) {
          await upsertProfileAvatar(user.id, avatarFromAuth)
          totalUpdated += 1
          console.log(`Updated avatar for ${user.id}`)
        }
      } catch (e) {
        console.warn(`Skipping ${user.id} due to error:`, e?.message || e)
      }
    }

    if (page >= lastPage) break
    page += 1
  }

  console.log(`Backfill complete. Users scanned: ${totalSeen}. Avatars updated: ${totalUpdated}.`)
}

main().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})


