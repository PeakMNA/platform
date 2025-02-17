import { EventEmitter } from 'events'
import { prisma } from '@/lib/db'

type MockService = {
  id: string
  name: string
  url: string
  status: string
  latency: number
  tenantId: string
}

type MockRegion = {
  id: string
  name: string
  url: string
  status: string
  latency: number
}

// Mock data for development
const mockServices: MockService[] = [
  { id: '1', name: 'Authentication Service', url: 'http://auth.example.com', status: 'healthy', latency: 50, tenantId: '1' },
  { id: '2', name: 'Database Service', url: 'http://db.example.com', status: 'healthy', latency: 30, tenantId: '1' },
  { id: '3', name: 'Storage Service', url: 'http://storage.example.com', status: 'degraded', latency: 150, tenantId: '1' }
]

const mockRegions: MockRegion[] = [
  { id: '1', name: 'US East', url: 'http://us-east.example.com', status: 'healthy', latency: 20 },
  { id: '2', name: 'EU West', url: 'http://eu-west.example.com', status: 'healthy', latency: 80 },
  { id: '3', name: 'Asia Pacific', url: 'http://ap-south.example.com', status: 'degraded', latency: 200 }
]

export interface ServiceHealth {
  id: string
  name: string
  status: 'healthy' | 'degraded' | 'failed'
  latency: number
  lastChecked: Date
  message?: string
}

export interface RegionHealth {
  id: string
  name: string
  status: 'healthy' | 'degraded' | 'failed'
  latency: number
  lastChecked: Date
  message?: string
}

export interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'failed'
  services: ServiceHealth[]
  regions: RegionHealth[]
  lastUpdated: Date
}

// Export the class and singleton instance
export class HealthService extends EventEmitter {
  private checkInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL_MS = 10000 // 10 seconds

  constructor() {
    super()
    this.startHealthChecks()
  }

  private startHealthChecks() {
    // Initial check
    this.checkServicesHealth()
    this.checkRegionsHealth()

    // Set up interval for periodic checks
    this.checkInterval = setInterval(async () => {
      try {
        await this.checkServicesHealth()
        await this.checkRegionsHealth()
      } catch (error) {
        console.error('Health check failed:', error)
        this.emit('error', error)
      }
    }, this.CHECK_INTERVAL_MS)
  }

  private async checkServicesHealth(): Promise<ServiceHealth[]> {
    try {
      const services = await prisma.service.findMany()
      const healthChecks: ServiceHealth[] = []

      for (const service of services) {
        const isHealthy = await this.checkServiceEndpoint()
        const latency = Math.floor(Math.random() * 200) // Mock latency 0-200ms

        healthChecks.push({
          id: service.id,
          name: service.name,
          status: isHealthy ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'failed',
          latency,
          lastChecked: new Date(),
          message: isHealthy ? undefined : 'Service response time exceeded threshold'
        })
      }

      return healthChecks
    } catch (error) {
      console.error('Service health check failed:', error)
      // Return mock data in case of database error
      return mockServices.map(service => ({
        id: service.id,
        name: service.name,
        status: service.status as 'healthy' | 'degraded' | 'failed',
        latency: service.latency,
        lastChecked: new Date(),
      }))
    }
  }

  private async checkRegionsHealth(): Promise<RegionHealth[]> {
    try {
      const regions = await prisma.region.findMany()
      const healthChecks: RegionHealth[] = []

      for (const region of regions) {
        const isHealthy = await this.checkRegionEndpoint()
        const latency = Math.floor(Math.random() * 200) // Mock latency 0-200ms

        healthChecks.push({
          id: region.id,
          name: region.name,
          status: isHealthy ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'failed',
          latency,
          lastChecked: new Date(),
          message: isHealthy ? undefined : 'Region response time exceeded threshold'
        })
      }

      return healthChecks
    } catch (error) {
      console.error('Region health check failed:', error)
      // Return mock data in case of database error
      return mockRegions.map(region => ({
        id: region.id,
        name: region.name,
        status: region.status as 'healthy' | 'degraded' | 'failed',
        latency: region.latency,
        lastChecked: new Date(),
      }))
    }
  }

  private async checkServiceEndpoint(): Promise<boolean> {
    // Mock endpoint check with 90% success rate
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
    return Math.random() > 0.1
  }

  private async checkRegionEndpoint(): Promise<boolean> {
    // Mock endpoint check with 95% success rate
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
    return Math.random() > 0.05
  }

  public async getSystemHealth(): Promise<SystemHealth> {
    const [services, regions] = await Promise.all([
      this.checkServicesHealth(),
      this.checkRegionsHealth()
    ])

    const failedServices = services.filter(s => s.status === 'failed').length
    const degradedServices = services.filter(s => s.status === 'degraded').length
    const failedRegions = regions.filter(r => r.status === 'failed').length
    const degradedRegions = regions.filter(r => r.status === 'degraded').length

    let overallStatus: 'healthy' | 'degraded' | 'failed' = 'healthy'
    if (failedServices > 0 || failedRegions > 0) {
      overallStatus = 'failed'
    } else if (degradedServices > 0 || degradedRegions > 0) {
      overallStatus = 'degraded'
    }

    return {
      overallStatus,
      services,
      regions,
      lastUpdated: new Date()
    }
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    this.removeAllListeners()
  }
}

// Export singleton instance
export const healthService = new HealthService()

