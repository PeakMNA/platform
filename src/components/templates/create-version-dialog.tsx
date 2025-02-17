'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface CreateVersionDialogProps {
  children: React.ReactNode
  templateId: string
  onSuccess?: () => void
}

export function CreateVersionDialog({ 
  children, 
  templateId,
  onSuccess 
}: CreateVersionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      let content: any

      try {
        content = JSON.parse(formData.get('content') as string)
      } catch (error) {
        toast({
          title: 'Invalid JSON',
          description: 'Please enter valid JSON content',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch(`/api/templates/${templateId}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create version')
      }

      toast({
        title: 'Success',
        description: 'Version created successfully',
      })
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating version:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create version',
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
          <DialogTitle>Create New Version</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content (JSON)</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Enter template content in JSON format"
              rows={10}
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter the template content as a valid JSON object.
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
              {loading ? 'Creating...' : 'Create Version'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 