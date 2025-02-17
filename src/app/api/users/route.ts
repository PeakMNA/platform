import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'

export async function OPTIONS(req: NextRequest) {
  return corsOptionsResponse(req)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return corsResponse({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        tenantId: session.tenantId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return corsResponse({
      users: users.map(user => ({
        ...user,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        createdAt: user.createdAt.toISOString()
      }))
    }, req)
  } catch (error) {
    console.error('Error fetching users:', error)
    return corsResponse({ error: 'Internal Server Error' }, { status: 500 })
  }
} 