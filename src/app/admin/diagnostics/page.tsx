'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  Globe,
  Clock
} from 'lucide-react'

interface DiagnosticItem {
  name: string
  status: 'pass' | 'fail' | 'warning' | 'loading'
  message: string
  details?: string
  lastChecked?: string
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([])
  const [running, setRunning] = useState(false)

  const runDiagnostics = async () => {
    setRunning(true)
    setDiagnostics([])

    const checks: DiagnosticItem[] = [
      {
        name: 'Database Connection',
        status: 'loading',
        message: 'Checking database connectivity...',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'API Health',
        status: 'loading',
        message: 'Testing API endpoints...',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'Environment Variables',
        status: 'loading',
        message: 'Validating configuration...',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'Authentication',
        status: 'loading',
        message: 'Testing auth system...',
        lastChecked: new Date().toISOString()
      },
      {
        name: 'File System',
        status: 'loading',
        message: 'Checking file permissions...',
        lastChecked: new Date().toISOString()
      }
    ]

    setDiagnostics(checks)

    // Simulate running diagnostics
    for (let i = 0; i < checks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      const check = checks[i]
      let status: 'pass' | 'fail' | 'warning' = 'pass'
      let message = check.message
      let details = ''

      // Simulate different outcomes
      const rand = Math.random()
      if (rand < 0.1) {
        status = 'fail'
        message = 'Check failed'
        details = 'This is a simulated failure for testing purposes'
      } else if (rand < 0.2) {
        status = 'warning'
        message = 'Check completed with warnings'
        details = 'This is a simulated warning for testing purposes'
      } else {
        message = 'Check passed successfully'
        details = 'All systems operational'
      }

      setDiagnostics(prev => prev.map((item, index) => 
        index === i 
          ? { ...item, status, message, details }
          : item
      ))
    }

    setRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'loading': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default: return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge className="bg-green-100 text-green-800">Pass</Badge>
      case 'fail': return <Badge className="bg-red-100 text-red-800">Fail</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'loading': return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getStatusCounts = () => {
    const counts = diagnostics.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      pass: counts.pass || 0,
      fail: counts.fail || 0,
      warning: counts.warning || 0,
      loading: counts.loading || 0
    }
  }

  const counts = getStatusCounts()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">System Diagnostics</h1>
        <p className="text-muted-foreground mt-2">Monitor system health and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">{counts.pass}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{counts.fail}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-blue-600">{counts.loading}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <Button 
          onClick={runDiagnostics} 
          disabled={running}
          className="mr-4"
        >
          {running ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Activity className="h-4 w-4 mr-2" />
          )}
          {running ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </Button>
      </div>

      {/* Diagnostic Results */}
      <div className="space-y-4">
        {diagnostics.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Diagnostics Run</h3>
              <p className="text-muted-foreground">Click "Run Diagnostics" to check system health</p>
            </CardContent>
          </Card>
        ) : (
          diagnostics.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground mt-2">{item.details}</p>
                      )}
                      {item.lastChecked && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last checked: {new Date(item.lastChecked).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* System Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 text-foreground">Environment</h4>
              <p className="text-sm text-muted-foreground">{process.env.NODE_ENV || 'development'}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-foreground">Platform</h4>
              <p className="text-sm text-muted-foreground">Next.js 15.5.3</p>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-foreground">Database</h4>
              <p className="text-sm text-muted-foreground">Supabase</p>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-foreground">Runtime</h4>
              <p className="text-sm text-muted-foreground">Node.js</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
