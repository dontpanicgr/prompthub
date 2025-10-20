// AI Suggest API endpoint
// File: src/app/api/ai/suggest/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { OpenAIProvider } from '@/lib/providers/openai'
import { AnthropicProvider } from '@/lib/providers/anthropic'
import { DeepSeekProvider } from '@/lib/providers/deepseek'
import { OpenAICompatibleProvider } from '@/lib/providers/openaiCompatible'
import { keyResolver } from '@/lib/key-resolver'
import { getModelInfo, validateModel } from '@/lib/model-registry'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration')
}

export async function POST(request: NextRequest) {
  console.log('AI suggest API called')
  try {
    // Parse request body
    const { text, variant, model: modelId } = await request.json()
    console.log('Request body:', { text: text?.substring(0, 50) + '...', variant, modelId })

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too long (max 10,000 characters)' },
        { status: 400 }
      )
    }

    if (!variant || !['rewrite', 'clarify', 'shorten', 'expand', 'variables'].includes(variant)) {
      return NextResponse.json(
        { error: 'Invalid variant' },
        { status: 400 }
      )
    }

    // Get user from auth token
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    const { data: userResult } = await supabase.auth.getUser()
    const userId = userResult?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Determine model and provider
    const model = modelId || 'gpt-4o-mini'
    const modelInfo = getModelInfo(model)
    
    if (!modelInfo) {
      return NextResponse.json(
        { error: 'Invalid model' },
        { status: 400 }
      )
    }

    if (!validateModel(model, 'suggest')) {
      return NextResponse.json(
        { error: 'Model does not support suggestions' },
        { status: 400 }
      )
    }

    // Check rate limits
    const rateLimitCheck = await keyResolver.checkRateLimit(
      userId,
      modelInfo.provider,
      'managed' // We'll determine the actual source after key resolution
    )

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          limit: rateLimitCheck.limit,
          remaining: rateLimitCheck.remaining
        },
        { status: 429 }
      )
    }

    // Resolve API key
    console.log('Resolving key for provider:', modelInfo.provider)
    const resolvedKey = await keyResolver.resolveKey({
      userId,
      provider: modelInfo.provider,
      modelId: model
    })
    console.log('Resolved key source:', resolvedKey.source)

    // Create provider instance
    let provider
    switch (modelInfo.provider) {
      case 'openai':
        provider = new OpenAIProvider({
          apiKey: resolvedKey.apiKey,
          baseUrl: resolvedKey.baseUrl
        })
        break
      case 'anthropic':
        provider = new AnthropicProvider({
          apiKey: resolvedKey.apiKey,
          baseUrl: resolvedKey.baseUrl
        })
        break
      case 'deepseek':
        provider = new DeepSeekProvider({
          apiKey: resolvedKey.apiKey,
          baseUrl: resolvedKey.baseUrl
        })
        break
      case 'openai_compatible':
        provider = new OpenAICompatibleProvider({
          apiKey: resolvedKey.apiKey,
          baseUrl: resolvedKey.baseUrl
        })
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        )
    }

    // Make suggestion request
    let result
    try {
      result = await provider.suggest({
        text,
        variant,
        model: modelInfo.id,
        temperature: 0.3,
        maxTokens: 1000
      })
    } catch (e) {
      const err = e as Error
      const message = err.message || 'Upstream provider error'
      const isAuthError = /Invalid API credentials|401|invalid_api_key/i.test(message)
      const safeMessage = isAuthError
        ? 'AI provider authentication failed. Check configured API key.'
        : message
      const status = isAuthError ? 401 : 502
      return NextResponse.json({ error: safeMessage }, { status })
    }

    // Log usage
    await keyResolver.logUsage(
      userId,
      modelInfo.provider,
      model,
      Math.floor(text.length / 4), // Rough token estimate
      Math.floor(result.suggestion.length / 4),
      result.meta.costUsd || 0
    )

    // Update last used timestamp for BYOK
    if (resolvedKey.source === 'byok') {
      const supabaseService = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      await supabaseService
        .from('user_provider_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('provider', modelInfo.provider)
    }

    return NextResponse.json({
      suggestion: result.suggestion,
      meta: {
        ...result.meta,
        source: resolvedKey.source,
        rateLimit: rateLimitCheck
      }
    })

  } catch (error) {
    console.error('AI suggest error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
