import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'

// Mock service data - replace with actual service monitoring logic
const services = [
  {
    name: 'API Server',
    status: 'healthy',
    uptime: '99.99%',
    latency: '45ms'
  },
  {
    name: 'Database',
    status: 'healthy',
    uptime: '99.95%',
    latency: '85ms'
  },
  {
    name: 'Cache',
    status: 'healthy',
    uptime: '99.98%',
    latency: '12ms'
  },
  {
    name: 'Message Queue',
    status: 'degraded',
    uptime: '99.85%',
    latency: '150ms'
  },
  {
    name: 'Search Service',
    status: 'healthy',
    uptime: '99.90%',
    latency: '65ms'
  },
  {
    name: 'Storage Service',
    status: 'healthy',
    uptime: '99.99%',
    latency: '35ms'
  }
]

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return corsResponse(
        NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ),
        request
      )
    }

    // In a real application, you would:
    // 1. Check service health endpoints
    // 2. Query monitoring systems
    // 3. Get real-time metrics
    // 4. Calculate actual uptime and latency

    return corsResponse(
      NextResponse.json({ services }),
      request
    )
  } catch (error) {
    console.error('Error fetching services:', error)
    return corsResponse(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
      request
    )
  }
} 