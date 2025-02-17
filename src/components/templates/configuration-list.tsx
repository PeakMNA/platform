'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings2, Code, Building2 } from "lucide-react"
import { CreateConfigurationDialog } from './create-configuration-dialog'
import type { NotificationMetadata } from '@/lib/api'

// Define template content and configuration types
export type TemplateContent = {
  subject?: string
  body: string
  variables?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'date'
    required?: boolean
    default?: unknown
  }>
  format?: 'text' | 'html' | 'markdown'
  locale?: string
}

export type TemplateConfiguration = {
  enabled: boolean
  variables?: Record<string, unknown>
  overrides?: {
    subject?: string
    body?: string
    format?: 'text' | 'html' | 'markdown'
    locale?: string
  }
  metadata?: NotificationMetadata
}

interface Version {
  id: string
  version: number
  content: TemplateContent
  configurations: Array<{
    id: string
    businessUnit: string
    configuration: TemplateConfiguration
    createdAt: string
  }>
  createdAt: string
  createdBy: string
}

interface ConfigurationListProps {
  templateId: string
  versions: Version[]
  onConfigurationCreated: () => void
}

export function ConfigurationList({ 
  templateId, 
  versions,
  onConfigurationCreated 
}: ConfigurationListProps) {
  // Get all configurations from all versions
  const configurations = versions.flatMap(version => 
    version.configurations.map(config => ({
      ...config,
      version: version.version,
      versionId: version.id
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (configurations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <CreateConfigurationDialog
            templateId={templateId}
            versions={versions}
            onSuccess={onConfigurationCreated}
          >
            <Button>
              <Settings2 className="mr-2 h-4 w-4" />
              New Configuration
            </Button>
          </CreateConfigurationDialog>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Settings2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No configurations found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a new configuration to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateConfigurationDialog
          templateId={templateId}
          versions={versions}
          onSuccess={onConfigurationCreated}
        >
          <Button>
            <Settings2 className="mr-2 h-4 w-4" />
            New Configuration
          </Button>
        </CreateConfigurationDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {configurations.map((config) => (
          <Card key={config.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">
                    Version {config.version}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Created on {new Date(config.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge>
                  {config.businessUnit}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="mr-2 h-4 w-4" />
                  Business Unit Configuration
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    <Code className="mr-2 h-4 w-4" />
                    View Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 