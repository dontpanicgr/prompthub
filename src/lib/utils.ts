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
        const { message, code, details, hint, status } = val as any
        // Some libraries (like Postgrest/Supabase) can return objects that appear empty
        // when spread due to non-enumerable properties. Fall back to toString if needed.
        const safeSpread = Object.keys(val).length > 0 ? (val as any) : { raw: String(val) }
        // Spread to capture enumerable props too
        return {
          ...safeSpread,
          ...(message ? { message } : {}),
          ...(code ? { code } : {}),
          ...(details ? { details } : {}),
          ...(hint ? { hint } : {}),
          ...(status ? { status } : {}),
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