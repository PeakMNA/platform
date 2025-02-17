import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { TemplateService } from '@/lib/services/template.service'

const templateService = new TemplateService()

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const versionId = searchParams.get('versionId') || undefined
    const businessUnit = searchParams.get('businessUnit') || undefined
    const isActive = searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined

    const configurations = await templateService.listConfigurations({
      versionId,
      businessUnit,
      isActive,
    })

    return NextResponse.json(configurations)
  } catch (error) {
    console.error('Error in configurations GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const configuration = await templateService.createConfiguration({
      ...body,
      createdBy: session.id,
    })

    return NextResponse.json(configuration, { status: 201 })
  } catch (error) {
    console.error('Error in configurations POST:', error)
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