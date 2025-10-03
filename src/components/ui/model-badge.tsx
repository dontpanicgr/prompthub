'use client'

import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

// Model icon components using TypingMind repository icons
const GPTIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/gpt-4.webp" 
    alt="GPT" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const ClaudeIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/claude.webp" 
    alt="Claude" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const GeminiIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/gemini.png" 
    alt="Gemini" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const GemmaIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/gemma.jpg" 
    alt="Gemma" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const GrokIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/grok-new.png" 
    alt="Grok" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const PerplexityIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/perplexityai.png" 
    alt="Perplexity" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const GitHubIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/github-icon.webp" 
    alt="GitHub" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const CopilotIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/copilot.png" 
    alt="Copilot" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const MistralIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/mistralai.png" 
    alt="Mistral" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const LlamaIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/llama.png" 
    alt="Llama" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const PiIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/pi-logo-192.png" 
    alt="Pi" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const CohereIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/cohere.png" 
    alt="Cohere" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const JasperIcon = ({ className }: { className?: string }) => (
  <Sparkles className={`w-4 h-4 ${className}`} />
)

const QwenIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/qwen2.png" 
    alt="Qwen" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const DeepSeekIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/deepseek.png" 
    alt="DeepSeek" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const MoonshotIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/moonshot.png" 
    alt="Moonshot" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const BlackForestLabsIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/black_forest_labs.png" 
    alt="Black Forest Labs" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const AlpacaIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/alpaca.png" 
    alt="Alpaca" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const FalconIcon = ({ className }: { className?: string }) => (
  <img 
    src="/logos/falcon.png" 
    alt="Falcon" 
    className={`w-4 h-4 object-contain ${className}`}
  />
)

const OtherIcon = ({ className }: { className?: string }) => (
  <Sparkles className={`w-4 h-4 ${className}`} />
)

// Model icon mapping with TypingMind repository icons
const modelIcons = {
  'GPT': GPTIcon,
  'Claude': ClaudeIcon,
  'Gemini': GeminiIcon,
  'Gemma': GemmaIcon,
  'Grok': GrokIcon,
  'Perplexity': PerplexityIcon,
  'GitHub': GitHubIcon,
  'Copilot': CopilotIcon,
  'Mistral': MistralIcon,
  'Llama': LlamaIcon,
  'Pi': PiIcon,
  'Cohere': CohereIcon,
  'Jasper': JasperIcon,
  'Qwen': QwenIcon,
  'DeepSeek': DeepSeekIcon,
  'Moonshot': MoonshotIcon,
  'Black Forest Labs': BlackForestLabsIcon,
  'Alpaca': AlpacaIcon,
  'Falcon': FalconIcon,
  'Other': OtherIcon,
} as const

export type ModelType = keyof typeof modelIcons

interface ModelBadgeProps extends Omit<BadgeProps, 'children'> {
  model: ModelType | string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outline' | 'transparent'
  onClick?: () => void
  onRemove?: () => void
  showRemove?: boolean
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1 h-8',
  md: 'text-sm px-3 py-1 h-10', 
  lg: 'text-base px-4 py-2 h-12'
}

export function ModelBadge({ 
  model, 
  showIcon = true, 
  size = 'sm',
  variant = 'filled',
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