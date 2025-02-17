export interface NotificationProviderConfig {
  apiKey?: string
  apiSecret?: string
  region?: string
  endpoint?: string
  options?: Record<string, unknown>
}

export interface NotificationMessage {
  to: string
  subject: string
  content: string
  metadata?: Record<string, unknown>
}

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }>
  validateConfig(): Promise<boolean>
  getStatus(): Promise<{ available: boolean; latency: number }>
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack'
}

import { EmailProvider } from './email-provider'
import { SMSProvider } from './sms-provider'
import { PushProvider } from './push-provider'
import { WebhookProvider } from './webhook-provider'
import { SlackProvider } from './slack-provider'

export {
  EmailProvider,
  SMSProvider,
  PushProvider,
  WebhookProvider,
  SlackProvider
} 