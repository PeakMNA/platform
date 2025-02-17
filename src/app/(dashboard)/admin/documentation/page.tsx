'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, ExternalLink } from "lucide-react"

interface DocCategory {
  name: string
  description: string
  documents: Document[]
}

interface Document {
  name: string
  path: string
  status: 'complete' | 'in-progress' | 'draft'
  lastUpdated: string
  size: string
}

const categories: DocCategory[] = [
  {
    name: 'Overview Documents',
    description: 'Platform and system overview documentation',
    documents: [
      {
        name: 'Platform Overview',
        path: '/docs/platform-overview.md',
        status: 'complete',
        lastUpdated: 'Feb 15, 2024',
        size: '19KB'
      },
      {
        name: 'Carmen Platform Overview',
        path: '/docs/carme-platform-overview.md',
        status: 'complete',
        lastUpdated: 'Feb 15, 2024',
        size: '5.1KB'
      }
    ]
  },
  {
    name: 'User Experience & Design',
    description: 'User flows, design specifications, and process maps',
    documents: [
      {
        name: 'User Flow',
        path: '/docs/user-flow.md',
        status: 'complete',
        lastUpdated: 'Feb 15, 2024',
        size: '11KB'
      },
      {
        name: 'Page Design',
        path: '/docs/page-design.md',
        status: 'in-progress',
        lastUpdated: 'Feb 15, 2024',
        size: '0B'
      }
    ]
  },
  {
    name: 'Product Requirements',
    description: 'Detailed product requirements documents',
    documents: [
      {
        name: 'User Management System',
        path: '/docs/ums-product-requirements.md',
        status: 'complete',
        lastUpdated: 'Feb 16, 2024',
        size: '4.9KB'
      },
      {
        name: 'Security System',
        path: '/docs/sec-product-requirements.md',
        status: 'complete',
        lastUpdated: 'Feb 16, 2024',
        size: '3.4KB'
      }
    ]
  }
]

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory] = useState<string | null>(null)

  const filteredCategories = categories.filter(category => 
    !selectedCategory || category.name === selectedCategory
  )

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'complete':
        return 'default'
      case 'in-progress':
        return 'secondary'
      case 'draft':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Button variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredCategories.map((category) => (
        <Card key={category.name}>
          <CardHeader>
            <CardTitle>{category.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {category.description}
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.documents.map((doc) => (
                  <TableRow key={doc.path}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(doc.status)}>
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.lastUpdated}</TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 