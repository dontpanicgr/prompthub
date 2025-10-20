'use client'

import { useState } from 'react'
import CommentItem from './comment-item'
import CommentForm from './comment-form'
import { useComments } from '@/hooks/use-comments'
import { Button } from '@/components/ui/button'

interface CommentListProps {
  promptId: string
  currentUserId?: string
}

export default function CommentList({ promptId, currentUserId }: CommentListProps) {
  const { comments, isInitialLoading, isRefreshing, error, refetch } = useComments(promptId)
  const [visibleCount, setVisibleCount] = useState(10)

  const handleCommentAdded = () => {
    refetch()
  }

  const handleCommentUpdated = () => {
    refetch()
  }

  const handleCommentDeleted = () => {
    refetch()
  }

  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-muted"></div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-3 w-16 bg-muted rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comments</h3>
        <div className="text-center py-8 text-muted-foreground">
          <p>{error}</p>
          <button 
            onClick={refetch}
            className="text-blue-600 hover:text-blue-800 underline mt-2"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {currentUserId && (
        <CommentForm
          promptId={promptId}
          userId={currentUserId}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.slice(0, visibleCount).map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
          {comments.length > visibleCount && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setVisibleCount((c) => c + 10)}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
