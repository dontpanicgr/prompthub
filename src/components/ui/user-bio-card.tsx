'use client'

import Link from 'next/link'

interface UserBioCardProps {
  user: {
    id: string
    name: string
    avatar_url?: string
    bio?: string
    website_url?: string
    is_private?: boolean
  }
  stats: {
    prompts_created: number
    likes_received: number
    bookmarks_received: number
  }
  className?: string
  showStats?: boolean
}

export default function UserBioCard({ user, stats, className = '', showStats = true }: UserBioCardProps) {
  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || 'U'
  }

  return (
    <div className={`bg-card rounded-lg border border-border p-6 hover:border-foreground transition-all duration-200 cursor-pointer ${className}`}>
      <Link href={`/user/${user.id}`} className="block">
        <div className="flex flex-col items-start">
          <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex items-center justify-center mb-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl font-semibold text-foreground">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
          </div>
          <div className="w-full">
          <h2 className="text-xl font-semibold text-card-foreground truncate mb-2">
            {user.name}
          </h2>
          {user.is_private && (
            <span className="inline-flex items-center rounded-md border border-red-500/40 text-red-600 dark:text-red-400 px-2 py-0.5 text-xs font-medium mb-3 bg-transparent">
              Private
            </span>
          )}
            {user.bio && (
              <p className="text-sm text-muted-foreground mb-4">
                {user.bio}
              </p>
            )}
            {showStats && (
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">Prompts</p>
                  <p className="text-xl font-semibold text-card-foreground">{stats.prompts_created}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">Likes</p>
                  <p className="text-xl font-semibold text-card-foreground">{stats.likes_received}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-muted-foreground">Bookmarks</p>
                  <p className="text-xl font-semibold text-card-foreground">{stats.bookmarks_received}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
      {user.website_url && (
        <a
          href={user.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline mt-4 block"
          onClick={(e) => e.stopPropagation()}
        >
          {user.website_url}
        </a>
      )}
    </div>
  )
}
