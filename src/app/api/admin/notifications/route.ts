import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'
import { prisma } from '@/lib/prisma'

export async function OPTIONS() {
  return corsOptionsResponse()
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        tenantId: session.tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        recipients: true,
        createdAt: true,
        scheduledFor: true
      }
    })

    return corsResponse({
      notifications: notifications.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        scheduledFor: n.scheduledFor?.toISOString() || null
      }))
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return corsResponse({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const { title, type, recipients, scheduledFor } = body

    const notification = await prisma.notification.create({
      data: {
        title,
        type,
        status: scheduledFor ? 'pending' : 'sent',
        recipients: recipients.length,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        tenantId: session.tenantId
      }
    })

    return corsResponse({
      notification: {
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        scheduledFor: notification.scheduledFor?.toISOString() || null
      }
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return corsResponse({ error: 'Internal Server Error' }, { status: 500 })
  }
} 