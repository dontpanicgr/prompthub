'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MODEL_CONFIG } from '@/lib/model-registry'
import { 
  Bot, 
  Send, 
  Loader2,
  Activity,
  MessageSquare,
  Sparkles
} from 'lucide-react'

export default function AITestPage() {
  // AI Suggest state
  const [text, setText] = useState('Write a friendly welcome email to a new user named Alex. Keep it concise.')
  const [variant, setVariant] = useState<'rewrite' | 'clarify' | 'shorten' | 'expand' | 'variables'>('rewrite')
  const [suggestion, setSuggestion] = useState('')
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  
  // Chat state
  const [chatPrompt, setChatPrompt] = useState('Say hello in one short sentence.')
  const [chatResponse, setChatResponse] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  
  // Model selection
  const [currentModel, setCurrentModel] = useState(MODEL_CONFIG.ACTIVE_MODEL)

  // Model switching function
  const switchModel = (modelKey: string) => {
    setCurrentModel(modelKey)
    MODEL_CONFIG.ACTIVE_MODEL = modelKey // Update global config
  }

  const callSuggest = useCallback(async () => {
    try {
      setLoadingSuggest(true)
      setSuggestion('')
      
      // Get admin token from localStorage
      const adminToken = localStorage.getItem('admin_token')
      if (!adminToken) {
        throw new Error('Admin session expired. Please sign in again.')
      }

      console.log('[admin-ai-test] calling /api/ai/suggest', { variant, textLen: text.length })
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ text, variant, model: currentModel })
      })

      const body = await res.json()
      console.log('[admin-ai-test] suggest status:', res.status, 'body:', body)
      if (!res.ok) {
        throw new Error('Request failed')
      }
      setSuggestion(body.suggestion || '')
    } catch (e) {
      console.error('[admin-ai-test] suggest error:', e)
      const errorMessage = (e as Error).message
      if (errorMessage.includes('Admin session expired')) {
        // The admin layout will handle redirecting to login
        window.location.reload()
      } else {
        alert('Request failed')
      }
    } finally {
      setLoadingSuggest(false)
    }
  }, [text, variant, currentModel])

  const callChat = useCallback(async () => {
    try {
      setLoadingChat(true)
      setChatResponse('')
      
      // Get admin token from localStorage
      const adminToken = localStorage.getItem('admin_token')
      if (!adminToken) {
        throw new Error('Admin session expired. Please sign in again.')
      }

      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: chatPrompt }
      ]

      console.log('[admin-ai-test] calling /api/chat/completions', { messagesLen: messages.length })
      const res = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ messages, model: currentModel, temperature: 0.3, stream: false })
      })

      const body = await res.json()
      console.log('[admin-ai-test] chat status:', res.status, 'body:', body)
      if (!res.ok) {
        throw new Error('Request failed')
      }
      setChatResponse(body.content || '')
    } catch (e) {
      console.error('[admin-ai-test] chat error:', e)
      const errorMessage = (e as Error).message
      if (errorMessage.includes('Admin session expired')) {
        // The admin layout will handle redirecting to login
        window.location.reload()
      } else {
        alert('Request failed')
      }
    } finally {
      setLoadingChat(false)
    }
  }, [chatPrompt, currentModel])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-8 w-8" />
          AI Test
        </h1>
        <p className="text-gray-600 mt-2">Test AI Suggest and Chat endpoints with detailed logs. Open DevTools to view logs.</p>
      </div>

      {/* Model Switcher */}
      <Card className="mb-6">
        <CardContent className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Choose your model</h3>
              <p className="text-sm text-muted-foreground">Switch between free and paid models</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Suggest Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Suggest
            </CardTitle>
            <CardDescription>Test AI text suggestions with different variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text to process</Label>
              <Textarea 
                id="text"
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                className="min-h-[120px]" 
                placeholder="Enter text to process..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="variant">Variant</Label>
                <Select value={variant} onValueChange={(v: any) => setVariant(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rewrite">Rewrite</SelectItem>
                    <SelectItem value="clarify">Clarify</SelectItem>
                    <SelectItem value="shorten">Shorten</SelectItem>
                    <SelectItem value="expand">Expand</SelectItem>
                    <SelectItem value="variables">Add Variables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button 
                  onClick={callSuggest} 
                  disabled={loadingSuggest} 
                  className="w-full"
                >
                  {loadingSuggest ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {loadingSuggest ? 'Generating…' : 'Generate Suggestion'}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suggestion">Suggestion</Label>
              <Textarea 
                id="suggestion"
                readOnly 
                value={suggestion} 
                className="min-h-[120px] bg-muted/40" 
                placeholder="Generated suggestion will appear here..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Chat Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat
            </CardTitle>
            <CardDescription>Test AI chat completions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chat-prompt">Prompt</Label>
              <Input 
                id="chat-prompt"
                value={chatPrompt} 
                onChange={(e) => setChatPrompt(e.target.value)} 
                placeholder="Enter your message..."
              />
            </div>
            
            <Button 
              onClick={callChat} 
              disabled={loadingChat} 
              className="w-full"
            >
              {loadingChat ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {loadingChat ? 'Sending…' : 'Send Message'}
            </Button>
            
            <div className="space-y-2">
              <Label htmlFor="chat-response">Response</Label>
              <Textarea 
                id="chat-response"
                readOnly 
                value={chatResponse} 
                className="min-h-[120px] bg-muted/40" 
                placeholder="AI response will appear here..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
