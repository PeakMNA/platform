import { prisma } from '@/lib/db'
import * as bcrypt from 'bcrypt'

export interface CreateUserData {
  email: string
  password: string
  name: string
  role?: string
  businessUnit?: string
  tenantId: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  businessUnit?: string
}

export const userService = {
  async findByEmail(email: string, tenantId: string) {
    console.log('Looking up user by email:', email, 'and tenantId:', tenantId)
    const user = await prisma.user.findUnique({ 
      where: { 
        tenantId_email: {
          tenantId,
          email
        }
      } 
    })
    console.log('User lookup result:', user ? JSON.stringify(user, null, 2) : 'Not found')
    return user
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  async create(data: CreateUserData) {
    const hashedPassword = await bcrypt.hash(data.password, 10)
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    })
  },

  async update(id: string, data: UpdateUserData) {
    const updateData = { ...data }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }
    return prisma.user.update({
      where: { id },
      data: updateData,
    })
  },

  async validateCredentials(email: string, tenantId: string, password: string) {
    console.log('Validating credentials for:', email, 'with tenantId:', tenantId)
    const user = await this.findByEmail(email, tenantId)
    if (!user) {
      console.log('User not found')
      return null
    }

    console.log('Comparing passwords')
    const isValid = await bcrypt.compare(password, user.password)
    console.log('Password comparison result:', isValid ? 'Valid' : 'Invalid')
    
    if (!isValid) {
      console.log('Invalid password')
      return null
    }

    return user
  },

  async listUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          businessUnit: true,
          createdAt: true,
          lastLoginAt: true,
          status: true,
          tenantId: true
        },
      }),
      prisma.user.count(),
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },
} 