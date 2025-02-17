import { prisma } from '@/lib/db'

interface ServiceModel {
  id: string
  name: string
  url: string
  status: string
}

export interface SystemMetrics {
  system: {
    cpu: { usage: number; cores: number; temperature: number }
    memory: { total: number; used: number; free: number }
    storage: { total: number; used: number; free: number }
  }
  services: { total: number; healthy: number; degraded: number; failed: number }
  traffic: { requests: number; avgResponseTime: number; errorRate: number }
  users: { active: number; newToday: number; totalRegistered: number }
}

// Check if we're in an edge runtime
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge'

class MetricsService {
  private requestCounts: Map<string, number> = new Map()
  private responseTimes: Map<string, number[]> = new Map()
  private errorCounts: Map<string, number> = new Map()

  constructor() {}

  trackRequest(path: string, responseTime: number, isError: boolean) {
    // Skip tracking in edge runtime
    if (isEdgeRuntime) return

    // Update request count
    this.requestCounts.set(path, (this.requestCounts.get(path) || 0) + 1)

    // Update response times
    const times = this.responseTimes.get(path) || []
    times.push(responseTime)
    this.responseTimes.set(path, times)

    // Update error count if applicable
    if (isError) {
      this.errorCounts.set(path, (this.errorCounts.get(path) || 0) + 1)
    }
  }

  private getSystemMetrics(): SystemMetrics['system'] {
    // Mock system metrics since we can't access os module
    return {
      cpu: {
        usage: Math.floor(Math.random() * 30) + 40, // 40-70%
        cores: 8,
        temperature: Math.floor(Math.random() * 20) + 55 // 55-75°C
      },
      memory: {
        total: 32, // GB
        used: +(Math.random() * 5 + 16).toFixed(1), // 16-21 GB
        free: +(Math.random() * 5 + 11).toFixed(1) // 11-16 GB
      },
      storage: {
        total: 512,
        used: 384,
        free: 128
      }
    }
  }

  private async getServiceMetrics(): Promise<SystemMetrics['services']> {
    try {
      const services = await prisma.service.findMany()
      
      return {
        total: services.length,
        healthy: services.filter((service: ServiceModel) => service.status === 'healthy').length,
        degraded: services.filter((service: ServiceModel) => service.status === 'degraded').length,
        failed: services.filter((service: ServiceModel) => service.status === 'failed').length
      }
    } catch (error) {
      console.error('Failed to get service metrics:', error)
      return {
        total: 0,
        healthy: 0,
        degraded: 0,
        failed: 0
      }
    }
  }

  private getTrafficMetrics(): SystemMetrics['traffic'] {
    const totalRequests = Array.from(this.requestCounts.values())
      .reduce((a, b) => a + b, 0)
    
    const allTimes = Array.from(this.responseTimes.values())
      .flat()
    
    const avgResponseTime = allTimes.length > 0
      ? Math.round(allTimes.reduce((a, b) => a + b, 0) / allTimes.length)
      : 0

    const totalErrors = Array.from(this.errorCounts.values())
      .reduce((a, b) => a + b, 0)

    return {
      requests: totalRequests,
      avgResponseTime,
      errorRate: totalRequests > 0
        ? +(totalErrors / totalRequests).toFixed(2)
        : 0
    }
  }

  private async getUserMetrics(): Promise<SystemMetrics['users']> {
    try {
      const now = new Date()
      const startOfDay = new Date(now.setHours(0, 0, 0, 0))

      const [totalUsers, newUsers, activeSessions] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            createdAt: {
              gte: startOfDay
            }
          }
        }),
        prisma.session.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 60 * 1000) // Active in last 30 minutes
            }
          }
        })
      ])

      return {
        active: activeSessions,
        newToday: newUsers,
        totalRegistered: totalUsers
      }
    } catch (error) {
      console.error('Failed to get user metrics:', error)
      return {
        active: 0,
        newToday: 0,
        totalRegistered: 0
      }
    }
  }

  async collectMetrics(): Promise<SystemMetrics> {
    try {
      const [system, services, traffic, users] = await Promise.all([
        this.getSystemMetrics(),
        this.getServiceMetrics(),
        this.getTrafficMetrics(),
        this.getUserMetrics()
      ])

      return {
        system,
        services,
        traffic,
        users
      }
    } catch (error) {
      console.error('Error collecting metrics:', error)
      throw error
    }
  }

  disconnect = async (): Promise<void> => {
    // No need to disconnect since we're using the shared prisma instance
  }
}

// Export singleton instance
export const metricsService = new MetricsService()