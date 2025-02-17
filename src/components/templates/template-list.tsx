'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FileText, Settings, History, Calendar, Building2 } from "lucide-react"
import { CreateVersionDialog } from './create-version-dialog'

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
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
  isActive: boolean
  businessUnit: string | null
}

export function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      console.log('Fetching templates...')
      const response = await fetch('/api/templates')
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error response:', errorData)
        throw new Error('Failed to fetch templates')
      }
      
      const data = await response.json()
      console.log('Templates data:', data)
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (templateId: string) => {
    router.push(`/dashboard/templates/${templateId}`)
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by creating a new template.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card key={template.id} className="group hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-medium">
                {template.name}
              </CardTitle>
              <Badge variant={template.isActive ? 'default' : 'secondary'}>
                {template.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {template.description && (
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                </div>
                <div>{template.category.name}</div>
                
                <div className="flex items-center">
                  <History className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Versions:</span>
                </div>
                <div>{template.versions.length}</div>
                
                {template.businessUnit && (
                  <>
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Business Unit:</span>
                    </div>
                    <div>{template.businessUnit}</div>
                  </>
                )}
                
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                </div>
                <div>{new Date(template.updatedAt).toLocaleDateString()}</div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(template.id)}
                >
                  View Details
                </Button>
                <CreateVersionDialog
                  templateId={template.id}
                  onSuccess={fetchTemplates}
                >
                  <Button variant="outline" size="sm">
                    New Version
                  </Button>
                </CreateVersionDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 