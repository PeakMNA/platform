import { NextResponse } from 'next/server'
import { userService } from '@/lib/services/user.service'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  businessUnit: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await userService.findByEmail(result.data.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create new user
    const user = await userService.create({
      ...result.data,
      role: 'user', // Default role for new registrations
    })

    // Remove sensitive data from response
    const { password, ...userProfile } = user

    return NextResponse.json(userProfile, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 