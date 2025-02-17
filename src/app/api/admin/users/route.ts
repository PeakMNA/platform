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

    // Get users with their last login time
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString()
    }))

    return corsResponse(
      NextResponse.json({ users: formattedUsers }),
      request
    )
  } catch (error) {
    console.error('Error fetching users:', error)
    return corsResponse(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
      request
    )
  }
} 