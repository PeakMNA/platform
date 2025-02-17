interface ApiOptions {
  method?: string
  body?: Record<string, unknown>
  headers?: HeadersInit
}

// Get the base URL from environment or default to relative path
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

// API Response Types
interface AlertResponse {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  status: 'active' | 'resolved'
  createdAt: string
  resolvedAt: string | null
}

interface AlertsResponse {
  alerts: AlertResponse[]
  counts: {
    total: number
    active: number
    critical: number
    warning: number
  }
}

interface MetricsResponse {
  system: {
    cpu: { usage: number; cores: number; temperature: number }
    memory: { total: number; used: number; free: number }
    storage: { total: number; used: number; free: number }
  }
  services: { total: number; healthy: number; degraded: number; failed: number }
  traffic: { requests: number; avgResponseTime: number; errorRate: number }
  users: { active: number; newToday: number; totalRegistered: number }
}

interface HealthResponse {
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

interface UserResponse {
  id: string
  email: string
  name: string
  role: string
  businessUnit?: string
  tenantId: string
  avatar?: string
  createdAt: string
  lastLoginAt: string | null
  status: string
}

interface UsersListResponse {
  users: UserResponse[]
  pagination: {
    total: number
    totalPages: number
    currentPage: number
    limit: number
  }
}

interface AuthResponse {
  user: UserResponse
  session: string
}

// Define metadata types for different notification channels
export interface NotificationMetadata {
  email?: {
    attachments?: Array<{
      filename: string
      content: string
      contentType: string
    }>
  }
  sms?: {
    sender?: string
  }
  push?: {
    icon?: string
    image?: string
    badge?: number
    data?: Record<string, unknown>
  }
  webhook?: {
    headers?: Record<string, string>
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  }
  slack?: {
    blocks?: Array<{
      type: string
      text?: {
        type: string
        text: string
      }
    }>
  }
  in_app?: {
    action?: string
    link?: string
    icon?: string
  }
  [key: string]: unknown
}

interface NotificationResponse {
  id: string
  title: string
  content: string
  type: 'email' | 'sms' | 'in_app' | 'push' | 'webhook' | 'slack'
  status: 'pending' | 'sent' | 'failed'
  recipient: string
  metadata?: NotificationMetadata
  createdAt: string
  sentAt?: string
  error?: string
}

interface NotificationsResponse {
  notifications: NotificationResponse[]
  total: number
}

interface NotificationTemplateResponse {
  id: string
  name: string
  description?: string
  type: 'email' | 'sms' | 'in_app' | 'push' | 'webhook' | 'slack'
  content: string
  metadata?: NotificationMetadata
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options
  
  // Use BASE_URL if it exists, otherwise use relative path
  const url = BASE_URL ? `${BASE_URL}${endpoint}` : endpoint
  
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!res.ok) {
    throw new ApiError(res.status, await res.text())
  }

  return res.json()
}

// Common API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) => 
    api<AuthResponse>('/api/auth/login', { method: 'POST', body: credentials }),
    
  logout: () => api<{ success: true }>('/api/auth/logout', { method: 'POST' }),
  
  register: (userData: { email: string; password: string; name: string }) =>
    api<AuthResponse>('/api/auth/register', { method: 'POST', body: userData }),
}

export const userApi = {
  getProfile: () => api<UserResponse>('/api/users/profile'),
  
  updateProfile: (data: Partial<{ name: string; email: string }>) =>
    api<UserResponse>('/api/users/profile', { method: 'PATCH', body: data }),
    
  listUsers: (params?: { page?: number; limit?: number }) =>
    api<UsersListResponse>('/api/users', { method: 'GET', body: params }),
}

export const systemApi = {
  getHealth: () => api<HealthResponse>('/api/system/health'),
  
  getMetrics: () => api<MetricsResponse>('/api/system/metrics'),
  
  getAlerts: (params?: { status?: string; severity?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.severity) searchParams.set('severity', params.severity)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    return api<AlertsResponse>(`/api/system/alerts?${searchParams.toString()}`)
  },

  createAlert: (data: {
    title: string
    description: string
    severity: 'critical' | 'warning' | 'info'
    status?: 'active' | 'resolved'
  }) => api<AlertResponse>('/api/system/alerts', {
    method: 'POST',
    body: data
  }),

  updateAlert: (id: string, data: {
    title?: string
    description?: string
    severity?: 'critical' | 'warning' | 'info'
    status?: 'active' | 'resolved'
  }) => api<AlertResponse>(`/api/system/alerts?id=${id}`, {
    method: 'PATCH',
    body: data
  })
}

export const notificationApi = {
  send: (data: {
    title: string
    content: string
    type: 'email' | 'sms' | 'in_app' | 'push' | 'webhook' | 'slack'
    recipient: string
    metadata?: NotificationMetadata
  }) => api<NotificationResponse>('/api/notifications', {
    method: 'POST',
    body: data
  }),

  list: (params?: {
    type?: string
    status?: string
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    return api<NotificationsResponse>(`/api/notifications?${searchParams.toString()}`)
  },

  createTemplate: (data: {
    name: string
    description?: string
    type: 'email' | 'sms' | 'in_app' | 'push' | 'webhook' | 'slack'
    content: string
    metadata?: NotificationMetadata
  }) => api<NotificationTemplateResponse>('/api/notifications/templates', {
    method: 'POST',
    body: data
  }),

  listTemplates: (params?: {
    type?: string
    isActive?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.set('type', params.type)
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString())
    return api<NotificationTemplateResponse[]>(`/api/notifications/templates?${searchParams.toString()}`)
  }
} 