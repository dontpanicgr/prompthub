'use client'

import { useState, useRef, useEffect } from 'react'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  canMakeRequest, 
  recordRequest, 
  getCachedAvatarState, 
  setCachedAvatarState, 
  optimizeGoogleAvatarUrl,
  isRateLimitedDomain 
} from '@/lib/avatar-utils'

interface AvatarProps {
  src?: string | null
  alt: string
  fallback?: string
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  lazy?: boolean
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm', 
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
}

export default function Avatar({ 
  src, 
  alt, 
  fallback, 
  className = '', 
  size = 'md',
  lazy = true 
}: AvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  // Get initials from name or fallback
  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || fallback || 'U'
  }

  // Check cache first
  useEffect(() => {
    if (!src || !lazy) return

    const cached = getCachedAvatarState(src)
    if (cached) {
      setImageLoaded(cached.loaded)
      setImageError(cached.error)
      if (cached.loaded || cached.error) {
        setShouldLoad(true)
      }
    }
  }, [src, lazy])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !src || shouldLoad) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, src, shouldLoad])

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
    if (src) {
      setCachedAvatarState(src, true, false)
    }
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
    if (src) {
      setCachedAvatarState(src, false, true)
    }
  }

  // Don't render anything if lazy loading and not in view
  if (lazy && !shouldLoad) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          'rounded-full bg-muted flex items-center justify-center',
          sizeClasses[size],
          className
        )}
      >
        <div className="animate-pulse bg-muted-foreground/20 rounded-full w-full h-full" />
      </div>
    )
  }

  // Check rate limiting for external URLs
  const shouldLoadImage = src && (!isRateLimitedDomain(src) || canMakeRequest(src))
  const optimizedSrc = src ? optimizeGoogleAvatarUrl(src) : null

  // Show fallback if no src, error, not loaded yet, or rate limited
  if (!src || imageError || !imageLoaded || !shouldLoadImage) {
    return (
      <div 
        className={cn(
          'rounded-full bg-muted flex items-center justify-center text-muted-foreground',
          sizeClasses[size],
          className
        )}
      >
        {imageError ? (
          <User size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} />
        ) : (
          <span className="font-semibold">
            {getInitials(alt)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('rounded-full overflow-hidden', sizeClasses[size], className)}>
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={lazy ? 'lazy' : 'eager'}
        onLoadStart={() => {
          // Record request for rate limiting
          if (src) {
            recordRequest(src)
          }
        }}
      />
    </div>
  )
}
