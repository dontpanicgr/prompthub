// SuggestionDialog component for AI suggestions
// File: src/components/ui/suggestion-dialog.tsx

'use client'

import { useState, useCallback, useMemo } from 'react'
import { Wand2, Loader2, Check, X, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface SuggestionDialogProps {
  initialText: string
  onApply: (suggestion: string) => void
  trigger?: React.ReactNode
  defaultVariant?: 'rewrite' | 'clarify' | 'shorten' | 'expand' | 'variables'
}

const VARIANTS = [
  { value: 'rewrite', label: 'Rewrite', description: 'Improve clarity and structure' },
  { value: 'clarify', label: 'Clarify', description: 'Remove ambiguity and add context' },
  { value: 'shorten', label: 'Shorten', description: 'Make more concise' },
  { value: 'expand', label: 'Expand', description: 'Add detail and examples' },
  { value: 'variables', label: 'Add Variables', description: 'Make reusable with placeholders' }
]

export default function SuggestionDialog({ 
  initialText, 
  onApply, 
  trigger,
  defaultVariant = 'rewrite'
}: SuggestionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [variant, setVariant] = useState(defaultVariant)
  const [showDiff, setShowDiff] = useState(false)
  const [error, setError] = useState('')

  const handleSuggest = useCallback(async () => {
    if (!initialText.trim()) {
      toast.error('Please enter some text to improve')
      return
    }

    setLoading(true)
    setError('')
    setSuggestion('')

    try {
      // Get user session for auth
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          text: initialText,
          variant,
          model: 'gpt-4o-mini'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get suggestion')
      }

      const result = await response.json()
      setSuggestion(result.suggestion)
      
      toast.success('Suggestion generated!')
    } catch (error) {
      console.error('Suggestion error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get suggestion'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [initialText, variant])

  const handleApply = useCallback(() => {
    if (suggestion) {
      onApply(suggestion)
      setOpen(false)
      toast.success('Suggestion applied!')
    }
  }, [suggestion, onApply])

  const handleReset = useCallback(() => {
    setSuggestion('')
    setError('')
    setShowDiff(false)
  }, [])

  const renderDiff = useMemo(() => {
    if (!suggestion) return null

    const originalLines = initialText.split('\n')
    const suggestionLines = suggestion.split('\n')
    const maxLines = Math.max(originalLines.length, suggestionLines.length)

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">Original</h4>
          <div className="bg-muted/50 rounded-md p-3 text-sm max-h-60 overflow-y-auto">
            {originalLines.map((line, i) => (
              <div key={i} className="font-mono">{line || '\u00A0'}</div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm mb-2 text-muted-foreground">Suggestion</h4>
          <div className="bg-green-50 dark:bg-green-950/20 rounded-md p-3 text-sm max-h-60 overflow-y-auto">
            {suggestionLines.map((line, i) => (
              <div key={i} className="font-mono">{line || '\u00A0'}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }, [suggestion, initialText])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Wand2 size={16} />
            AI Suggest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 size={20} />
            AI-Assisted Prompt Improvement
          </DialogTitle>
          <DialogDescription>
            Generate AI suggestions to rewrite, clarify, shorten, expand, or add variables to your prompt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div>
            <label className="block text-sm font-medium mb-2">Improvement Type</label>
            <Select value={variant} onValueChange={(value: any) => setVariant(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VARIANTS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    <div>
                      <div className="font-medium">{v.label}</div>
                      <div className="text-xs text-muted-foreground">{v.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Original Text */}
          <div>
            <label className="block text-sm font-medium mb-2">Original Text</label>
            <Textarea
              value={initialText}
              readOnly
              className="min-h-[120px] bg-muted/50"
              placeholder="Enter your prompt here..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSuggest} 
              disabled={loading || !initialText.trim()}
              className="gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Wand2 size={16} />
              )}
              {loading ? 'Generating...' : 'Get Suggestion'}
            </Button>

            {suggestion && (
              <>
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw size={16} />
                  Reset
                </Button>
                <Button variant="outline" onClick={() => setShowDiff(!showDiff)} className="gap-2">
                  {showDiff ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showDiff ? 'Hide' : 'Show'} Diff
                </Button>
              </>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-destructive">
                  <X size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestion Display */}
          {suggestion && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">AI Suggestion</label>
                <Button onClick={handleApply} className="gap-2">
                  <Check size={16} />
                  Apply Suggestion
                </Button>
              </div>
              <Textarea
                value={suggestion}
                readOnly
                className="min-h-[120px] bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
              />
            </div>
          )}

          {/* Diff View */}
          {showDiff && renderDiff}
        </div>
      </DialogContent>
    </Dialog>
  )
}
