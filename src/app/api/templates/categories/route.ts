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
    const isActive = searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : true

    const categories = await templateService.listCategories(isActive)
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error in categories GET:', error)
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
    const category = await templateService.createCategory(
      body.name,
      body.description
    )

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error in categories POST:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 