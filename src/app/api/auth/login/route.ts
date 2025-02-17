import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/services/auth.service'
import { z } from 'zod'
import { AUTH_COOKIE } from '@/lib/auth'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function OPTIONS(request: NextRequest) {
  return corsOptionsResponse(request)
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n=== Login Attempt ===')
    const body = await request.json()
    console.log('Login attempt for:', body.email)
    
    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      console.log('Invalid login input:', result.error.issues)
      return corsResponse(
        NextResponse.json(
          { error: 'Invalid input', details: result.error.issues },
          { status: 400 }
        ),
        request
      )
    }

    const { email, password } = result.data
    console.log('Attempting login with email:', email)
    
    const authResult = await authService.login(email, password)
    console.log('Auth result:', authResult ? 'Success' : 'Failed')
    
    if (!authResult) {
      console.log('Login failed for:', email)
      return corsResponse(
        NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        ),
        request
      )
    }

    console.log('Login successful for:', email, 'with ID:', authResult.user.id)
    console.log('Setting auth cookie with token:', authResult.session)
    
    // Create response with auth cookie
    const response = NextResponse.json({ 
      success: true,
      user: authResult.user
    })

    // Set cookie with explicit path and domain
    response.cookies.set({
      name: AUTH_COOKIE,
      value: authResult.session,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8 // 8 hours
    })

    console.log('Response headers:', response.headers)
    return corsResponse(response, request)
  } catch (error) {
    console.error('Login error:', error)
    return corsResponse(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
      request
    )
  }
} 