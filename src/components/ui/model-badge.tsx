'use client'

import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

// Model icon components using SVG logos
const GPTIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/gpt.svg" 
    alt="GPT" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const ClaudeIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/claude.svg" 
    alt="Claude" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const GeminiIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/gemini.svg" 
    alt="Gemini" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const GemmaIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/gemma.svg" 
    alt="Gemma" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const GrokIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/grok.svg" 
    alt="Grok" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const PerplexityIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/perplexity.svg" 
    alt="Perplexity" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const GitHubIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/github.svg" 
    alt="GitHub" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const CopilotIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/copilot.svg" 
    alt="Copilot" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const MistralIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/mistral.svg" 
    alt="Mistral" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const MetaIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/meta.svg" 
    alt="Meta" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const OllamaIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/ollama.svg" 
    alt="Ollama" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const CohereIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/cohere.svg" 
    alt="Cohere" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)


const QwenIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/qwen.svg" 
    alt="Qwen" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const DeepSeekIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/deepseek.svg" 
    alt="DeepSeek" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const MoonshotIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/moonshot.svg" 
    alt="Moonshot" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
  />
)

const BlackForestLabsIcon = ({ className }: { className?: string }) => (
  <img 
    src="/Logos SVG/black-forrest-labs.svg" 
    alt="Black Forest Labs" 
    className={`w-4 h-4 bg-white rounded-sm object-contain mr-2 flex-shrink-0 ${className}`}
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
  'Meta': MetaIcon,
  'Ollama': OllamaIcon,
  'Cohere': CohereIcon,
  'Qwen': QwenIcon,
  'DeepSeek': DeepSeekIcon,
  'Moonshot': MoonshotIcon,
  'Black Forest Labs': BlackForestLabsIcon,
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
  xs: 'text-[11px] px-2 py-0.5 h-6',
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