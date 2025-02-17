'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { 
  FileText, 
  Home, 
  Settings, 
  LayoutDashboard, 
  Cog,
  UserCog,
  BellRing,
  FileStack,
  BookOpen
} from "lucide-react"
import { userApi, authApi } from '@/lib/api'

interface User {
  name: string
  email: string
  avatar?: string
  role?: string
}

const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Services',
    href: '/dashboard/admin/services',
    icon: Cog
  },
  {
    name: 'User Management',
    href: '/dashboard/admin/users',
    icon: UserCog
  },
  {
    name: 'Notification Management',
    href: '/dashboard/admin/notifications',
    icon: BellRing
  },
  {
    name: 'Template Management',
    href: '/dashboard/admin/templates',
    icon: FileStack
  },
  {
    name: 'Documentation',
    href: '/dashboard/admin/documentation',
    icon: BookOpen
  },
  {
    name: 'Settings',
    href: '/dashboard/admin/settings',
    icon: Settings
  }
]

const userNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Templates',
    href: '/dashboard/templates',
    icon: FileText
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const isAdminRoute = pathname?.startsWith('/dashboard/admin')

  useEffect(() => {
    userApi.getProfile()
      .then((profile) => {
        setUser(profile)
        if (isAdminRoute && profile.role !== 'admin') {
          router.push('/dashboard')
        }
      })
      .catch(() => router.push('/auth/login'))
  }, [router, isAdminRoute, pathname])

  const handleLogout = async () => {
    try {
      await authApi.logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we load your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-semibold">
            {isAdminRoute ? 'Admin Panel' : 'Carmen Platform'}
          </h1>
        </div>
        <nav className="space-y-1 p-4">
          {(isAdminRoute ? adminNavigation : userNavigation).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent",
                pathname === item.href && "bg-accent"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
          
          {user.role === 'admin' && !isAdminRoute && (
            <>
              <Separator className="my-4" />
              <Link
                href="/dashboard/admin"
                className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent"
              >
                <Settings className="mr-3 h-5 w-5" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-background">
          <div className="h-full px-6 flex items-center justify-end">
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-4">
                    <div className="font-medium">{user.email}</div>
                    <Separator />
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 