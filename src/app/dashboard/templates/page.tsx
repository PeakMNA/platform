'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { FileText, FolderTree } from "lucide-react"
import { TemplateList } from '@/components/templates/template-list'
import { TemplateCategories } from '@/components/templates/template-categories'

export default function TemplatesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial load complete
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">
            <FileText className="mr-2 h-4 w-4" />
            All Templates
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderTree className="mr-2 h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <TemplateList />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <TemplateCategories />
        </TabsContent>
      </Tabs>
    </div>
  )
} 