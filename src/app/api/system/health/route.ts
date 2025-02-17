import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { cacheService } from '@/lib/services/cache.service'
import { healthService } from '@/lib/services/health.service'
import { metricsService } from '@/lib/services/metrics.service'

const HEALTH_CACHE_KEY = 'system:health'
const HEALTH_CACHE_TTL = 15 // 15 seconds

export async function GET(request: Request) {
  const startTime = Date.now()
  
  try {
    const session = await getSession()
    if (!session) {
      metricsService.trackRequest(request.url, Date.now() - startTime, true)
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Try to get health data from cache
    const cachedHealth = await cacheService.get(HEALTH_CACHE_KEY)
    if (cachedHealth) {
      metricsService.trackRequest(request.url, Date.now() - startTime, false)
      return NextResponse.json(cachedHealth)
    }

    // Get fresh health data
    const healthData = await healthService.getSystemHealth()

    // Cache the health data
    await cacheService.set(HEALTH_CACHE_KEY, healthData, { ttl: HEALTH_CACHE_TTL })

    metricsService.trackRequest(request.url, Date.now() - startTime, false)
    return NextResponse.json(healthData)
  } catch (error) {
    console.error('Health check failed:', error)
    metricsService.trackRequest(request.url, Date.now() - startTime, true)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 