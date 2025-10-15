export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = process.env.NODE_ENV === 'development'
const enableDebugLogs = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true'

export function maskSecret(value: string | undefined | null, visiblePrefix: number = 4, visibleSuffix: number = 4): string {
  if (!value) return ''
  if (value.length <= visiblePrefix + visibleSuffix) return '*'.repeat(Math.max(0, value.length))
  return `${value.slice(0, visiblePrefix)}...${value.slice(-visibleSuffix)}`
}

export const logger = {
  debug: (...args: any[]) => {
    if (isDev && enableDebugLogs) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },
  info: (...args: any[]) => {
    if (isDev && enableDebugLogs) {
      // eslint-disable-next-line no-console
      console.log(...args)
    }
  },
  warn: (...args: any[]) => {
    // eslint-disable-next-line no-console
    if (isDev) console.warn(...args)
  },
  error: (...args: any[]) => {
    // Normalize common error shapes (Error, Supabase/PostgrestError, unknown)
    const normalize = (val: any) => {
      if (val instanceof Error) {
        return { name: val.name, message: val.message, stack: val.stack }
      }
      if (val && typeof val === 'object') {
        // Capture both enumerable and non-enumerable props (e.g., Supabase/PostgREST errors)
        const ownProps: Record<string, any> = {}
        try {
          for (const key of Object.getOwnPropertyNames(val)) {
            // Avoid pulling huge circular structures
            const descriptor = (val as any)[key]
            if (typeof descriptor !== 'function') ownProps[key] = descriptor
          }
        } catch {
          // ignore reflection failures
        }

        const message = (ownProps as any).message ?? (val as any).message
        const code = (ownProps as any).code ?? (val as any).code
        const details = (ownProps as any).details ?? (val as any).details
        const hint = (ownProps as any).hint ?? (val as any).hint
        const status = (ownProps as any).status ?? (val as any).status

        // Fallback string forms
        const stringForms = {
          toString: (() => {
            try { return String(val) } catch { return undefined }
          })(),
          json: (() => {
            try { return JSON.stringify(val) } catch { return undefined }
          })(),
        }

        const hasEnumerable = Object.keys(val).length > 0
        const base = hasEnumerable ? (val as any) : {}

        return {
          ...base,
          ...ownProps,
          ...(message ? { message } : {}),
          ...(code ? { code } : {}),
          ...(details ? { details } : {}),
          ...(hint ? { hint } : {}),
          ...(status ? { status } : {}),
          // Include safe fallbacks to avoid empty {}
          ...(stringForms.toString ? { raw: stringForms.toString } : {}),
          ...(stringForms.json ? { rawJson: stringForms.json } : {}),
        }
      }
      return val
    }
    // eslint-disable-next-line no-console
    console.error(...args.map(normalize))
  },
  maskSecret,
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Process mentions in comment content
export function processMentions(content: string): string {
  // Convert @username patterns to markdown links
  // This regex matches @username patterns (alphanumeric, underscore, hyphen)
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g
  
  return content.replace(mentionRegex, '[@$1](/user/$1)')
}

// Extract mentioned usernames from content
export function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g
  const mentions: string[] = []
  let match
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }
  
  return [...new Set(mentions)] // Remove duplicates
}