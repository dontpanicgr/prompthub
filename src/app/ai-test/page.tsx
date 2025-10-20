'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/main-layout'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { MODEL_CONFIG, getModelDisplayName } from '@/lib/model-registry'

export default function AITestPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [text, setText] = useState('Write a friendly welcome email to a new user named Alex. Keep it concise.')
  const [variant, setVariant] = useState<'rewrite' | 'clarify' | 'shorten' | 'expand' | 'variables'>('rewrite')
  const [suggestion, setSuggestion] = useState('')
  const [chatPrompt, setChatPrompt] = useState('Say hello in one short sentence.')
  const [chatResponse, setChatResponse] = useState('')
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [currentModel, setCurrentModel] = useState(MODEL_CONFIG.ACTIVE_MODEL)

  // Handle authentication redirect
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/ai-test')}`)
    }
  }, [user, loading, router])

  // Model switching function
  const switchModel = (modelKey: string) => {
    setCurrentModel(modelKey)
    MODEL_CONFIG.ACTIVE_MODEL = modelKey
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
        </div>
      </MainLayout>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null
  }

  const callSuggest = useCallback(async () => {
    try {
      setLoadingSuggest(true)
      setSuggestion('')
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        throw new Error('Authentication expired. Please sign in again.')
      }

      console.log('[ai-test] calling /api/ai/suggest', { variant, textLen: text.length })
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        // Use current selected model - API will map to correct model ID
        body: JSON.stringify({ text, variant, model: currentModel })
      })

      const body = await res.json()
      console.log('[ai-test] suggest status:', res.status, 'body:', body)
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
        throw new Error(body?.error || 'Suggest failed')
      }
      setSuggestion(body.suggestion || '')
    } catch (e) {
      console.error('[ai-test] suggest error:', e)
      const errorMessage = (e as Error).message
      if (errorMessage.includes('Authentication expired')) {
        // Redirect to login if authentication expired
        router.push(`/login?redirect=${encodeURIComponent('/ai-test')}`)
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoadingSuggest(false)
    }
  }, [text, variant, currentModel])

  const callChat = useCallback(async () => {
    try {
      setLoadingChat(true)
      setChatResponse('')
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) {
        throw new Error('Authentication expired. Please sign in again.')
      }

      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: chatPrompt }
      ]

      console.log('[ai-test] calling /api/chat/completions', { messagesLen: messages.length })
      const res = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        // Use current selected model - API will map to correct model ID
        body: JSON.stringify({ messages, model: currentModel, temperature: 0.3, stream: false })
      })

      const body = await res.json()
      console.log('[ai-test] chat status:', res.status, 'body:', body)
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.')
        }
        throw new Error(body?.error || 'Chat failed')
      }
      setChatResponse(body.content || '')
    } catch (e) {
      console.error('[ai-test] chat error:', e)
      const errorMessage = (e as Error).message
      if (errorMessage.includes('Authentication expired')) {
        // Redirect to login if authentication expired
        router.push(`/login?redirect=${encodeURIComponent('/ai-test')}`)
      } else {
        alert(errorMessage)
      }
    } finally {
      setLoadingChat(false)
    }
  }, [chatPrompt, currentModel])

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-6 space-y-8">
        <div>
          <h1 className="mb-2 text-xl lg:text-2xl">AI Test</h1>
          <p className="text-muted-foreground">Use this page to test AI Suggest and Chat endpoints with detailed logs. Open DevTools to view logs.</p>
        </div>

        {/* Model Switcher */}
        <Card>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Choose your model</h3>
              </div>
              <div className="w-48">
                <Select value={currentModel} onValueChange={switchModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MODEL_CONFIG.PRESETS.FREE}>
                      DeepSeek V3.1 (Free)
                    </SelectItem>
                    <SelectItem value={MODEL_CONFIG.PRESETS.PAID}>
                      GPT-3.5 Turbo (Paid)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggest Test */}
        <Card>
          <CardContent className="px-6 py-6 space-y-4">
            <h2 className="text-lg font-medium">AI Suggest</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-medium">Text</label>
                <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Variant</label>
                <Select value={variant} onValueChange={(v: any) => setVariant(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rewrite">Rewrite</SelectItem>
                    <SelectItem value="clarify">Clarify</SelectItem>
                    <SelectItem value="shorten">Shorten</SelectItem>
                    <SelectItem value="expand">Expand</SelectItem>
                    <SelectItem value="variables">Add Variables</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={callSuggest} disabled={loadingSuggest} className="w-full">
                  {loadingSuggest ? 'Generating…' : 'Generate Suggestion'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Suggestion</label>
              <Textarea readOnly value={suggestion} className="min-h-[120px] bg-muted/40" />
            </div>
          </CardContent>
        </Card>

        {/* Chat Test */}
        <Card>
          <CardContent className="px-6 py-6 space-y-4">
            <h2 className="text-lg font-medium">Chat (OpenRouter via OpenAI-compatible)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-medium">Prompt</label>
                <Input value={chatPrompt} onChange={(e) => setChatPrompt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                <Button onClick={callChat} disabled={loadingChat} className="w-full">
                  {loadingChat ? 'Sending…' : 'Send'}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Response</label>
              <Textarea readOnly value={chatResponse} className="min-h-[120px] bg-muted/40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}


