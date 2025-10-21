'use client'

import { useAuth } from '@/components/auth-provider'
import { useEffect, useState } from 'react'

export default function DebugAuthPage() {
  const { user, loading } = useAuth()
  const [adminCheck, setAdminCheck] = useState<any>(null)
  const [checking, setChecking] = useState(false)

  const checkAdminStatus = async () => {
    setChecking(true)
    try {
      const response = await fetch('/api/admin/check')
      const data = await response.json()
      setAdminCheck(data)
    } catch (error) {
      setAdminCheck({ error: 'Failed to check admin status' })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      checkAdminStatus()
    }
  }, [user, loading])

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
              {user && (
                <>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Email (lowercase):</strong> {user.email?.toLowerCase()}</p>
                  <p><strong>User ID:</strong> {user.id}</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Admin Check</h2>
            <button 
              onClick={checkAdminStatus}
              disabled={checking || !user}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              {checking ? 'Checking...' : 'Check Admin Status'}
            </button>
            
            {adminCheck && (
              <div className="mt-4">
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(adminCheck, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <p className="text-sm text-gray-600">
              Note: Environment variables are only visible server-side for security.
              Check the server console logs for ADMIN_EMAILS values.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
