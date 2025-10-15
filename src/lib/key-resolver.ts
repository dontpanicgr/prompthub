// Key resolution service - chooses between BYOK and managed keys
// File: src/lib/key-resolver.ts

import { createClient } from '@supabase/supabase-js'
import { getModelInfo } from './model-registry'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface ResolvedKey {
  apiKey: string
  provider: string
  source: 'byok' | 'managed'
  baseUrl?: string
}

export interface KeyResolutionOptions {
  userId: string
  provider: string
  modelId?: string
}

export class KeyResolver {
  private managedKeys: Record<string, string> = {}
  private managedBaseUrls: Record<string, string> = {}

  constructor() {
    // Load managed keys from environment
    this.managedKeys = {
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      deepseek: process.env.DEEPSEEK_API_KEY || ''
    }

    this.managedBaseUrls = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      deepseek: 'https://api.deepseek.com/v1',
      openai_compatible: process.env.OPENAI_COMPAT_BASE_URL || 'http://localhost:11434/v1'
    }
  }

  async resolveKey(options: KeyResolutionOptions): Promise<ResolvedKey> {
    const { userId, provider, modelId } = options

    // First try BYOK (user's own key)
    const byokKey = await this.getBYOKKey(userId, provider)
    if (byokKey) {
      return {
        apiKey: byokKey,
        provider,
        source: 'byok',
        baseUrl: this.getBaseUrl(provider, byokKey)
      }
    }

    // Fall back to managed key
    const managedKey = this.managedKeys[provider]
    if (managedKey) {
      return {
        apiKey: managedKey,
        provider,
        source: 'managed',
        baseUrl: this.managedBaseUrls[provider]
      }
    }

    throw new Error(`No API key available for provider: ${provider}`)
  }

  private async getBYOKKey(userId: string, provider: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_provider_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('is_enabled', true)
        .single()

      if (error || !data) {
        return null
      }

      // Decrypt the key
      const masterKey = process.env.BYOK_ENC_KEY
      if (!masterKey) {
        console.warn('BYOK_ENC_KEY not configured, cannot decrypt user keys')
        return null
      }

      const { data: decryptedData, error: decryptError } = await supabase.rpc(
        'decrypt_api_key',
        { encrypted_key: data.encrypted_key, master_key: masterKey }
      )

      if (decryptError || !decryptedData) {
        console.error('Failed to decrypt user key:', decryptError)
        return null
      }

      return decryptedData
    } catch (error) {
      console.error('Error retrieving BYOK key:', error)
      return null
    }
  }

  private getBaseUrl(provider: string, apiKey?: string): string {
    // For OpenAI-compatible providers, the base URL might be stored with the key
    // or configured per user. For now, use the default.
    return this.managedBaseUrls[provider] || ''
  }

  async testKey(provider: string, apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      // Simple test request to validate the key
      const testUrl = baseUrl || this.managedBaseUrls[provider]
      const endpoint = provider === 'anthropic' ? '/messages' : '/models'
      
      const response = await fetch(`${testUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': provider === 'anthropic' 
            ? `Bearer ${apiKey}` 
            : `Bearer ${apiKey}`,
          ...(provider === 'anthropic' && { 'anthropic-version': '2023-06-01' })
        }
      })

      return response.ok
    } catch {
      return false
    }
  }

  async storeBYOKKey(
    userId: string, 
    provider: string, 
    apiKey: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const masterKey = process.env.BYOK_ENC_KEY
      if (!masterKey) {
        return { success: false, error: 'Encryption key not configured' }
      }

      // Generate fingerprint for display
      const fingerprint = this.generateFingerprint(apiKey)

      // Encrypt the key
      const { data: encryptedData, error: encryptError } = await supabase.rpc(
        'encrypt_api_key',
        { key: apiKey, master_key: masterKey }
      )

      if (encryptError || !encryptedData) {
        return { success: false, error: 'Failed to encrypt key' }
      }

      // Store in database
      const { error: insertError } = await supabase
        .from('user_provider_keys')
        .upsert({
          user_id: userId,
          provider,
          encrypted_key: encryptedData,
          key_fingerprint: fingerprint,
          is_enabled: true,
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        return { success: false, error: insertError.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async removeBYOKKey(userId: string, provider: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_provider_keys')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async getUserKeys(userId: string): Promise<Array<{
    provider: string
    fingerprint: string
    isEnabled: boolean
    lastUsedAt: string | null
  }>> {
    try {
      const { data, error } = await supabase
        .from('user_provider_keys')
        .select('provider, key_fingerprint, is_enabled, last_used_at')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching user keys:', error)
        return []
      }

      return data?.map(key => ({
        provider: key.provider,
        fingerprint: key.key_fingerprint,
        isEnabled: key.is_enabled,
        lastUsedAt: key.last_used_at
      })) || []
    } catch (error) {
      console.error('Error fetching user keys:', error)
      return []
    }
  }

  private generateFingerprint(apiKey: string): string {
    // Simple fingerprint for display - first 8 chars of base64 encoded key
    return btoa(apiKey.substring(0, 8)).substring(0, 8)
  }

  // Rate limiting helpers
  async checkRateLimit(
    userId: string, 
    provider: string, 
    source: 'byok' | 'managed'
  ): Promise<{ allowed: boolean; limit?: number; remaining?: number }> {
    try {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

      // Get usage counts
      const { data: dailyUsage } = await supabase
        .from('ai_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('provider', provider)
        .gte('created_at', oneDayAgo.toISOString())

      const { data: hourlyUsage } = await supabase
        .from('ai_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('provider', provider)
        .gte('created_at', oneHourAgo.toISOString())

      const { data: minuteUsage } = await supabase
        .from('ai_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('provider', provider)
        .gte('created_at', oneMinuteAgo.toISOString())

      const limits = source === 'byok' 
        ? { daily: 1000, hourly: 100, minute: 10 }
        : { daily: 50, hourly: 10, minute: 2 }

      const dailyCount = dailyUsage?.length || 0
      const hourlyCount = hourlyUsage?.length || 0
      const minuteCount = minuteUsage?.length || 0

      if (minuteCount >= limits.minute) {
        return { allowed: false, limit: limits.minute, remaining: 0 }
      }
      if (hourlyCount >= limits.hourly) {
        return { allowed: false, limit: limits.hourly, remaining: 0 }
      }
      if (dailyCount >= limits.daily) {
        return { allowed: false, limit: limits.daily, remaining: 0 }
      }

      return { 
        allowed: true, 
        limit: limits.daily, 
        remaining: limits.daily - dailyCount 
      }
    } catch (error) {
      console.error('Error checking rate limit:', error)
      // Allow on error to avoid blocking users
      return { allowed: true }
    }
  }

  async logUsage(
    userId: string,
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    costUsd: number
  ): Promise<void> {
    try {
      await supabase
        .from('ai_usage')
        .insert({
          user_id: userId,
          provider,
          model,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          cost_usd: costUsd
        })
    } catch (error) {
      console.error('Error logging usage:', error)
    }
  }
}

export const keyResolver = new KeyResolver()
