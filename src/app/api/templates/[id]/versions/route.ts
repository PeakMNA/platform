import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { TemplateService } from '@/lib/services/template.service'

const templateService = new TemplateService()

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const version = await templateService.createVersion(
      params.id,
      body.content,
      session.id
    )

    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error('Error in template version POST:', error)
    if (error instanceof Error && error.message === 'Template not found') {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 