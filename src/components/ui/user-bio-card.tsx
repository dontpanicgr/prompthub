'use client'

import Link from 'next/link'

interface UserBioCardProps {
  user: {
    id: string
    name: string
    avatar_url?: string
    bio?: string
    website_url?: string
  }
  stats: {
    prompts_created: number
    prompts_liked: number
    prompts_bookmarked: number
  }
  className?: string
}

export default function UserBioCard({ user, stats, className = '' }: UserBioCardProps) {
  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || 'U'
  }

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      <div className="flex flex-col items-start">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {getInitials(user.name)}
              </span>
            </div>
          )}
        </div>
        <div className="w-full">
          <h2 className="text-xl font-bold text-card-foreground mb-4 truncate">
            {user.name}
          </h2>
          {user.bio && (
            <p className="text-sm text-muted-foreground mb-4">
              {user.bio}
            </p>
          )}
          {user.website_url && (
            <a
              href={user.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mb-6 block"
            >
              {user.website_url}
            </a>
          )}
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="text-left">
              <p className="text-sm font-medium text-muted-foreground">Prompts</p>
              <p className="text-xl font-bold text-card-foreground">{stats.prompts_created}</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-muted-foreground">Likes</p>
              <p className="text-xl font-bold text-card-foreground">{stats.prompts_liked}</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-muted-foreground">Bookmarks</p>
              <p className="text-xl font-bold text-card-foreground">{stats.prompts_bookmarked}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
