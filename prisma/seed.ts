import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing seed process...');
  console.log('Starting seeding process...');

  // Create a default tenant first
  console.log('Creating default tenant...');
  const tenant = await prisma.tenant.upsert({
    where: { code: 'DEFAULT' },
    update: {
      name: 'Default Tenant',
      type: 'hotel',
      status: 'active'
    },
    create: {
      name: 'Default Tenant',
      code: 'DEFAULT',
      type: 'hotel',
      status: 'active'
    }
  });

  // Create default admin user
  console.log('Creating default admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@carmen.io'
      }
    },
    update: {
      name: 'System Admin',
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    },
    create: {
      email: 'admin@carmen.io',
      name: 'System Admin',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      tenant: { connect: { id: tenant.id } }
    }
  });

  // Create a default property
  console.log('Creating default property...');
  const property = await prisma.property.upsert({
    where: {
      tenantId_code: {
        tenantId: tenant.id,
        code: 'DEFAULT'
      }
    },
    update: {
      name: 'Default Property',
      type: 'hotel',
      timezone: 'UTC',
      status: 'active'
    },
    create: {
      tenant: { connect: { id: tenant.id } },
      code: 'DEFAULT',
      name: 'Default Property',
      type: 'hotel',
      timezone: 'UTC',
      status: 'active'
    }
  });

  // Create default services
  console.log('Creating default services...');
  const services = [
    {
      name: 'Authentication Service',
      url: 'http://localhost:3000/auth',
      status: 'active',
      latency: 0
    },
    {
      name: 'Database Service',
      url: 'http://localhost:3000/db',
      status: 'active',
      latency: 0
    }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: service.name
        }
      },
      update: service,
      create: {
        ...service,
        tenant: { connect: { id: tenant.id } }
      }
    });
  }

  // Create departments
  console.log('Creating departments...');
  const departments = [
    { name: 'Front Office', code: 'FO', type: 'operational' },
    { name: 'Housekeeping', code: 'HK', type: 'operational' },
    { name: 'Engineering', code: 'ENG', type: 'support' },
    { name: 'Food & Beverage', code: 'FB', type: 'operational' }
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: {
        tenantId_propertyId_code: {
          tenantId: tenant.id,
          propertyId: property.id,
          code: dept.code
        }
      },
      update: dept,
      create: {
        ...dept,
        tenant: { connect: { id: tenant.id } },
        property: { connect: { id: property.id } }
      }
    });
  }

  // Create template categories
  console.log('Creating template categories...');
  const templateCategories = [
    { name: 'Room Inspection', description: 'Templates for room inspection' },
    { name: 'Public Area', description: 'Templates for public area inspection' },
    { name: 'Equipment', description: 'Templates for equipment inspection' }
  ];

  for (const category of templateCategories) {
    await prisma.templateCategory.upsert({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: category.name
        }
      },
      update: category,
      create: {
        ...category,
        tenant: { connect: { id: tenant.id } }
      }
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });