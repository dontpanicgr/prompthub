'use client'

import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { 
  BookOpen, 
  PenTool, 
  Search, 
  Code, 
  HelpCircle, 
  Briefcase, 
  Building2, 
  User, 
  Heart, 
  Gamepad2, 
  Image, 
  Newspaper,
  Lightbulb
} from "lucide-react"

// Category icon components
const EducationIcon = ({ className }: { className?: string }) => (
  <BookOpen className={`w-4 h-4 ${className}`} />
)

const WritingIcon = ({ className }: { className?: string }) => (
  <PenTool className={`w-4 h-4 ${className}`} />
)

const ResearchIcon = ({ className }: { className?: string }) => (
  <Search className={`w-4 h-4 ${className}`} />
)

const CodeIcon = ({ className }: { className?: string }) => (
  <Code className={`w-4 h-4 ${className}`} />
)

const HowToIcon = ({ className }: { className?: string }) => (
  <HelpCircle className={`w-4 h-4 ${className}`} />
)

const WorkIcon = ({ className }: { className?: string }) => (
  <Briefcase className={`w-4 h-4 ${className}`} />
)

const BusinessIcon = ({ className }: { className?: string }) => (
  <Building2 className={`w-4 h-4 ${className}`} />
)

const PersonalIcon = ({ className }: { className?: string }) => (
  <User className={`w-4 h-4 ${className}`} />
)

const HealthIcon = ({ className }: { className?: string }) => (
  <Heart className={`w-4 h-4 ${className}`} />
)

const EntertainmentIcon = ({ className }: { className?: string }) => (
  <Gamepad2 className={`w-4 h-4 ${className}`} />
)

const MultimediaIcon = ({ className }: { className?: string }) => (
  <Image className={`w-4 h-4 ${className}`} />
)

const NewsIcon = ({ className }: { className?: string }) => (
  <Newspaper className={`w-4 h-4 ${className}`} />
)

const OtherIcon = ({ className }: { className?: string }) => (
  <Lightbulb className={`w-4 h-4 ${className}`} />
)

// Category icon mapping
const categoryIcons = {
  'education': EducationIcon,
  'writing': WritingIcon,
  'research': ResearchIcon,
  'code': CodeIcon,
  'how-to': HowToIcon,
  'work': WorkIcon,
  'business': BusinessIcon,
  'personal': PersonalIcon,
  'health': HealthIcon,
  'entertainment': EntertainmentIcon,
  'multimedia': MultimediaIcon,
  'news': NewsIcon,
  'other': OtherIcon,
} as const

export type CategoryType = keyof typeof categoryIcons

interface CategoryBadgeProps extends Omit<BadgeProps, 'children'> {
  category: { slug: string; name: string }
  showIcon?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outline' | 'transparent'
  onClick?: () => void
  onRemove?: () => void
  showRemove?: boolean
  href?: string
}

const sizeClasses = {
  xs: 'text-[11px] px-2 py-0.5 h-6',
  sm: 'text-xs px-2 py-1 h-8',
  md: 'text-sm px-3 py-1 h-10', 
  lg: 'text-base px-4 py-2 h-12'
}

export function CategoryBadge({ 
  category, 
  showIcon = true, 
  size = 'sm',
  variant = 'filled',
  className,
  onClick,
  onRemove,
  showRemove = false,
  href,
  ...props 
}: CategoryBadgeProps) {
  const IconComponent = categoryIcons[category.slug as CategoryType] || OtherIcon
  const isClickable = !!onClick || !!href

  const badgeContent = (
    <>
      {showIcon && (
        <IconComponent className="mr-1 flex-shrink-0" />
      )}
      <span className="flex-shrink-0">{category.name}</span>
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove ${category.name}`}
          className="ml-1 inline-flex items-center justify-center rounded-full hover:opacity-80 flex-shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </>
  )

  const badge = (
    <Badge
      variant={variant === 'transparent' ? 'outline' : variant === 'filled' ? 'default' : variant}
      className={cn(
        sizeClasses[size],
        isClickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        variant === 'transparent' && 'bg-transparent border-transparent hover:bg-transparent',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {badgeContent}
    </Badge>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <div data-slot="badge">
          {badge}
        </div>
      </Link>
    )
  }

  return (
    <div data-slot="badge">
      {badge}
    </div>
  )
}

export { categoryIcons }
