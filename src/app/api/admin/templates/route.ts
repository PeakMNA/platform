import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'
import { prisma } from '@/lib/prisma'

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

    // Get templates with version and configuration counts
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        updatedAt: true,
        _count: {
          select: {
            versions: true,
            configurations: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Format the response
    const formattedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      status: template.status,
      versions: template._count.versions,
      configurations: template._count.configurations,
      updatedAt: template.updatedAt.toISOString()
    }))

    return corsResponse(
      NextResponse.json({ templates: formattedTemplates }),
      request
    )
  } catch (error) {
    console.error('Error fetching templates:', error)
    return corsResponse(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
      request
    )
  }
} 