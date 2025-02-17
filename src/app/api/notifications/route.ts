import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { notificationService } from '@/lib/services/notification.service'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'

const sendNotificationSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.enum(['email', 'sms', 'in_app', 'push', 'webhook', 'slack']),
  recipient: z.string(),
  metadata: z.record(z.any()).optional()
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = sendNotificationSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    const notification = await notificationService.send(result.data)
    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error sending notification:', error)
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return corsResponse({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        tenantId: session.tenantId
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return corsResponse({
      notifications: notifications.map(notification => ({
        ...notification,
        createdAt: notification.createdAt.toISOString()
      }))
    }, req)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return corsResponse({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function OPTIONS(req: NextRequest) {
  return corsOptionsResponse(req)
} 