'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/main-layout'
import { getCreatorsLeaderboard, type LeaderboardCreator } from '@/lib/database'
import { Heart, Bookmark, Calendar1, CalendarDays, Trophy } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

type TimePeriod = 'month' | 'year' | 'overall'

const tabs = [
  { key: 'month' as const, label: 'This Month', icon: Calendar1 },
  { key: 'year' as const, label: 'This Year', icon: CalendarDays },
  { key: 'overall' as const, label: 'Overall', icon: Trophy },
]

export default function RankingsPage() {
  const [creators, setCreators] = useState<LeaderboardCreator[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TimePeriod>('month')

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

  const loadRankings = async (timePeriod: TimePeriod) => {
    try {
      setLoading(true)
      const data = await getCreatorsLeaderboard(timePeriod)
      setCreators(data)
    } catch (e) {
      console.error('Failed to load rankings', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRankings(activeTab)
  }, [activeTab])

  const handleTabChange = (tab: TimePeriod) => {
    setActiveTab(tab)
  }

  return (
    <MainLayout>
      <div className="w-full">
        {/* Rankings Header - Edge to Edge on Mobile */}
        <div className="mb-4">
          <div className="-mx-4 lg:mx-0">
            <div className="bg-background lg:bg-transparent px-4 lg:px-0 border-b border-border">
              <div className="mb-4">
                <h1 className="mb-2 text-xl lg:text-2xl font-bold">Rankings</h1>
                <p className="text-gray-600 dark:text-gray-400">Top creators by likes and bookmarks</p>
              </div>
              
              {/* Tabs */}
              <nav className="flex space-x-6 overflow-x-auto scrollbar-hide">
                {tabs.map(({ key, label, icon: Icon }) => {
                  const isActive = activeTab === key
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleTabChange(key)}
                      className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        isActive
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
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
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors"
              >
                {/* Left: rank badge + avatar + user name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-foreground text-background text-sm font-semibold flex items-center justify-center">
                    {idx + 1}
                  </div>
                  {/* User Avatar */}
                  <Avatar className="shrink-0 h-10 w-10">
                    <AvatarImage src={row.creator.avatar_url} alt={row.creator.name || 'Unknown'} />
                    <AvatarFallback>{row.creator.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-card-foreground flex items-center">
                      <span className="truncate">{row.creator.name || 'Unknown'}</span>
                      {medalForRank(idx) && <span className="ml-1">{medalForRank(idx)}</span>}
                    </div>
                    <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      <Heart size={14} className="text-muted-foreground" />
                      <span>{row.likes} Likes</span>
                      <span>•</span>
                      <Bookmark size={14} className="text-muted-foreground" />
                      <span>{row.bookmarks} Bookmarks</span>
                    </div>
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
