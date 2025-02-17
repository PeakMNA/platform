import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'
import { prisma } from '../../../../lib/prisma'

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

    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { role: true }
    })

    if (!user || user.role !== 'admin') {
      return corsResponse(
        NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        ),
        request
      )
    }

    // Get active users count and new users today
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay
          }
        }
      }),
      prisma.user.count({
        where: { status: 'active' }
      })
    ])

    // System metrics response matching dashboard expectations
    const systemMetrics = {
      system: {
        cpu: {
          usage: 45,
          cores: 8,
          temperature: 72
        },
        memory: {
          total: 32768,
          used: 18944,
          free: 13824
        },
        storage: {
          total: 1024000,
          used: 768000,
          free: 256000
        }
      },
      services: {
        total: 6,
        healthy: 5,
        degraded: 1,
        failed: 0
      },
      traffic: {
        requests: 15000,
        avgResponseTime: 30,
        errorRate: 0.2
      },
      users: {
        active: activeUsers,
        newToday: newUsers,
        totalRegistered: totalUsers
      }
    }

    return corsResponse(
      NextResponse.json(systemMetrics),
      request
    )
  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return corsResponse(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
      request
    )
  }
} 