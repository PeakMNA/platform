import { prisma } from '@/lib/db'
import { userService } from './user.service'
import { createSession } from '@/lib/auth'

export const authService = {
  async login(email: string, password: string) {
    try {
      // Get the tenant ID for the user's email domain
      const domain = email.split('@')[1]
      console.log('Looking up tenant for domain:', domain) // Debug log
      
      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { code: 'DEFAULT' }, // Default tenant for carmen.io domain
            { domain: domain }
          ]
        }
      })
      console.log('Found tenant:', tenant ? JSON.stringify(tenant, null, 2) : 'null') // Debug log

      if (!tenant) {
        console.log('No tenant found for domain:', domain)
        return null
      }

      console.log('Validating credentials for email:', email, 'and tenantId:', tenant.id) // Debug log
      const user = await userService.validateCredentials(email, tenant.id, password)
      console.log('User validation result:', user ? 'Success' : 'Failed') // Debug log
      
      if (!user) {
        console.log('Invalid credentials for:', email)
        return null
      }

      console.log('User authenticated:', user.id)

      // Create session
      const session = await createSession({
        id: user.id,
        email: user.email,
        role: user.role,
        businessUnit: user.businessUnit ?? undefined,
        tenantId: user.tenantId,
      })

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessUnit: user.businessUnit,
          tenantId: user.tenantId,
        },
        session,
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async logout(userId: string, token: string) {
    return prisma.session.deleteMany({
      where: {
        userId,
        token,
      },
    })
  },

  async register(data: {
    email: string
    password: string
    name: string
    businessUnit?: string
  }) {
    try {
      // Get the tenant ID for the user's email domain
      const domain = data.email.split('@')[1]
      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { code: domain.split('.')[0].toUpperCase() },
            { name: { contains: domain.split('.')[0], mode: 'insensitive' } }
          ]
        }
      })

      if (!tenant) {
        throw new Error('Invalid email domain')
      }

      // Check if user exists
      const existingUser = await userService.findByEmail(data.email, tenant.id)
      if (existingUser) {
        throw new Error('User already exists')
      }

      // Create user
      const user = await userService.create({
        ...data,
        role: 'user', // Default role
        tenantId: tenant.id,
      })

      console.log('New user created:', user.id)

      // Create session
      const session = await createSession({
        id: user.id,
        email: user.email,
        role: user.role,
        businessUnit: user.businessUnit ?? undefined,
        tenantId: user.tenantId,
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessUnit: user.businessUnit,
          tenantId: user.tenantId,
        },
        session,
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },
} 