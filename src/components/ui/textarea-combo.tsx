'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextareaComboProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  onSubmit: (e: React.FormEvent) => void
  isSubmitting?: boolean
  primaryButtonText?: string
  showSendButton?: boolean
  helperText?: string
  minHeight?: string
}

export function TextareaCombo({
  value,
  onChange,
  placeholder = "Write a comment...",
  disabled = false,
  className,
  onSubmit,
  isSubmitting = false,
  primaryButtonText = "Comment",
  showSendButton = true,
  helperText = "💡Markdown supported!",
  minHeight = "48px"
}: TextareaComboProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Auto-resize functionality
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      // Set height to scrollHeight to fit content
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value])

  const hasContent = value.trim().length > 0

  return (
    <div className={cn(
      "bg-card border-input rounded-md border p-4 transition-[color,box-shadow]",
      isFocused && "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      className
    )}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full text-base placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-transparent border-none outline-none resize-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{ minHeight }}
      />
      <div className="flex items-center justify-between mt-2 pt-2">
        <div className="flex items-center gap-2">
          <Button 
            type="submit" 
            disabled={!hasContent || isSubmitting}
            size="sm"
            variant={hasContent ? "default" : "outline"}
            className="h-10 gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            {primaryButtonText}
          </Button>
          {showSendButton && (
            <Button 
              type="submit" 
              disabled={!hasContent || isSubmitting}
              size="sm"
              variant="outline"
              className="h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        {helperText && (
          <div className="text-sm text-muted-foreground">
            {helperText}
          </div>
        )}
      </div>
    </div>
  )
}
