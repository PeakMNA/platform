'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { systemApi } from '@/lib/api'
import { AlertCircle, Bell, CheckCircle, Info } from 'lucide-react'

interface SystemAlert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  status: 'active' | 'resolved'
  createdAt: string
  resolvedAt: string | null
}

interface AlertCounts {
  total: number
  active: number
  critical: number
  warning: number
}

export function AlertsCard() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [counts, setCounts] = useState<AlertCounts>({ total: 0, active: 0, critical: 0, warning: 0 })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAlerts()
    // Refresh alerts every minute
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const { alerts, counts } = await systemApi.getAlerts({ status: 'active', limit: 5 })
      setAlerts(alerts)
      setCounts(counts)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch system alerts',
        variant: 'destructive',
      })
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await systemApi.updateAlert(id, { status: 'resolved' })
      toast({
        title: 'Alert Resolved',
        description: 'The alert has been marked as resolved',
      })
      fetchAlerts()
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast({
        title: 'Error',
        description: 'Failed to resolve the alert',
        variant: 'destructive',
      })
    }
  }

  const getSeverityIcon = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <Bell className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive'
      case 'warning':
        return 'text-yellow-500'
      case 'info':
        return 'text-blue-500'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading alerts...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">System Alerts</CardTitle>
        <div className="flex gap-2">
          {counts.critical > 0 && (
            <Badge variant="destructive">{counts.critical} Critical</Badge>
          )}
          {counts.warning > 0 && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              {counts.warning} Warning
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No active alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <AlertTitle className={getSeverityColor(alert.severity)}>
                      {alert.title}
                    </AlertTitle>
                  </div>
                  <AlertDescription className="mt-1">
                    {alert.description}
                  </AlertDescription>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-4"
                  onClick={() => handleResolve(alert.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
              </div>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  )
} 