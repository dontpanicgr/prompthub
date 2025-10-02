'use client'

import * as React from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrivateBadgeProps extends Omit<BadgeProps, 'children'> {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1 h-8',
  md: 'text-sm px-3 py-1', 
  lg: 'text-base px-4 py-2'
}

export function PrivateBadge({ 
  size = 'sm',
  className,
  ...props 
}: PrivateBadgeProps) {
  return (
    <Badge
      className={cn(
        sizeClasses[size],
        'bg-destructive/10 text-destructive border-destructive/30',
        className
      )}
      {...props}
    >
      <EyeOff size={14} className="mr-1" />
      Private
    </Badge>
  )
}
