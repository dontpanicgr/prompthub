'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'

export default function AdminSettingsPage() {
  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    setPasswordMessage('')

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: localStorage.getItem('admin_email'),
          newPassword: passwordData.newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordMessage('Password updated successfully!')
        setPasswordData({
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setPasswordMessage('Failed to update password')
      }
    } catch (error) {
      setPasswordMessage('Request failed')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your admin account settings</p>
      </div>

      <div className="max-w-2xl">
        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Admin Password
            </CardTitle>
            <CardDescription>Update your admin account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {passwordMessage && (
              <div className={`p-3 rounded-md text-sm ${
                passwordMessage.includes('successfully') 
                  ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}>
                {passwordMessage}
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                onClick={handlePasswordChange}
                disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
