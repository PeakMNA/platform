'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, History, Settings2, Code } from "lucide-react"
import { CreateVersionDialog } from '@/components/templates/create-version-dialog'
import { VersionList } from '@/components/templates/version-list'
import { ConfigurationList } from '@/components/templates/configuration-list'
import type { TemplateContent, TemplateConfiguration } from './configuration-list'

interface Template {
  id: string
  name: string
  description: string | null
  categoryId: string
  category: {
    name: string
  }
  versions: Array<{
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
  }>
  createdAt: string
  updatedAt: string
  isActive: boolean
  businessUnit: string | null
}

interface TemplateDetailsProps {
  templateId: string
}

export function TemplateDetails({ templateId }: TemplateDetailsProps) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`)
      if (!response.ok) throw new Error('Failed to fetch template')
      const data = await response.json()
      setTemplate(data)
    } catch (error) {
      console.error('Error fetching template:', error)
      toast({
        title: 'Error',
        description: 'Failed to load template details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading template details...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Template not found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The requested template could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
          {template.description && (
            <p className="mt-2 text-muted-foreground">{template.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <Badge variant={template.isActive ? 'default' : 'secondary'}>
              {template.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Category: {template.category.name}
            </span>
          </div>
        </div>
        <CreateVersionDialog templateId={template.id} onSuccess={fetchTemplate}>
          <Button>
            <History className="mr-2 h-4 w-4" />
            New Version
          </Button>
        </CreateVersionDialog>
      </div>

      <Tabs defaultValue="versions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="versions">
            <History className="mr-2 h-4 w-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="configurations">
            <Settings2 className="mr-2 h-4 w-4" />
            Configurations
          </TabsTrigger>
          <TabsTrigger value="json">
            <Code className="mr-2 h-4 w-4" />
            JSON View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-4">
          <VersionList versions={template.versions} onVersionCreated={fetchTemplate} />
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          <ConfigurationList 
            templateId={template.id} 
            versions={template.versions}
            onConfigurationCreated={fetchTemplate}
          />
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[500px]">
                {JSON.stringify(template, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 