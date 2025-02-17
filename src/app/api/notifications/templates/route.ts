import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { notificationService } from '@/lib/services/notification.service'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['email', 'sms', 'in_app', 'push', 'webhook', 'slack']),
  content: z.string(),
  metadata: z.record(z.any()).optional()
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = createTemplateSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    const template = await notificationService.createTemplate(result.data)
    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') as any
    const isActive = searchParams.has('isActive') 
      ? searchParams.get('isActive') === 'true'
      : undefined

    const templates = await notificationService.listTemplates({
      type,
      isActive
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 