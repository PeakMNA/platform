import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Create Prisma Client with appropriate configuration
export const prisma = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Ensure the client is connected
prisma.$connect()
  .then(() => {
    console.log('Database connected successfully')
  })
  .catch((error: Error) => {
    console.error('Database connection failed:', error)
  })

export default prisma 