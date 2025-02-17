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
import { FileText, Home } from "lucide-react"
import { userApi, authApi } from '@/lib/api'

interface User {
  name: string
  email: string
  avatar?: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    userApi.getProfile()
      .then(setUser)
      .catch(() => router.push('/auth/login'))
  }, [router])

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold">Carmen Platform</h1>
              
              <nav className="flex items-center gap-4">
                <Link 
                  href="/dashboard" 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent",
                    pathname === '/dashboard' && "bg-accent"
                  )}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link 
                  href="/dashboard/templates" 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent",
                    pathname?.startsWith('/dashboard/templates') && "bg-accent"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span>Templates</span>
                </Link>
              </nav>
            </div>
            
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
} 