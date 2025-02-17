import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { templateService } from '@/lib/services/template.service'

export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/templates - Start')
    const session = await getSession()
    console.log('Session:', session)
    
    if (!session) {
      console.log('No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId') || undefined
    const businessUnit = searchParams.get('businessUnit') || undefined
    const isActive = searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined

    console.log('Query params:', { categoryId, businessUnit, isActive })

    const templates = await templateService.listTemplates({
      categoryId,
      businessUnit,
      isActive,
    })

    console.log('Templates found:', templates.length)
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error in templates GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const template = await templateService.createTemplate(body, session.id)

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error in templates POST:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 