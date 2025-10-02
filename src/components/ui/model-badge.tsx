'use client'

import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Model icon components
const ChatGPTIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 512 509.639" className={className}>
    <path fill="currentColor" d="M115.612 0h280.775C459.974 0 512 52.026 512 115.612v278.415c0 63.587-52.026 115.613-115.613 115.613H115.612C52.026 509.64 0 457.614 0 394.027V115.612C0 52.026 52.026 0 115.612 0z" />
  </svg>
)

const PerplexityIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 0h16c2.21 0 4 1.79 4 4v16c0 2.21-1.79 4-4 4H4c-2.21 0-4-1.79-4-4V4c0-2.21 1.79-4 4-4z" />
  </svg>
)

const ClaudeIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
)

const GeminiIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const GrokIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
)

const OtherIcon = ({ className }: { className?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
)

// Model icon mapping
const modelIcons = {
  'ChatGPT': ChatGPTIcon,
  'Perplexity': PerplexityIcon,
  'Claude': ClaudeIcon,
  'Gemini': GeminiIcon,
  'Grok': GrokIcon,
  'Other': OtherIcon,
} as const

export type ModelType = keyof typeof modelIcons

interface ModelBadgeProps extends Omit<BadgeProps, 'children'> {
  model: ModelType | string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  onRemove?: () => void
  showRemove?: boolean
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1 h-8',
  md: 'text-sm px-3 py-1', 
  lg: 'text-base px-4 py-2'
}

export function ModelBadge({ 
  model, 
  showIcon = true, 
  size = 'sm',
  className,
  onClick,
  onRemove,
  showRemove = false,
  ...props 
}: ModelBadgeProps) {
  const IconComponent = modelIcons[model as ModelType] || OtherIcon
  const isClickable = !!onClick

  return (
    <Badge
      className={cn(
        sizeClasses[size],
        isClickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {showIcon && (
        <IconComponent className="mr-1 flex-shrink-0" />
      )}
      <span className="flex-shrink-0">{model}</span>
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label={`Remove ${model}`}
          className="ml-1 inline-flex items-center justify-center rounded-full hover:opacity-80 flex-shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </Badge>
  )
}

export { modelIcons }
