'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertsCard } from '@/components/alerts-card'
import { systemApi } from '@/lib/api'
import { AlertCircle, Clock, Server, Users, Activity, Database, HardDrive, Search, MoreHorizontal, UserPlus, BellRing, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Metrics {
  system: {
    cpu: { usage: number; cores: number; temperature: number }
    memory: { total: number; used: number; free: number }
    storage: { total: number; used: number; free: number }
  }
  services: { total: number; healthy: number; degraded: number; failed: number }
  traffic: { requests: number; avgResponseTime: number; errorRate: number }
  users: { active: number; newToday: number; totalRegistered: number }
}

interface Health {
  status: string
  timestamp: string
  services: Array<{
    name: string
    status: string
    uptime: string
    latency: string
  }>
  regions: Array<{
    name: string
    status: string
    latency: string
  }>
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastLoginAt: string | null
}

interface Notification {
  id: string
  title: string
  type: string
  status: string
  createdAt: string
}

interface UserExtended extends User {
  businessUnit?: string
  department?: string
  lastActive?: string
}

interface NotificationExtended extends Notification {
  recipients: number
  deliveryStatus: 'sent' | 'failed' | 'pending'
  priority: 'high' | 'medium' | 'low'
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [userSearch, setUserSearch] = useState('')
  const [notificationSearch, setNotificationSearch] = useState('')
  const [notificationStatus, setNotificationStatus] = useState('all')
  const MAX_RETRIES = 3
  const RETRY_DELAY = 5000

  useEffect(() => {
    let mounted = true
    const pollInterval = setInterval(fetchData, 10000)

    async function fetchData() {
      try {
        const [metricsData, healthData] = await Promise.all([
          systemApi.getMetrics(),
          systemApi.getHealth()
        ])
        
        if (mounted) {
          setMetrics(metricsData)
          setHealth(healthData)
          setError('')
          setRetryCount(0)
        }
      } catch (err) {
        console.error('Dashboard error:', err)
        
        if (mounted) {
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1)
            setTimeout(fetchData, RETRY_DELAY)
          } else {
            setError('Failed to load dashboard data. Please try again later.')
          }
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
      clearInterval(pollInterval)
    }
  }, [retryCount])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users')
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        setUsers(data.users)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    async function fetchNotifications() {
      try {
        const response = await fetch('/api/notifications')
        if (!response.ok) throw new Error('Failed to fetch notifications')
        const data = await response.json()
        setNotifications(data.notifications)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchUsers()
    fetchNotifications()
  }, [])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(notificationSearch.toLowerCase())
    const matchesStatus = notificationStatus === 'all' || notification.status === notificationStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium">Loading dashboard data...</div>
          <div className="text-sm text-muted-foreground">Please wait while we fetch the latest metrics</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!metrics || !health) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            Unable to load dashboard data. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'text-green-600 dark:text-green-400'
      case 'degraded': return 'text-yellow-600 dark:text-yellow-400'
      case 'failed': return 'text-red-600 dark:text-red-400'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.users.active}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="flex items-center text-green-500">
                    <Activity className="h-3 w-3 mr-1" />
                    +{metrics.users.newToday} today
                  </span>
                  <span className="mx-2">•</span>
                  <span>{metrics.users.totalRegistered} total</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Service Health</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.services.healthy}/{metrics.services.total}</div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="default" className="bg-green-500">
                    {metrics.services.healthy} healthy
                  </Badge>
                  {metrics.services.degraded > 0 && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      {metrics.services.degraded} degraded
                    </Badge>
                  )}
                  {metrics.services.failed > 0 && (
                    <Badge variant="destructive">
                      {metrics.services.failed} failed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.traffic.avgResponseTime}ms</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{metrics.traffic.requests.toLocaleString()} requests</span>
                  <span className="mx-2">•</span>
                  <span>Last 24h</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.traffic.errorRate}%</div>
                <div className="flex items-center text-xs">
                  <Badge 
                    variant={metrics.traffic.errorRate > 1 ? "destructive" : "default"}
                    className={metrics.traffic.errorRate > 1 ? "" : "bg-green-500"}
                  >
                    {metrics.traffic.errorRate > 1 ? "Above threshold" : "Normal"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Card */}
          <AlertsCard />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CPU Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>CPU Metrics</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Processor utilization and temperature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Usage ({metrics.system.cpu.cores} cores)</span>
                    <span>{metrics.system.cpu.usage}%</span>
                  </div>
                  <Progress 
                    value={metrics.system.cpu.usage} 
                    className={metrics.system.cpu.usage > 80 ? "text-red-500" : ""}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Temperature</span>
                    <span>{metrics.system.cpu.temperature}°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Memory Usage</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>RAM allocation and availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Used ({metrics.system.memory.used}GB / {metrics.system.memory.total}GB)</span>
                    <span>{((metrics.system.memory.used / metrics.system.memory.total) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(metrics.system.memory.used / metrics.system.memory.total) * 100} />
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="block">Free Memory</span>
                      <span className="text-foreground font-medium">{metrics.system.memory.free}GB</span>
                    </div>
                    <div>
                      <span className="block">Total Memory</span>
                      <span className="text-foreground font-medium">{metrics.system.memory.total}GB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Storage Overview</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>Storage capacity and utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Used Space ({metrics.system.storage.used}GB / {metrics.system.storage.total}GB)</span>
                    <span>{((metrics.system.storage.used / metrics.system.storage.total) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(metrics.system.storage.used / metrics.system.storage.total) * 100}
                    className={
                      (metrics.system.storage.used / metrics.system.storage.total) > 0.9 
                        ? "text-red-500" 
                        : (metrics.system.storage.used / metrics.system.storage.total) > 0.7 
                          ? "text-yellow-500" 
                          : ""
                    }
                  />
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="block">Used Storage</span>
                      <span className="text-foreground font-medium">{metrics.system.storage.used}GB</span>
                    </div>
                    <div>
                      <span className="block">Free Storage</span>
                      <span className="text-foreground font-medium">{metrics.system.storage.free}GB</span>
                    </div>
                    <div>
                      <span className="block">Total Capacity</span>
                      <span className="text-foreground font-medium">{metrics.system.storage.total}GB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Status</CardTitle>
                  <CardDescription>Current status of system services</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-green-500">
                    {metrics.services.healthy} Healthy
                  </Badge>
                  {metrics.services.degraded > 0 && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      {metrics.services.degraded} Degraded
                    </Badge>
                  )}
                  {metrics.services.failed > 0 && (
                    <Badge variant="destructive">
                      {metrics.services.failed} Failed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Latency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {health.services.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={service.status === 'healthy' ? 'default' : 'destructive'}
                          className={getStatusColor(service.status)}
                        >
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{service.uptime}</TableCell>
                      <TableCell>
                        <span className={
                          parseInt(service.latency) > 500 
                            ? 'text-red-500' 
                            : parseInt(service.latency) > 200 
                              ? 'text-yellow-500' 
                              : 'text-green-500'
                        }>
                          {service.latency}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage platform users and their permissions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Card className="flex-1">
                    <CardHeader className="py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.users.totalRegistered}</div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardHeader className="py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Active Today</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.users.active}</div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardHeader className="py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">New Users</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.users.newToday}</div>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>{(user as UserExtended).department || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(user as UserExtended).lastActive || 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                                <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Deactivate User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notification Management</CardTitle>
                  <CardDescription>Monitor and manage system notifications</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={notificationStatus}
                    onValueChange={setNotificationStatus}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search notifications..."
                    value={notificationSearch}
                    onChange={(e) => setNotificationSearch(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button>
                    <BellRing className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Card className="flex-1">
                    <CardHeader className="py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Total Sent</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,234</div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardHeader className="py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Pending</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardHeader className="py-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Failed</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5</div>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map(notification => (
                        <TableRow key={notification.id}>
                          <TableCell>{notification.title}</TableCell>
                          <TableCell>{notification.type}</TableCell>
                          <TableCell>
                            <Badge variant={
                              (notification as NotificationExtended).priority === 'high' 
                                ? 'destructive' 
                                : (notification as NotificationExtended).priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }>
                              {(notification as NotificationExtended).priority || 'low'}
                            </Badge>
                          </TableCell>
                          <TableCell>{(notification as NotificationExtended).recipients || 0}</TableCell>
                          <TableCell>
                            <Badge variant={
                              (notification as NotificationExtended).deliveryStatus === 'sent'
                                ? 'default'
                                : (notification as NotificationExtended).deliveryStatus === 'failed'
                                  ? 'destructive'
                                  : 'secondary'
                            }>
                              {(notification as NotificationExtended).deliveryStatus || notification.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(notification.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>View Recipients</DropdownMenuItem>
                                <DropdownMenuItem>Resend</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No notifications found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 