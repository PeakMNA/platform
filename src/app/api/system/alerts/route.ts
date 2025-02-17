import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { cacheService } from '@/lib/services/cache.service'
import { z } from 'zod'

const ALERTS_CACHE_KEY = 'system:alerts'
const ALERTS_CACHE_TTL = 10000 // 10 seconds

// Alert schema for validation and typing
const alertSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['critical', 'warning', 'info']),
  status: z.enum(['active', 'resolved']).default('active'),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
  updatedAt: z.string().optional()
})

type Alert = z.infer<typeof alertSchema>

// Base alerts for testing
const BASE_ALERTS: Alert[] = [
  {
    id: '1',
    title: 'High CPU Usage',
    description: 'System experiencing unusually high CPU load (>90%) for the past 15 minutes.',
    severity: 'critical',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    resolvedAt: null,
  },
  {
    id: '2',
    title: 'Database Latency',
    description: 'Database response time has increased to 250ms, above the 200ms threshold.',
    severity: 'warning',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    resolvedAt: null,
  },
  {
    id: '3',
    title: 'Storage Space Low',
    description: 'Storage utilization has reached 85% of total capacity.',
    severity: 'warning',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    resolvedAt: null,
  }
]

// Possible new alerts for dynamic generation
const POSSIBLE_ALERTS: Omit<Alert, 'id' | 'createdAt' | 'resolvedAt' | 'status'>[] = [
  {
    title: 'Memory Usage Spike',
    description: 'Sudden increase in memory usage detected. Current usage: 92%',
    severity: 'critical'
  },
  {
    title: 'Network Latency',
    description: 'Network latency has increased to 300ms in US-East region',
    severity: 'warning'
  },
  {
    title: 'API Rate Limit',
    description: 'API rate limit threshold reached for authentication service',
    severity: 'warning'
  },
  {
    title: 'Cache Miss Rate',
    description: 'Cache miss rate has increased to 25% in the last 5 minutes',
    severity: 'warning'
  },
  {
    title: 'Disk I/O',
    description: 'High disk I/O detected on primary storage volume',
    severity: 'warning'
  }
]

// Function to generate dynamic alerts
function generateAlerts(): Alert[] {
  const now = Date.now()
  
  // Start with base alerts
  let alerts = [...BASE_ALERTS]

  // Randomly resolve some alerts (20% chance for each active alert)
  alerts = alerts.map(alert => {
    if (alert.status === 'active' && Math.random() < 0.2) {
      return {
        ...alert,
        status: 'resolved',
        resolvedAt: new Date(now - Math.floor(Math.random() * 1000 * 60 * 5)).toISOString(), // Resolved in last 5 minutes
        updatedAt: new Date().toISOString()
      }
    }
    return alert
  })

  // Randomly add new alerts (30% chance)
  if (Math.random() < 0.3) {
    const newAlert = POSSIBLE_ALERTS[Math.floor(Math.random() * POSSIBLE_ALERTS.length)]
    alerts.push({
      id: `temp-${Date.now()}`,
      ...newAlert,
      status: 'active',
      createdAt: new Date(now - Math.floor(Math.random() * 1000 * 60 * 10)).toISOString(), // Created in last 10 minutes
      resolvedAt: null
    })
  }

  // Sort alerts by creation date (newest first)
  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

interface AlertsResponse {
  alerts: Alert[]
  counts: {
    total: number
    active: number
    critical: number
    warning: number
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Try to get alerts from cache
    let alerts: Alert[] = await cacheService.get(ALERTS_CACHE_KEY) || []
    
    if (alerts.length === 0) {
      // Generate new alerts if not in cache
      alerts = generateAlerts()
      
      // Cache the alerts
      await cacheService.set(ALERTS_CACHE_KEY, alerts, {
        ttl: ALERTS_CACHE_TTL
      })
    }

    // Filter alerts based on query parameters
    let filteredAlerts = [...alerts]
    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status)
    }
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity)
    }

    // Apply limit after filtering
    const limitedAlerts = filteredAlerts.slice(0, limit)

    // Get alert counts from the full set of alerts
    const response: AlertsResponse = {
      alerts: limitedAlerts,
      counts: {
        total: alerts.length,
        active: alerts.filter(a => a.status === 'active').length,
        critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
        warning: alerts.filter(a => a.severity === 'warning' && a.status === 'active').length,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Schema for creating new alerts
const createAlertSchema = alertSchema.omit({ 
  id: true, 
  createdAt: true, 
  resolvedAt: true, 
  updatedAt: true 
})

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createAlertSchema.parse(body)

    // Clear alerts cache to ensure fresh data
    await cacheService.delete(ALERTS_CACHE_KEY)

    const newAlert: Alert = {
      id: `new-${Date.now()}`,
      ...validatedData,
      createdAt: new Date().toISOString(),
      resolvedAt: null
    }

    return NextResponse.json(newAlert)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid alert data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Schema for updating alerts
const updateAlertSchema = createAlertSchema.partial()

export async function PATCH(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateAlertSchema.parse(body)

    // Clear alerts cache to ensure fresh data
    await cacheService.delete(ALERTS_CACHE_KEY)

    const updatedAlert: Alert = {
      ...validatedData,
      id,
      createdAt: new Date().toISOString(), // This would come from the database in a real implementation
      resolvedAt: validatedData.status === 'resolved' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    } as Alert // Type assertion since we know we're providing all required fields

    return NextResponse.json(updatedAlert)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid alert data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 