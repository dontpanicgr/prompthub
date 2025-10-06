'use client'

import { useState, useEffect, useCallback } from 'react'
import MainLayout from '@/components/layout/main-layout'
import { useAuth } from '@/components/auth-provider'
import { useTheme } from '@/components/theme-provider'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, Palette, Settings as SettingsIcon, User2, Shield, Mail, Settings2, Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageMenu, PageMenuItem } from '@/components/ui/page-menu'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('details')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    website_url: ''
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    sidebarCollapsed: false,
    autoSave: true,
    compactMode: false
  })

  // Load user profile data
  const loadUserData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (data) {
        setFormData({
          name: data.name || '',
          email: data.email || user?.email || '',
          bio: data.bio || '',
          website_url: data.website_url || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }, [user])

  const handleUpdateProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          email: formData.email,
          bio: formData.bio,
          website_url: formData.website_url,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      // Don't redirect, just show the UI without data
      return
    }

    // Load user profile data and preferences
    loadUserData()
    loadPreferences()
  }, [user, authLoading, loadUserData])

  // Listen for sidebar state changes from other sources
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setPreferences(prev => ({
        ...prev,
        sidebarCollapsed: event.detail.collapsed
      }))
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('sidebar-state-change', handleSidebarStateChange as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sidebar-state-change', handleSidebarStateChange as EventListener)
      }
    }
  }, [])

  const loadPreferences = () => {
    // Load sidebar state from localStorage
    if (typeof window !== 'undefined') {
      const sidebarCollapsed = localStorage.getItem('sidebar-collapsed')
      setPreferences(prev => ({
        ...prev,
        sidebarCollapsed: sidebarCollapsed ? JSON.parse(sidebarCollapsed) : false
      }))
    }
  }

  const toggleSidebarCollapsed = () => {
    const newState = !preferences.sidebarCollapsed
    setPreferences(prev => ({ ...prev, sidebarCollapsed: newState }))
    
    // Use the same localStorage and event system as the sidebar
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
        window.dispatchEvent(new CustomEvent('sidebar-state-change', {
          detail: { collapsed: newState }
        }))
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error)
      }
    }
  }


  if (authLoading) {
    return (
      <MainLayout>
        <div className="w-full p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading settings...
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="w-full p-6">
          <div className="text-center py-12">
            <h1 className="mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to be signed in to access settings.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const settingsSections: PageMenuItem[] = [
    { id: 'details', label: 'Details', icon: User2 },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
    { id: 'communication', label: 'Communication', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'details':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      autoComplete="email"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself"
                    rows={3}
                    maxLength={360}
                    className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none resize-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${
                      formData.bio.length > 320 ? 'border-yellow-500 focus-visible:border-yellow-500' : ''
                    }`}
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className={formData.bio.length > 320 ? 'text-yellow-600 dark:text-yellow-400' : ''}>
                      {formData.bio.length > 300 ? 'Approaching character limit' : ''}
                    </span>
                    <span className={formData.bio.length > 320 ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''}>
                      {formData.bio.length}/360
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">Website</label>
                  <Input
                    id="website"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={handleUpdateProfile} disabled={saving} className="h-10">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your application preferences and behavior.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Theme</label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme for the application.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        theme === 'light'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sun size={14} />
                      Light
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        theme === 'dark'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Moon size={14} />
                      Dark
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        theme === 'system'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Monitor size={14} />
                      System
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Compact Mode</label>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact layout to fit more content.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.compactMode}
                    onChange={(checked) =>
                      setPreferences(prev => ({ ...prev, compactMode: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Collapsed Left Navigation</label>
                    <p className="text-sm text-muted-foreground">
                      Keep the left navigation menu collapsed by default.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.sidebarCollapsed}
                    onChange={toggleSidebarCollapsed}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Auto-save</label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your work as you type.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoSave}
                    onChange={(checked) =>
                      setPreferences(prev => ({ ...prev, autoSave: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'communication':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication</CardTitle>
                <CardDescription>
                  Manage your communication preferences and consent settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications about your account activity.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={(checked) =>
                      setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Marketing Emails</label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and product updates.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketingEmails || false}
                    onChange={(checked) =>
                      setPreferences(prev => ({ ...prev, marketingEmails: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Push Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Enable browser push notifications for important updates.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications || false}
                    onChange={(checked) =>
                      setPreferences(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your account security settings and authentication.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Two-Factor Authentication</label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Change Password</label>
                    <p className="text-sm text-muted-foreground">
                      Update your account password for better security.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Active Sessions</label>
                    <p className="text-sm text-muted-foreground">
                      View and manage your active login sessions.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-destructive">Delete Account</label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-6">
          <h1>
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <PageMenu
            items={settingsSections}
            activeItem={activeSection}
            onItemClick={setActiveSection}
          />

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
