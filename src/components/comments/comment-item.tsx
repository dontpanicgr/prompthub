'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import MarkdownRenderer from '@/components/ui/markdown-renderer'
import { toast } from 'sonner'
import Avatar from '@/components/ui/avatar'
import CommentForm from './comment-form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Comment } from '@/lib/database'
import { supabase } from '@/lib/supabase'

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onCommentUpdated: () => void
  onCommentDeleted: () => void
}

export default function CommentItem({ 
  comment, 
  currentUserId, 
  onCommentUpdated, 
  onCommentDeleted 
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = currentUserId === comment.user_id
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleEdit = async () => {
    if (!editContent.trim()) return

    setIsSubmitting(true)
    
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        onCommentUpdated()
        toast.success('Comment updated')
      } else {
        console.error('Failed to update comment')
        toast.error('Failed to update comment')
      }
    } catch (error) {
      console.error('Error updating comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
      })

      if (response.ok) {
        onCommentDeleted()
        toast.success('Comment deleted')
      } else {
        console.error('Failed to delete comment')
        toast.error('Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReplyAdded = () => {
    setIsReplying(false)
    onCommentUpdated()
  }

  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="bg-card rounded-lg border border-border p-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Avatar
              src={comment.user.avatar_url}
              alt={comment.user.name}
              size="sm"
              fallback={comment.user.name.charAt(0).toUpperCase()}
            />
            <div>
              <div className="font-medium text-base">{comment.user.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, includeSeconds: false })
                  .replace(/^about /, '')
                  .replace('less than a minute ago', 'Few moments ago')}
              </div>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 size={16} className="mr-2 text-destructive" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your comment..."
              disabled={isSubmitting}
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleEdit} 
                size="sm"
                disabled={!editContent.trim() || isSubmitting}
                className="h-10"
              >
                Save
              </Button>
              <Button 
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }} 
                variant="outline" 
                size="sm"
                className="h-10"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-base">
            <MarkdownRenderer content={comment.content} />
          </div>
        )}

        {/* Comment Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border transition-colors">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageSquare size={16} className="mr-1" />
              Reply
            </Button>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="ml-8">
          <CommentForm
            promptId={comment.prompt_id}
            userId={currentUserId!}
            parentId={comment.id}
            onCommentAdded={handleReplyAdded}
            placeholder="Write a reply..."
            isReply={true}
          />
        </div>
      )}

      {/* Nested Replies */}
      {hasReplies && (
        <div className="ml-8 space-y-3">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
