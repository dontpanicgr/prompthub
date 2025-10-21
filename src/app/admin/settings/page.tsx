'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings,
  Save,
  Shield,
  Mail,
  Database,
  Bell
} from 'lucide-react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'PromptHub',
    siteDescription: 'A platform for sharing and discovering AI prompts',
    allowRegistration: true,
    requireEmailVerification: true,
    allowComments: true,
    allowLikes: true,
    allowBookmarks: true,
    maxPromptsPerUser: 100,
    maxProjectsPerUser: 10,
    adminEmails: 'admin@example.com,admin2@example.com',
    maintenanceMode: false,
    analyticsEnabled: true,
    emailNotifications: true
  })

  const handleSave = () => {
    // In a real app, this would save to the database
    // Show success message
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="maxPromptsPerUser">Max Prompts Per User</Label>
                <Input
                  id="maxPromptsPerUser"
                  type="number"
                  value={settings.maxPromptsPerUser}
                  onChange={(e) => setSettings({...settings, maxPromptsPerUser: parseInt(e.target.value)})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Settings
            </CardTitle>
            <CardDescription>Configure user registration and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowRegistration">Allow User Registration</Label>
                <p className="text-sm text-gray-500">Allow new users to register accounts</p>
              </div>
              <Switch
                id="allowRegistration"
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({...settings, allowRegistration: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowComments">Allow Comments</Label>
                <p className="text-sm text-gray-500">Users can comment on prompts</p>
              </div>
              <Switch
                id="allowComments"
                checked={settings.allowComments}
                onCheckedChange={(checked) => setSettings({...settings, allowComments: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowLikes">Allow Likes</Label>
                <p className="text-sm text-gray-500">Users can like prompts</p>
              </div>
              <Switch
                id="allowLikes"
                checked={settings.allowLikes}
                onCheckedChange={(checked) => setSettings({...settings, allowLikes: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowBookmarks">Allow Bookmarks</Label>
                <p className="text-sm text-gray-500">Users can bookmark prompts</p>
              </div>
              <Switch
                id="allowBookmarks"
                checked={settings.allowBookmarks}
                onCheckedChange={(checked) => setSettings({...settings, allowBookmarks: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Admin Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Admin Settings
            </CardTitle>
            <CardDescription>Configure admin access and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminEmails">Admin Emails</Label>
              <Input
                id="adminEmails"
                value={settings.adminEmails}
                onChange={(e) => setSettings({...settings, adminEmails: e.target.value})}
                placeholder="admin@example.com,admin2@example.com"
              />
              <p className="text-sm text-gray-500 mt-1">Comma-separated list of admin email addresses</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Analytics & Monitoring
            </CardTitle>
            <CardDescription>Configure analytics and monitoring settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analyticsEnabled">Enable Analytics</Label>
                <p className="text-sm text-gray-500">Track user behavior and platform metrics</p>
              </div>
              <Switch
                id="analyticsEnabled"
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) => setSettings({...settings, analyticsEnabled: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Send email notifications for important events</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
