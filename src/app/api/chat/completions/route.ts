// Chat completions API endpoint for future chatbot
// File: src/app/api/chat/completions/route.ts

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
  try {
    // Parse request body
    const { messages, model: modelId, temperature = 0.7, maxTokens = 2000, stream = false } = await request.json()

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Validate message format
    for (const message of messages) {
      if (!message.role || !message.content) {
        return NextResponse.json(
          { error: 'Each message must have role and content' },
          { status: 400 }
        )
      }
      if (!['system', 'user', 'assistant'].includes(message.role)) {
        return NextResponse.json(
          { error: 'Invalid message role' },
          { status: 400 }
        )
      }
    }

    // Check total content length
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0)
    if (totalLength > 50000) {
      return NextResponse.json(
        { error: 'Total message content too long (max 50,000 characters)' },
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
    const model = modelId || 'claude-3-haiku'
    const modelInfo = getModelInfo(model)
    
    if (!modelInfo) {
      return NextResponse.json(
        { error: 'Invalid model' },
        { status: 400 }
      )
    }

    if (!validateModel(model, 'chat')) {
      return NextResponse.json(
        { error: 'Model does not support chat' },
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
    const resolvedKey = await keyResolver.resolveKey({
      userId,
      provider: modelInfo.provider,
      modelId: model
    })

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

    // Handle streaming vs non-streaming
    if (stream) {
      // For now, return non-streaming response
      // TODO: Implement proper streaming for supported providers
      const result = await provider.chat({
        messages,
        model: modelInfo.id,
        temperature,
        maxTokens,
        stream: false
      })

      // Log usage
      await keyResolver.logUsage(
        userId,
        modelInfo.provider,
        model,
        Math.floor(totalLength / 4), // Rough token estimate
        Math.floor(result.content.length / 4),
        result.meta.costUsd || 0
      )

      return NextResponse.json({
        content: result.content,
        meta: {
          ...result.meta,
          source: resolvedKey.source,
          rateLimit: rateLimitCheck
        }
      })
    } else {
      // Non-streaming response
      const result = await provider.chat({
        messages,
        model: modelInfo.id,
        temperature,
        maxTokens,
        stream: false
      })

      // Log usage
      await keyResolver.logUsage(
        userId,
        modelInfo.provider,
        model,
        Math.floor(totalLength / 4), // Rough token estimate
        Math.floor(result.content.length / 4),
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
        content: result.content,
        meta: {
          ...result.meta,
          source: resolvedKey.source,
          rateLimit: rateLimitCheck
        }
      })
    }

  } catch (error) {
    console.error('Chat completions error:', error)
    
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
