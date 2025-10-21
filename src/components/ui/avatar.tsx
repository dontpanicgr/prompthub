'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
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

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null
  alt?: string
  lazy?: boolean
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Avatar.displayName = 'Avatar'

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, lazy = true, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [shouldLoad, setShouldLoad] = useState(!lazy)

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

      if (ref && 'current' in ref && ref.current) {
        observer.observe(ref.current)
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

    // Don't render if lazy loading and not in view
    if (lazy && !shouldLoad) {
      return null
    }

    // Check rate limiting for external URLs
    const shouldLoadImage = src && (!isRateLimitedDomain(src) || canMakeRequest(src))
    const optimizedSrc = src ? optimizeGoogleAvatarUrl(src) : null

    // Don't render if no src, error, not loaded yet, or rate limited
    if (!src || imageError || !imageLoaded || !shouldLoadImage) {
      return null
    }

    return (
      <img
        ref={ref}
        className={cn('aspect-square h-full w-full object-cover', className)}
        src={optimizedSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={lazy ? 'lazy' : 'eager'}
        onLoadStart={() => {
          // Record request for rate limiting
          if (src) {
            recordRequest(src)
          }
        }}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground',
        className
      )}
      {...props}
    >
      {children || <User className="h-4 w-4" />}
    </div>
  )
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
