'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'
import { processMentions } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface CommentFormProps {
  promptId: string
  userId: string
  parentId?: string
  onCommentAdded: () => void
  placeholder?: string
  isReply?: boolean
}

export default function CommentForm({ 
  promptId, 
  userId, 
  parentId, 
  onCommentAdded, 
  placeholder = "Write a comment...",
  isReply = false
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    setIsSubmitting(true)
    
    try {
      // Process mentions before sending
      const processedContent = processMentions(content.trim())
      
      const requestBody = {
        prompt_id: promptId,
        user_id: userId,
        content: processedContent,
        parent_id: parentId,
      }
      
      console.log('Sending comment request:', requestBody)
      
      // Attach user's access token so the API can authenticate with Supabase
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Comment response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Comment created successfully:', result)
        setContent('')
        onCommentAdded()
        toast.success('Comment added')
      } else {
        const errorData = await response.json()
        console.error('Failed to create comment:', errorData)
        toast.error(errorData?.error || 'Failed to create comment')
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error('Failed to create comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="w-full min-h-20 text-base"
        />
        <div className="flex items-center justify-between">
          <Button 
            type="submit" 
            disabled={!content.trim() || isSubmitting}
            size="sm"
          >
            {isReply ? 'Reply' : 'Comment'}
          </Button>
          <div className="text-sm text-muted-foreground">
            💡 <strong>Markdown supported!</strong> Use **bold**, *italic*, `code`, # headers, - lists, and more.
          </div>
        </div>
      </div>
      
      {isReply && (
        <div className="text-xs text-muted-foreground">
          Tip: Use @username to mention someone
        </div>
      )}
    </form>
  )
}
