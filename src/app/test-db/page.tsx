'use client'

import { useEffect, useState } from 'react'
import { testDatabaseConnection, getPublicPrompts } from '@/lib/database'

export default function TestDatabasePage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runTests = async () => {
      console.log('Running database tests...')
      
      // Test 1: Basic connection
      const connectionResult = await testDatabaseConnection()
      console.log('Connection test result:', connectionResult)
      
      // Test 2: Fetch prompts
      const promptsData = await getPublicPrompts()
      console.log('Prompts data:', promptsData)
      
      setTestResult({ connection: connectionResult, promptsCount: promptsData.length })
      setPrompts(promptsData)
      setLoading(false)
    }

    runTests()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Test</h1>
        <p>Testing database connection...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test Results</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Connection Test</h2>
        <div className={`p-4 rounded ${testResult?.connection ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {testResult?.connection ? '✅ Database connection successful' : '❌ Database connection failed'}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Prompts Data</h2>
        <div className="p-4 bg-gray-100 rounded">
          <p>Number of prompts found: {testResult?.promptsCount || 0}</p>
        </div>
      </div>

      {prompts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Sample Prompts</h2>
          <div className="space-y-2">
            {prompts.slice(0, 3).map((prompt, index) => (
              <div key={prompt.id || index} className="p-3 border rounded">
                <h3 className="font-medium">{prompt.title}</h3>
                <p className="text-sm text-gray-600">{prompt.body?.substring(0, 100)}...</p>
                <p className="text-xs text-gray-500">Model: {prompt.model}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Raw Data</h2>
        <pre className="p-4 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify({ testResult, promptsCount: prompts.length }, null, 2)}
        </pre>
      </div>
    </div>
  )
}

