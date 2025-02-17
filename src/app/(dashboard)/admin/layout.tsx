'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  BellRing, 
  FileStack,
  Settings,
  Server,
  BookOpen,
  Activity
} from "lucide-react"

const navigation = [
  {
    name: 'Overview',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: BellRing
  },
  {
    name: 'Templates',
    href: '/admin/templates',
    icon: FileStack
  },
  {
    name: 'Services',
    href: '/admin/services',
    icon: Server
  },
  {
    name: 'Documentation',
    href: '/admin/documentation',
    icon: BookOpen
  },
  {
    name: 'Monitoring',
    href: '/admin/monitoring',
    icon: Activity
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check admin role
    const checkAdminRole = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        
        if (!response.ok || data.role !== 'admin') {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error checking admin role:', error)
        router.push('/dashboard')
      }
    }

    checkAdminRole()
  }, [router])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r bg-background">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
          <div className="flex flex-col flex-1 py-4 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  )
} 