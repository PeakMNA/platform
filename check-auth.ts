import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  try {
    // 1. Check for DEFAULT tenant
    console.log('\nChecking DEFAULT tenant...')
    const tenant = await prisma.tenant.findFirst({
      where: { code: 'DEFAULT' }
    })
    console.log('DEFAULT Tenant:', JSON.stringify(tenant, null, 2))

    if (tenant) {
      // 2. Check for admin user
      console.log('\nChecking admin user...')
      const user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: 'admin@carmen.io'
          }
        }
      })
      console.log('Admin User:', JSON.stringify(user, null, 2))

      if (user) {
        // 3. Test password
        console.log('\nTesting password...')
        const isValid = await bcrypt.compare('admin123', user.password)
        console.log('Password valid:', isValid)
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 