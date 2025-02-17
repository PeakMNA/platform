'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { History, Code, Building2 } from "lucide-react"
import type { TemplateContent, TemplateConfiguration } from './configuration-list'

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

interface VersionListProps {
  versions: Version[]
}

export function VersionList({ versions }: VersionListProps) {
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version)

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No versions found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a new version to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sortedVersions.map((version) => (
        <Card key={version.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg font-medium">
                  Version {version.version}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(version.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge>
                {version.configurations.length} Configurations
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4" />
                    Latest configuration: {
                      version.configurations.length > 0
                        ? new Date(
                            Math.max(...version.configurations.map(c => new Date(c.createdAt).getTime()))
                          ).toLocaleDateString()
                        : 'None'
                    }
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Code className="mr-2 h-4 w-4" />
                    View Content
                  </Button>
                  <Button variant="outline" size="sm">
                    <Building2 className="mr-2 h-4 w-4" />
                    Add Configuration
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 