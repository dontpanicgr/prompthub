'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {}

      try {
        // Test 1: Environment variables
        results.envVars = {
          supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
        }

        // Test 2: Supabase client
        results.supabaseClient = {
          exists: !!supabase,
          url: supabase?.supabaseUrl,
          key: supabase?.supabaseKey?.substring(0, 20) + '...',
        }

        // Test 3: Basic connection
        const { data: healthData, error: healthError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
        
        results.basicConnection = {
          success: !healthError,
          error: healthError?.message,
          data: healthData,
        }

        // Test 4: Prompts table
        const { data: promptsData, error: promptsError } = await supabase
          .from('prompts')
          .select('id, title, is_public')
          .limit(5)
        
        results.promptsTable = {
          success: !promptsError,
          error: promptsError?.message,
          count: promptsData?.length || 0,
          data: promptsData,
        }

        // Test 5: Check if there are any users
        const { data: usersData, error: usersError } = await supabase.auth.getUser()
        results.currentUser = {
          authenticated: !!usersData?.user,
          user: usersData?.user?.id,
          error: usersError?.message,
        }

        // Test 6: auth.users is not accessible from client (avoid 404s)
        results.authUsersTable = {
          accessible: false,
          error: 'auth.users is not exposed via REST for anon client; expected',
        }

        // Test 7: Check profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .limit(5)
        
        results.profilesTable = {
          success: !profilesError,
          error: profilesError?.message,
          count: profilesData?.length || 0,
          data: profilesData,
        }

      } catch (error) {
        results.generalError = error
      }

      setDiagnostics(results)
      setLoading(false)
    }

    runDiagnostics()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">System Diagnostic</h1>
        <p>Running diagnostics...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">System Diagnostic</h1>
      
      <div className="space-y-6">
        {/* Environment Variables */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center gap-2 ${diagnostics.envVars?.supabaseUrl ? 'text-green-600' : 'text-red-600'}`}>
              <span>{diagnostics.envVars?.supabaseUrl ? '✅' : '❌'}</span>
              <span>NEXT_PUBLIC_SUPABASE_URL: {diagnostics.envVars?.supabaseUrlValue}</span>
            </div>
            <div className={`flex items-center gap-2 ${diagnostics.envVars?.supabaseKey ? 'text-green-600' : 'text-red-600'}`}>
              <span>{diagnostics.envVars?.supabaseKey ? '✅' : '❌'}</span>
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY: Present</span>
            </div>
          </div>
        </div>

        {/* Supabase Client */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Supabase Client</h2>
          <div className="space-y-1 text-sm">
            <div className={`flex items-center gap-2 ${diagnostics.supabaseClient?.exists ? 'text-green-600' : 'text-red-600'}`}>
              <span>{diagnostics.supabaseClient?.exists ? '✅' : '❌'}</span>
              <span>Client initialized: {diagnostics.supabaseClient?.exists ? 'Yes' : 'No'}</span>
            </div>
            <div className="text-gray-600">
              URL: {diagnostics.supabaseClient?.url}
            </div>
            <div className="text-gray-600">
              Key: {diagnostics.supabaseClient?.key}
            </div>
          </div>
        </div>

        {/* Basic Connection */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Basic Connection Test</h2>
          <div className={`p-3 rounded ${diagnostics.basicConnection?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {diagnostics.basicConnection?.success ? '✅ Connection successful' : '❌ Connection failed'}
          </div>
          {diagnostics.basicConnection?.error && (
            <div className="mt-2 text-sm text-red-600">
              Error: {diagnostics.basicConnection.error}
            </div>
          )}
        </div>

        {/* Prompts Table */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Prompts Table</h2>
          <div className={`p-3 rounded ${diagnostics.promptsTable?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {diagnostics.promptsTable?.success ? '✅ Table accessible' : '❌ Table not accessible'}
          </div>
          {diagnostics.promptsTable?.success && (
            <div className="mt-2 text-sm">
              <p>Found {diagnostics.promptsTable.count} prompts</p>
              {diagnostics.promptsTable.data && diagnostics.promptsTable.data.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Sample prompts:</p>
                  <ul className="list-disc list-inside ml-4">
                    {diagnostics.promptsTable.data.map((prompt: any, index: number) => (
                      <li key={index} className="text-sm">
                        {prompt.title} (Public: {prompt.is_public ? 'Yes' : 'No'})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {diagnostics.promptsTable?.error && (
            <div className="mt-2 text-sm text-red-600">
              Error: {diagnostics.promptsTable.error}
            </div>
          )}
        </div>

        {/* Current User */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Current User</h2>
          <div className={`p-3 rounded ${diagnostics.currentUser?.authenticated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {diagnostics.currentUser?.authenticated ? '✅ User authenticated' : '⚠️ No user authenticated'}
          </div>
          {diagnostics.currentUser?.user && (
            <div className="mt-2 text-sm">
              User ID: {diagnostics.currentUser.user}
            </div>
          )}
        </div>

        {/* Profiles Table */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Profiles Table</h2>
          <div className={`p-3 rounded ${diagnostics.profilesTable?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {diagnostics.profilesTable?.success ? '✅ Table accessible' : '❌ Table not accessible'}
          </div>
          {diagnostics.profilesTable?.success && (
            <div className="mt-2 text-sm">
              <p>Found {diagnostics.profilesTable.count} profiles</p>
              {diagnostics.profilesTable.data && diagnostics.profilesTable.data.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Sample profiles:</p>
                  <ul className="list-disc list-inside ml-4">
                    {diagnostics.profilesTable.data.map((profile: any, index: number) => (
                      <li key={index} className="text-sm">
                        {profile.name || 'No name'} ({profile.email || 'No email'})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {diagnostics.profilesTable?.error && (
            <div className="mt-2 text-sm text-red-600">
              Error: {diagnostics.profilesTable.error}
            </div>
          )}
        </div>

        {/* Raw Data */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Raw Diagnostic Data</h2>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

