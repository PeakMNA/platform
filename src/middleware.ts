import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { corsResponse, corsOptionsResponse } from '@/lib/cors'

const AUTH_COOKIE = 'carmen_auth'
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret')

// Simple in-memory metrics storage
const requestMetrics = {
  counts: new Map<string, number>(),
  responseTimes: new Map<string, number[]>(),
  errors: new Map<string, number>()
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const path = request.nextUrl.pathname
  
  console.log('\n=== Middleware Check ===')
  console.log('Path:', path)
  console.log('Cookies:', request.cookies.toString())

  // Handle CORS preflight requests for API routes
  if (request.method === 'OPTIONS' && path.startsWith('/api/')) {
    return corsOptionsResponse(request)
  }

  // Add CORS headers for API routes
  if (path.startsWith('/api/')) {
    const response = NextResponse.next()
    return corsResponse(response, request)
  }

  // Skip auth check for public routes
  if (path.startsWith('/auth')) {
    console.log('Skipping auth check for public route')
    return NextResponse.next()
  }

  // Check for auth cookie
  const cookie = request.cookies.get(AUTH_COOKIE)
  console.log('Auth cookie:', cookie ? 'Found' : 'Not found')
  
  if (!cookie?.value) {
    console.log('No auth cookie found, redirecting to login')
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    console.log('Redirect response:', response.status)
    return response
  }

  try {
    // Verify JWT token
    console.log('Verifying JWT token...')
    const { payload } = await jwtVerify(cookie.value, SECRET)
    console.log('JWT verified successfully:', payload)
    
    // Track request metrics
    requestMetrics.counts.set(path, (requestMetrics.counts.get(path) || 0) + 1)
    const responseTime = Date.now() - startTime
    const times = requestMetrics.responseTimes.get(path) || []
    times.push(responseTime)
    requestMetrics.responseTimes.set(path, times)

    const response = NextResponse.next()
    console.log('Proceeding with request')
    return response
  } catch (error) {
    console.error('Token verification failed:', error)
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    console.log('Redirecting to login due to invalid token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 