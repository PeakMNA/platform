'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { TemplateConfiguration } from './configuration-list'

interface Version {
  id: string
  version: number
}

interface CreateConfigurationDialogProps {
  children: React.ReactNode
  versions: Version[]
  onSuccess?: () => void
}

export function CreateConfigurationDialog({ 
  children, 
  versions,
  onSuccess 
}: CreateConfigurationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      let configuration: TemplateConfiguration

      try {
        configuration = JSON.parse(formData.get('configuration') as string)
      } catch {
        toast({
          title: 'Invalid JSON',
          description: 'Please enter valid JSON configuration',
          variant: 'destructive',
        })
        return
      }

      const data = {
        versionId: formData.get('versionId'),
        businessUnit: formData.get('businessUnit'),
        configuration,
      }

      const response = await fetch('/api/templates/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create configuration')
      }

      toast({
        title: 'Success',
        description: 'Configuration created successfully',
      })
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating configuration:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create configuration',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Configuration</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="versionId">Version</Label>
            <Select name="versionId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    Version {version.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessUnit">Business Unit</Label>
            <Input
              id="businessUnit"
              name="businessUnit"
              placeholder="Enter business unit"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="configuration">Configuration (JSON)</Label>
            <Textarea
              id="configuration"
              name="configuration"
              placeholder="Enter configuration in JSON format"
              rows={10}
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter the configuration as a valid JSON object.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Configuration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 