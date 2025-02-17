'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Folder, Plus, MoreHorizontal, Edit, Eye, Power } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Category {
  id: string
  name: string
  description: string | null
  templates: Array<{
    id: string
    name: string
  }>
  createdAt: string
  updatedAt: string
  isActive: boolean
}

interface EditDialogState {
  isOpen: boolean
  category: Category | null
}

export function TemplateCategories() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    category: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/templates/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    try {
      const response = await fetch('/api/templates/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create category')
      }

      toast({
        title: 'Success',
        description: 'Category created successfully',
      })
      setCreateDialogOpen(false)
      fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create category',
        variant: 'destructive',
      })
    }
  }

  const handleEditCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editDialog.category) return

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    try {
      const response = await fetch(`/api/templates/categories/${editDialog.category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update category')
      }

      toast({
        title: 'Success',
        description: 'Category updated successfully',
      })
      setEditDialog({ isOpen: false, category: null })
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      })
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/templates/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !category.isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update category')
      }

      toast({
        title: 'Success',
        description: `Category ${category.isActive ? 'deactivated' : 'activated'} successfully`,
      })
      fetchCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Template Categories</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Create Category</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-medium">
                    {category.name}
                  </CardTitle>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditDialog({ isOpen: true, category })}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(`/dashboard/templates?category=${category.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Templates
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleActive(category)}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-2">
                <Badge variant={category.isActive ? 'default' : 'secondary'}>
                  {category.templates.length} Templates
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                  {category.templates.length === 0 ? (
                    <span className="text-muted-foreground">No templates</span>
                  ) : (
                    <ul className="space-y-1">
                      {category.templates.slice(0, 3).map((template) => (
                        <li key={template.id}>{template.name}</li>
                      ))}
                      {category.templates.length > 3 && (
                        <li className="text-muted-foreground">
                          +{category.templates.length - 3} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editDialog.isOpen} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={editDialog.category?.name}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={editDialog.category?.description || ''}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Update Category</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 