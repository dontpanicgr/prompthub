'use client'

import { useState } from 'react'
import { X, Mail, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface EmailVerificationBannerProps {
  email: string
  onVerified?: () => void
}

export default function EmailVerificationBanner({ email, onVerified }: EmailVerificationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleResendVerification = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Verification email sent! Please check your inbox.')
      }
    } catch (err) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        onVerified?.()
        setIsDismissed(true)
      } else {
        setMessage('Email not yet verified. Please check your inbox and click the verification link.')
      }
    } catch (err) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (isDismissed) {
    return null
  }

  return (
    <Alert className="mb-6">
      <Mail className="h-4 w-4" />
      <AlertTitle>Email verification required</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Please verify your email address ({email}) to access all features.
        </p>
        {message && (
          <p className="font-medium">{message}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckVerification}
            disabled={loading}
          >
            {loading ? 'Checking...' : "I've verified"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResendVerification}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin mr-1' : 'mr-1'} />
            Resend
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="p-1 h-auto"
          >
            <X size={16} />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
