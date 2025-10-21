'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Key,
  Trash2,
  Plus
} from 'lucide-react'

interface AIKey {
  id: string
  provider: string
  key: string
  status: 'active' | 'inactive' | 'testing'
  lastUsed?: string
}

export default function AITestPage() {
  const [keys, setKeys] = useState<AIKey[]>([])
  const [newKey, setNewKey] = useState({ provider: '', key: '' })
  const [testPrompt, setTestPrompt] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  const addKey = () => {
    if (newKey.provider && newKey.key) {
      const key: AIKey = {
        id: Date.now().toString(),
        provider: newKey.provider,
        key: newKey.key,
        status: 'inactive',
        lastUsed: undefined
      }
      setKeys([...keys, key])
      setNewKey({ provider: '', key: '' })
    }
  }

  const testKey = async (keyId: string) => {
    setKeys(keys.map(k => k.id === keyId ? { ...k, status: 'testing' } : k))
    
    try {
      const response = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keys.find(k => k.id === keyId)?.key })
      })
      
      const result = await response.json()
      
      setKeys(keys.map(k => 
        k.id === keyId 
          ? { ...k, status: result.success ? 'active' : 'inactive', lastUsed: new Date().toISOString() }
          : k
      ))
    } catch (error) {
      setKeys(keys.map(k => k.id === keyId ? { ...k, status: 'inactive' } : k))
    }
  }

  const testPromptWithAI = async () => {
    if (!testPrompt.trim()) return
    
    setTesting(true)
    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: testPrompt,
          model: 'gpt-3.5-turbo'
        })
      })
      
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({ error: 'Failed to test prompt' })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive': return <XCircle className="h-4 w-4 text-red-500" />
      case 'testing': return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      default: return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive': return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
      case 'testing': return <Badge className="bg-yellow-100 text-yellow-800">Testing</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Testing</h1>
        <p className="text-gray-600 mt-2">Test AI keys and prompt completions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Keys Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              AI Keys
            </CardTitle>
            <CardDescription>Manage your AI provider keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Key */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  placeholder="e.g., OpenAI, Anthropic"
                  value={newKey.provider}
                  onChange={(e) => setNewKey({ ...newKey, provider: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="key">API Key</Label>
                <Input
                  id="key"
                  type="password"
                  placeholder="Enter API key"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                />
              </div>
              <Button onClick={addKey} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Key
              </Button>
            </div>

            {/* Keys List */}
            <div className="space-y-2">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(key.status)}
                    <div>
                      <p className="font-medium">{key.provider}</p>
                      <p className="text-sm text-gray-500">
                        {key.key.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(key.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testKey(key.id)}
                      disabled={key.status === 'testing'}
                    >
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setKeys(keys.filter(k => k.id !== key.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prompt Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Prompt Testing
            </CardTitle>
            <CardDescription>Test prompts with AI models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Test Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter a prompt to test..."
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={testPromptWithAI} 
              disabled={testing || !testPrompt.trim()}
              className="w-full"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {testing ? 'Testing...' : 'Test Prompt'}
            </Button>

            {/* Test Result */}
            {testResult && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Result:</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
