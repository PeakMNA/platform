import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

export const AUTH_COOKIE = 'carmen_auth'
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret')

export interface UserSession {
  id: string
  email: string
  role: string
  businessUnit?: string
  tenantId: string
}

export async function getSession(): Promise<UserSession | null> {
  try {
    console.log('Getting session...')
    const cookieStore = await cookies()
    const cookie = cookieStore.get(AUTH_COOKIE)
    
    if (!cookie?.value) {
      console.log('No auth cookie found')
      return null
    }
    
    console.log('Verifying JWT token...')
    const { payload } = await jwtVerify(cookie.value, SECRET)
    console.log('JWT payload:', payload)
    
    // Ensure all required fields are present
    if (!payload.id || !payload.email || !payload.role || !payload.tenantId) {
      console.log('Invalid session payload:', payload)
      return null
    }
    
    const session = {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as string,
      businessUnit: payload.businessUnit as string | undefined,
      tenantId: payload.tenantId as string,
    }
    console.log('Session created:', session)
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

export async function createSession(user: UserSession) {
  try {
    console.log('Creating session for user:', user) // Debug log
    
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      businessUnit: user.businessUnit,
      tenantId: user.tenantId,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(SECRET)
    
    console.log('JWT token created') // Debug log
    
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8 // 8 hours
    })
    
    console.log('Cookie set successfully') // Debug log
    return token
  } catch (error) {
    console.error('Error creating session:', error)
    throw error
  }
} 