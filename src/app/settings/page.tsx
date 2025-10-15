'use client'

import { useState, useEffect, useCallback } from 'react'
import MainLayout from '@/components/layout/main-layout'
import { useAuth } from '@/components/auth-provider'
import { useTheme } from '@/components/theme-provider'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, Palette, Settings as SettingsIcon, User2, Shield, Mail, Settings2, Sun, Moon, Monitor, Key, Wand2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageMenu, PageMenuItem } from '@/components/ui/page-menu'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMemo } from 'react'
 

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
    autoSave: false,
    layout: 'card' as 'card' | 'table',
    marketingEmails: true,
    pushNotifications: true,
  })

  // Security state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false)
  
  // AI Providers state
  const [aiProviders, setAiProviders] = useState<Array<{
    provider: string
    fingerprint: string
    isEnabled: boolean
    lastUsedAt: string | null
  }>>([])
  const [addingProvider, setAddingProvider] = useState(false)
  const [newProviderKey, setNewProviderKey] = useState('')
  const [newProviderType, setNewProviderType] = useState('openai')
  const [testingConnection, setTestingConnection] = useState(false)
  const [loadingProviders, setLoadingProviders] = useState(false)
  

  const isEmailPasswordUser = useMemo(() => {
    // Supabase returns identities on the user object; presence of 'email' provider implies email/pass account
    const providers = (user as any)?.identities?.map((i: any) => i?.provider) || []
    return providers.includes('email')
  }, [user])

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
        setIsPrivate(!!data.is_private)
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
    void loadAiProviders()
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
      const layoutPref = localStorage.getItem('layout-preference') as 'card' | 'table' | null
      setPreferences(prev => ({
        ...prev,
        sidebarCollapsed: sidebarCollapsed ? JSON.parse(sidebarCollapsed) : false,
        layout: layoutPref === 'table' ? 'table' : 'card',
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

  const loadAiProviders = useCallback(async () => {
    if (!user) return
    try {
      setLoadingProviders(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        setAiProviders([])
        return
      }
      const res = await fetch('/api/ai/list-keys', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!res.ok) {
        setAiProviders([])
        return
      }
      const json = await res.json()
      setAiProviders(Array.isArray(json.keys) ? json.keys : [])
    } catch (e) {
      console.error('Failed to load AI providers', e)
      setAiProviders([])
    } finally {
      setLoadingProviders(false)
    }
  }, [user])

  const handleTestKey = async () => {
    if (!newProviderKey) {
      toast.error('Enter an API key to test')
      return
    }
    try {
      setTestingConnection(true)
      toast.message('Testing connection…')
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        toast.error('Not authenticated')
        return
      }
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ provider: newProviderType, apiKey: newProviderKey })
      })
      if (res.ok) {
        toast.success('Connection successful')
      } else {
        const j = await res.json().catch(() => ({}))
        toast.error(j?.error || 'Connection failed')
      }
    } catch (e) {
      console.error(e)
      toast.error('Connection failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSaveKey = async () => {
    if (!newProviderKey) {
      toast.error('Enter an API key to save')
      return
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        toast.error('Not authenticated')
        return
      }
      const res = await fetch('/api/ai/store-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ provider: newProviderType, apiKey: newProviderKey })
      })
      if (res.ok) {
        toast.success('Key saved')
        setNewProviderKey('')
        await loadAiProviders()
      } else {
        const j = await res.json().catch(() => ({}))
        toast.error(j?.error || 'Failed to save key')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to save key')
    }
  }

  const handleRemoveKey = async (provider: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        toast.error('Not authenticated')
        return
      }
      const res = await fetch('/api/ai/remove-key', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ provider })
      })
      if (res.ok) {
        toast.success('Key removed')
        await loadAiProviders()
      } else {
        const j = await res.json().catch(() => ({}))
        toast.error(j?.error || 'Failed to remove key')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to remove key')
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
    { id: 'ai-providers', label: 'AI Providers', icon: Wand2 },
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
                    <label className="text-sm font-medium">Layout</label>
                    <p className="text-sm text-muted-foreground">
                      Choose how to display prompts (cards or list rows).
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <button
                      onClick={() => {
                        setPreferences(prev => ({ ...prev, layout: 'card' }))
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('layout-preference', 'card')
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        preferences.layout === 'card'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Card
                    </button>
                    <button
                      onClick={() => {
                        setPreferences(prev => ({ ...prev, layout: 'table' }))
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('layout-preference', 'table')
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        preferences.layout === 'table'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      List
                    </button>
                  </div>
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
                      Not supported yet. Planned for the editor experience.
                    </p>
                  </div>
                  <Switch
                    checked={false}
                    disabled
                    onChange={() => {}}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'ai-providers':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bring Your Own Key</CardTitle>
                <CardDescription>
                  Connect API keys for providers to unlock higher limits and more models.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col md:flex-row items-stretch md:items-end gap-2">
                    <div className="w-full md:w-48">
                      <label className="text-sm font-medium">Provider</label>
                      <Select value={newProviderType} onValueChange={setNewProviderType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="deepseek">DeepSeek</SelectItem>
                          <SelectItem value="openai_compatible">OpenAI-Compatible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium">API Key</label>
                      <Input
                        type="password"
                        value={newProviderKey}
                        onChange={(e) => setNewProviderKey(e.target.value)}
                        placeholder="Paste your API key"
                      />
                    </div>
                    <div className="flex gap-2 md:pb-[2px]">
                      <Button variant="outline" size="sm" onClick={handleTestKey} disabled={testingConnection}>
                        {testingConnection ? 'Testing…' : 'Test'}
                      </Button>
                      <Button size="sm" onClick={handleSaveKey}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-sm font-medium">Your connected providers</label>
                  <div className="mt-2 divide-y rounded-md border">
                    {loadingProviders ? (
                      <div className="p-3 text-sm text-muted-foreground">Loading…</div>
                    ) : aiProviders.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">No providers connected yet.</div>
                    ) : (
                      aiProviders.map((p) => (
                        <div key={p.provider} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <div>
                              <div className="text-sm font-medium capitalize">{p.provider.replace('_', ' ')}</div>
                              <div className="text-xs text-muted-foreground">Fingerprint: {p.fingerprint}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{p.isEnabled ? 'Enabled' : 'Disabled'}</span>
                            <Button variant="outline" size="sm" onClick={() => handleRemoveKey(p.provider)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                    checked={preferences.marketingEmails}
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
                    checked={preferences.pushNotifications}
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
                    <label className="text-sm font-medium">Private profile</label>
                    <p className="text-sm text-muted-foreground">
                      Hide your profile and prompts from others (visible only to you).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isPrivate}
                      onChange={async (checked) => {
                        try {
                          setUpdatingPrivacy(true)
                          setIsPrivate(checked)
                          const { error } = await supabase
                            .from('profiles')
                            .update({ is_private: checked, updated_at: new Date().toISOString() })
                            .eq('id', user!.id)
                          if (error) throw error
                          // Show toast with refresh action on mobile only
                          const message = checked ? 'Profile set to private' : 'Profile set to public'
                          try {
                            const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 1024px)').matches
                            if (isMobile) {
                              toast.success(message, {
                                action: {
                                  label: 'Refresh',
                                  onClick: () => window.location.reload()
                                }
                              })
                            } else {
                              toast.success(message)
                            }
                          } catch {
                            toast.success(message)
                          }
                        } catch (e: any) {
                          console.error(e)
                          setIsPrivate((prev) => !prev)
                          toast.error('Failed to update privacy')
                        } finally {
                          setUpdatingPrivacy(false)
                        }
                      }}
                      disabled={updatingPrivacy}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Two-Factor Authentication</label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled title="Coming soon">
                    Enable 2FA
                  </Button>
                </div>

                {isEmailPasswordUser && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Change Password</label>
                    <p className="text-sm text-muted-foreground">
                      Update your account password for better security.
                    </p>
                  </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setChangePasswordOpen(true)}
                    >
                    Change Password
                  </Button>
                </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Active Sessions</label>
                    <p className="text-sm text-muted-foreground">
                      View and manage your active login sessions.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled title="Coming soon">
                    View Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone intentionally hidden for now */}

            {/* Change Password Dialog */}
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    This applies only to accounts created with email and password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Current Password</label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">New Password</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setChangePasswordOpen(false)}
                    disabled={changingPassword}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (!isEmailPasswordUser) {
                        toast.error('Password changes are only for email/password accounts')
                        return
                      }
                      if (!currentPassword || !newPassword || !confirmPassword) {
                        toast.error('Please complete all fields')
                        return
                      }
                      if (newPassword !== confirmPassword) {
                        toast.error('New passwords do not match')
                        return
                      }
                      setChangingPassword(true)
                      try {
                        // Reauthenticate by attempting a sign-in with email + current password
                        const email = user?.email as string
                        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
                        if (signInError) {
                          throw new Error('Current password is incorrect')
                        }
                        const { error } = await supabase.auth.updateUser({ password: newPassword })
                        if (error) {
                          throw error
                        }
                        toast.success('Password updated')
                        setChangePasswordOpen(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      } catch (e: any) {
                        console.error(e)
                        toast.error(e?.message || 'Failed to change password')
                      } finally {
                        setChangingPassword(false)
                      }
                    }}
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
