import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { userService } from '@/lib/services/user.service'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  businessUnit: z.string().optional(),
})

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    console.log('Session:', session) // Debug log
    
    if (!session) {
      console.log('No session found') // Debug log
      return corsResponse(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        request
      )
    }

    const user = await userService.findById(session.id)
    console.log('User found:', user ? 'yes' : 'no') // Debug log
    
    if (!user) {
      console.log('User not found for id:', session.id) // Debug log
      return corsResponse(
        NextResponse.json({ error: 'User not found' }, { status: 404 }),
        request
      )
    }

    // Remove sensitive data
    const { password, ...userProfile } = user
    return corsResponse(NextResponse.json(userProfile), request)
  } catch (error) {
    console.error('Error in profile GET:', error)
    return corsResponse(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
      request
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return corsResponse(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        request
      )
    }

    const body = await request.json()
    
    // Validate input
    const result = updateProfileSchema.safeParse(body)
    if (!result.success) {
      return corsResponse(
        NextResponse.json(
          { error: 'Invalid input', details: result.error.issues },
          { status: 400 }
        ),
        request
      )
    }

    // Update user
    const updatedUser = await userService.update(session.id, result.data)
    const { password, ...userProfile } = updatedUser

    return corsResponse(NextResponse.json(userProfile), request)
  } catch (error) {
    console.error('Error updating profile:', error)
    return corsResponse(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
      request
    )
  }
} 