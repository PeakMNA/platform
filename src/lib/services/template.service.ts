import { prisma } from '@/lib/db'
import { z } from 'zod'

// Type definitions for template content and configuration
export interface TemplateField {
  name: string
  type: 'string' | 'text' | 'number' | 'boolean' | 'date' | 'select'
  required?: boolean
  options?: string[]  // For select type fields
  defaultValue?: unknown
  description?: string
}

export interface TemplateContent {
  fields: TemplateField[]
  metadata?: {
    version?: string
    description?: string
    tags?: string[]
  }
}

export interface TemplateConfiguration {
  values: Record<string, unknown>
  metadata?: {
    lastUpdated?: string
    updatedBy?: string
    comments?: string
  }
}

// Validation schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string(),
  businessUnit: z.string().optional(),
  content: z.object({
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['string', 'text', 'number', 'boolean', 'date', 'select']),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional(),
      defaultValue: z.unknown().optional(),
      description: z.string().optional()
    })),
    metadata: z.object({
      version: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional()
    }).optional()
  })
})

export const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  businessUnit: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const createConfigurationSchema = z.object({
  versionId: z.string(),
  businessUnit: z.string(),
  configuration: z.object({
    values: z.record(z.unknown()),
    metadata: z.object({
      lastUpdated: z.string().optional(),
      updatedBy: z.string().optional(),
      comments: z.string().optional()
    }).optional()
  })
})

// Service interfaces
export interface CreateTemplateData {
  name: string
  description?: string
  categoryId: string
  businessUnit?: string
  content: TemplateContent
}

export interface UpdateTemplateData {
  name?: string
  description?: string
  categoryId?: string
  businessUnit?: string
  isActive?: boolean
}

export interface CreateConfigurationData {
  versionId: string
  businessUnit: string
  configuration: TemplateConfiguration
  createdBy: string
}

export class TemplateService {
  // Template management
  async createTemplate(data: CreateTemplateData, createdBy: string) {
    const { content, ...templateData } = data
    
    return await prisma.template.create({
      data: {
        ...templateData,
        versions: {
          create: {
            version: 1,
            content,
            createdBy,
          },
        },
      },
      include: {
        category: true,
        versions: true,
      },
    })
  }

  async updateTemplate(id: string, data: UpdateTemplateData) {
    return await prisma.template.update({
      where: { id },
      data,
      include: {
        category: true,
        versions: true,
      },
    })
  }

  async getTemplate(id: string) {
    return await prisma.template.findUnique({
      where: { id },
      include: {
        category: true,
        versions: {
          include: {
            configurations: true,
          },
          orderBy: {
            version: 'desc',
          },
        },
      },
    })
  }

  async listTemplates({ categoryId, businessUnit, isActive }: {
    categoryId?: string
    businessUnit?: string
    isActive?: boolean
  }) {
    return await prisma.template.findMany({
      where: {
        categoryId: categoryId,
        businessUnit: businessUnit,
        isActive: isActive,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }

  // Version management
  async createVersion(templateId: string, content: TemplateContent, userId: string) {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!template) {
      throw new Error('Template not found')
    }

    const latestVersion = template.versions[0]?.version ?? 0
    const newVersion = latestVersion + 1

    return await prisma.templateVersion.create({
      data: {
        version: newVersion,
        content,
        createdBy: userId,
        templateId,
      },
      include: {
        configurations: true,
      },
    })
  }

  // Configuration management
  async createConfiguration(data: CreateConfigurationData) {
    return await prisma.templateConfiguration.create({
      data,
      include: {
        version: true,
      },
    })
  }

  async getConfiguration(id: string) {
    return await prisma.templateConfiguration.findUnique({
      where: { id },
      include: {
        version: {
          include: {
            template: true,
          },
        },
      },
    })
  }

  async listConfigurations(params: {
    versionId?: string
    businessUnit?: string
    isActive?: boolean
  }) {
    return await prisma.templateConfiguration.findMany({
      where: {
        versionId: params.versionId,
        businessUnit: params.businessUnit,
        isActive: params.isActive,
      },
      include: {
        version: {
          include: {
            template: true,
          },
        },
      },
    })
  }

  // Category management
  async createCategory(name: string, description?: string) {
    return await prisma.templateCategory.create({
      data: {
        name,
        description,
      },
    })
  }

  async listCategories(isActive: boolean = true) {
    return await prisma.templateCategory.findMany({
      where: { isActive },
      include: {
        templates: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }
}

export const templateService = new TemplateService() 