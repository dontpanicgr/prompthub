"use client"

import { useState } from 'react'
import { MoreHorizontal, Copy, Share2, Flag, Edit, Trash2, Folder } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ProjectSelector from '@/components/ui/project-selector'
import { useAuth } from '@/components/auth-provider'

interface PromptMenuProps {
  promptId: string
  promptBody?: string
  isOwner: boolean
  onCopy?: () => void
  onShare?: () => void
  onReport?: () => void
  onMoveToProject?: () => void
  onDelete?: () => void
  triggerClassName?: string
}

export default function PromptMenu({
  promptId,
  promptBody,
  isOwner,
  onCopy,
  onShare,
  onReport,
  onMoveToProject,
  onDelete,
  triggerClassName,
}: PromptMenuProps) {
  const { user } = useAuth()
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<string>('spam')
  const [reportComment, setReportComment] = useState<string>('')

  const handleCopy = async () => {
    if (onCopy) return onCopy()
    try {
      if (promptBody) {
        await navigator.clipboard.writeText(promptBody)
        toast.success('Prompt copied')
      }
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleShare = async () => {
    if (onShare) return onShare()
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      await navigator.clipboard.writeText(`${origin}/prompt/${promptId}`)
      toast.success('Link copied')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const openMoveDialog = () => {
    if (onMoveToProject) {
      onMoveToProject()
      return
    }
    setIsMoveDialogOpen(true)
  }

  const confirmMove = () => {
    // UI only
    toast.success('Prompt moved to project')
    setIsMoveDialogOpen(false)
  }

  const openReportDialog = () => {
    if (onReport) {
      onReport()
      return
    }
    setIsReportDialogOpen(true)
  }

  const submitReport = () => {
    // UI only
    toast.success('Report submitted')
    setIsReportDialogOpen(false)
    setReportComment('')
    setReportReason('spam')
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={triggerClassName || 'flex items-center gap-1 text-md transition-all duration-200 rounded-md px-2 py-1 hover:bg-secondary h-8'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          title="More"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopy() }}>
          <Copy size={16} className="mr-2" />
          Copy
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare() }}>
          <Share2 size={16} className="mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openReportDialog() }}>
          <Flag size={16} className="mr-2" />
          Report
        </DropdownMenuItem>
        {isOwner && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); openMoveDialog() }}>
              <Folder size={16} className="mr-2" />
              Move to project
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/prompt/${promptId}/edit`}>
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete && onDelete() }} className="text-destructive focus:text-destructive">
              <Trash2 size={16} className="mr-2 text-destructive" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Move to Project Dialog */}
    <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {user ? (
            <ProjectSelector
              selectedProjectId={selectedProjectId}
              onProjectChange={setSelectedProjectId}
              userId={user.id}
            />
          ) : (
            <div className="text-sm text-muted-foreground">Sign in to view your projects.</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmMove}>Move</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Report Dialog */}
    <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report prompt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="report-reason" value="spam" checked={reportReason === 'spam'} onChange={() => setReportReason('spam')} />
                Spam or advertising
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="report-reason" value="inappropriate" checked={reportReason === 'inappropriate'} onChange={() => setReportReason('inappropriate')} />
                Inappropriate or harmful
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="report-reason" value="plagiarism" checked={reportReason === 'plagiarism'} onChange={() => setReportReason('plagiarism')} />
                Plagiarism or copyright
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="report-reason" value="other" checked={reportReason === 'other'} onChange={() => setReportReason('other')} />
                Other
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-comment">Additional comments (optional)</Label>
            <Textarea id="report-comment" value={reportComment} onChange={(e) => setReportComment(e.target.value)} placeholder="Add details to help us review this report..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitReport}>Submit report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}


