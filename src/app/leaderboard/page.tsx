'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import { getCreatorsLeaderboard, type LeaderboardCreator } from '@/lib/database'
import { Heart, Bookmark } from 'lucide-react'

export default function LeaderboardPage() {
  const [creators, setCreators] = useState<LeaderboardCreator[]>([])
  const [loading, setLoading] = useState(true)

  const medalForRank = (rank: number) => {
    if (rank === 0) return '🥇'
    if (rank === 1) return '🥈'
    if (rank === 2) return '🥉'
    return null
  }

  const timeAgo = (iso?: string | null) => {
    if (!iso) return 'a while ago'
    const then = new Date(iso).getTime()
    const now = Date.now()
    const diff = Math.max(0, now - then)
    const sec = Math.floor(diff / 1000)
    const min = Math.floor(sec / 60)
    const hr = Math.floor(min / 60)
    const day = Math.floor(hr / 24)
    const month = Math.floor(day / 30)
    const year = Math.floor(day / 365)
    if (year >= 1) return `${year} year${year > 1 ? 's' : ''} ago`
    if (month >= 1) return `${month} month${month > 1 ? 's' : ''} ago`
    if (day >= 1) return `${day} day${day > 1 ? 's' : ''} ago`
    if (hr >= 1) return `${hr} hour${hr > 1 ? 's' : ''} ago`
    if (min >= 1) return `${min} minute${min > 1 ? 's' : ''} ago`
    return 'just now'
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getCreatorsLeaderboard('overall')
        setCreators(data)
      } catch (e) {
        console.error('Failed to load leaderboard', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="mb-2 text-xl lg:text-2xl font-bold">Rankings</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Top creators by likes and bookmarks</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-14 bg-card border border-border rounded-lg animate-pulse" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No creators yet.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {creators.map((row, idx) => (
              <a
                key={row.creator.id}
                href={`/user/${row.creator.id}`}
                className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors"
              >
                {/* Left: rank badge + avatar + user name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-foreground text-background text-sm font-semibold grid place-items-center">
                    {idx + 1}
                  </div>
                  {/* User Avatar */}
                  <div className="rounded-full bg-muted flex items-center justify-center text-muted-foreground w-16 h-16 text-xl shrink-0">
                    <span className="font-semibold">{(row.creator.name || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-card-foreground flex items-center">
                      <span className="truncate">{row.creator.name || 'Unknown'}</span>
                      {medalForRank(idx) && <span className="ml-1">{medalForRank(idx)}</span>}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {row.promptsCreated} {row.promptsCreated === 1 ? 'prompt' : 'prompts'} created · Joined {timeAgo(row.joinedAt)}
                    </div>
                  </div>
                </div>

                {/* Right: likes + bookmarks (icons + counts) */}
                <div className="flex items-center gap-3 shrink-0 text-base text-card-foreground">
                  <div className="flex items-center gap-1">
                    <Heart size={20} className="text-muted-foreground" />
                    <span className="font-semibold">{row.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark size={20} className="text-muted-foreground" />
                    <span className="font-semibold">{row.bookmarks}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}


