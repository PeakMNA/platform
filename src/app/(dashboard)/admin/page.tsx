'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Users, 
  BellRing, 
  Server, 
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus
} from "lucide-react"
import Link from 'next/link'

interface SystemMetrics {
  users: {
    total: number
    active: number
    newToday: number
  }
  services: {
    total: number
    healthy: number
    degraded: number
    failed: number
  }
  notifications: {
    total: number
    sent: number
    pending: number
    failed: number
  }
  system: {
    cpuUsage: number
    memoryUsage: number
    storageUsage: number
    uptime: string
  }
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/system/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      setError('Failed to load system metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading system metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <div className="flex gap-2">
          <Link href="/admin/users/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New User
            </Button>
          </Link>
          <Link href="/admin/notifications/new">
            <Button variant="outline">
              <BellRing className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.users.active} active, {metrics.users.newToday} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.services.healthy}/{metrics.services.total}
            </div>
            <div className="flex gap-2 mt-1">
              {metrics.services.degraded > 0 && (
                <Badge variant="warning">
                  {metrics.services.degraded} degraded
                </Badge>
              )}
              {metrics.services.failed > 0 && (
                <Badge variant="destructive">
                  {metrics.services.failed} failed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.notifications.total}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary">{metrics.notifications.pending} pending</Badge>
              {metrics.notifications.failed > 0 && (
                <Badge variant="destructive">
                  {metrics.notifications.failed} failed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.system.uptime}</div>
            <p className="text-xs text-muted-foreground">
              CPU: {metrics.system.cpuUsage}%, Memory: {metrics.system.memoryUsage}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>{metrics.system.cpuUsage}%</span>
              </div>
              <Progress value={metrics.system.cpuUsage} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>{metrics.system.memoryUsage}%</span>
              </div>
              <Progress value={metrics.system.memoryUsage} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span>{metrics.system.storageUsage}%</span>
              </div>
              <Progress value={metrics.system.storageUsage} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Healthy</span>
                </div>
                <Badge variant="outline" className="bg-green-500/10">
                  {metrics.services.healthy}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Degraded</span>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10">
                  {metrics.services.degraded}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span>Failed</span>
                </div>
                <Badge variant="outline" className="bg-red-500/10">
                  {metrics.services.failed}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 