import { prisma } from '@/lib/prisma'
import { EventEmitter } from 'events'
import Bull from 'bull'
import Redis from 'ioredis'
import { 
  EmailProvider, 
  SMSProvider, 
  PushProvider, 
  WebhookProvider, 
  SlackProvider,
  NotificationProvider,
  NotificationChannel
} from '../providers'
import type { Notification, Prisma } from '@prisma/client'

// Redis client for Bull queue
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

interface QueueJobData {
  id: string
  tenantId: string
  title: string
  content: string
  type: NotificationChannel['type']
  recipient: string
  metadata?: Prisma.JsonValue
}

interface DeliveryStats {
  total: number
  sent: number
  failed: number
  pending: number
}

class NotificationService extends EventEmitter {
  private readonly MAX_RETRIES = 3
  private readonly RATE_LIMITS = {
    email: 100,    // per minute
    sms: 50,       // per minute
    push: 200,     // per minute
    webhook: 100,  // per minute
    slack: 50      // per minute
  } as const
  private queues: Record<NotificationChannel['type'], Bull.Queue<QueueJobData>> = {} as Record<NotificationChannel['type'], Bull.Queue<QueueJobData>>
  private channels: Record<NotificationChannel['type'], NotificationProvider> = {} as Record<NotificationChannel['type'], NotificationProvider>

  constructor() {
    super()
    this.initializeQueues()
    this.initializeChannels()
  }

  private initializeQueues() {
    const queueOptions: Bull.QueueOptions = {
      createClient: (type) => {
        switch (type) {
          case 'client':
            return redisClient
          case 'subscriber':
            return new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
          case 'bclient':
            return new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
          default:
            return redisClient
        }
      },
      defaultJobOptions: {
        attempts: this.MAX_RETRIES,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    }

    this.queues = {
      email: new Bull('email-notifications', queueOptions),
      sms: new Bull('sms-notifications', queueOptions),
      push: new Bull('push-notifications', queueOptions),
      webhook: new Bull('webhook-notifications', queueOptions),
      slack: new Bull('slack-notifications', queueOptions)
    }

    // Set up queue processors
    Object.entries(this.queues).forEach(([, queue]) => {
      queue.process(async (job) => {
        return this.processNotification(job.data)
      })

      queue.on('failed', (job, err) => {
        this.handleFailedJob(job.data, err)
      })
    })
  }

  private initializeChannels() {
    this.channels = {
      email: new EmailProvider(),
      sms: new SMSProvider(),
      push: new PushProvider(),
      webhook: new WebhookProvider(),
      slack: new SlackProvider()
    }
  }

  async send(data: {
    tenantId: string
    title: string
    content: string
    type: NotificationChannel['type']
    recipient: string
    priority?: 'high' | 'medium' | 'low'
    metadata?: Prisma.JsonValue
    templateId?: string
  }): Promise<Notification> {
    try {
      // Create notification record
      const notification = await prisma.$transaction(async (tx) => {
        const notif = await tx.notification.create({
          data: {
            tenant: {
              connect: { id: data.tenantId }
            },
            title: data.title,
            content: data.content,
            type: data.type,
            status: 'pending',
            priority: data.priority || 'low',
            recipient: data.recipient,
            metadata: data.metadata || {},
            templateId: data.templateId
          },
          include: {
            deliveries: true
          }
        })

        // Emit event for logging/monitoring
        this.emit('notification:created', notif)

        // Add to appropriate queue based on priority
        const delay = this.getDelayByPriority(data.priority)
        await this.queues[data.type].add(
          {
            id: notif.id,
            tenantId: notif.tenantId,
            title: notif.title,
            content: notif.content,
            type: notif.type as NotificationChannel['type'],
            recipient: notif.recipient,
            metadata: notif.metadata
          },
          {
            priority: this.getPriorityLevel(data.priority),
            delay
          }
        )

        return notif
      })

      return notification
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  private getDelayByPriority(priority?: string): number {
    switch (priority) {
      case 'high':
        return 0
      case 'medium':
        return 5000 // 5 seconds
      case 'low':
      default:
        return 10000 // 10 seconds
    }
  }

  private getPriorityLevel(priority?: string): number {
    switch (priority) {
      case 'high':
        return 1
      case 'medium':
        return 2
      case 'low':
      default:
        return 3
    }
  }

  private async processNotification(data: QueueJobData): Promise<{ success: boolean; error?: string }> {
    try {
      const channel = this.channels[data.type]
      if (!channel) {
        throw new Error(`Channel ${data.type} is not available`)
      }

      // Check user preferences
      const userPreference = await this.getUserPreference(data.recipient, data.type)
      if (!userPreference?.enabled) {
        throw new Error(`User has disabled ${data.type} notifications`)
      }

      // Create delivery record
      const delivery = await prisma.$transaction(async (tx) => {
        const del = await tx.notificationDelivery.create({
          data: {
            notification: {
              connect: { id: data.id }
            },
            channel: data.type,
            status: 'pending',
            attemptCount: 1
          }
        })

        // Send via provider
        const result = await channel.send({
          to: data.recipient,
          subject: data.title,
          content: data.content,
          metadata: data.metadata
        })

        // Update delivery status
        await tx.notificationDelivery.update({
          where: { id: del.id },
          data: {
            status: result.success ? 'success' : 'failed',
            lastAttemptAt: new Date(),
            error: result.error
          }
        })

        // Update notification status
        await tx.notification.update({
          where: { id: data.id },
          data: {
            status: result.success ? 'sent' : 'failed',
            error: result.error,
            sentAt: result.success ? new Date() : undefined
          }
        })

        this.emit('notification:processed', { id: data.id, success: result.success })
        return { success: result.success, error: result.error }
      })

      return delivery
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error processing notification:', errorMessage)
      
      await this.updateNotificationStatus(data.id, 'failed', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  private async handleFailedJob(data: QueueJobData, error: Error) {
    const deliveryCount = await prisma.notificationDelivery.count({
      where: { notificationId: data.id }
    })

    if (deliveryCount >= this.MAX_RETRIES) {
      await this.updateNotificationStatus(data.id, 'failed', error.message)
      this.emit('notification:failed', { id: data.id, error: error.message })
    }
  }

  private async updateNotificationStatus(id: string, status: 'sent' | 'failed', error?: string) {
    await prisma.notification.update({
      where: { id },
      data: {
        status,
        error,
        sentAt: status === 'sent' ? new Date() : undefined
      }
    })
  }

  private async getUserPreference(userId: string, channel: NotificationChannel['type']) {
    const preference = await prisma.notificationPreference.findUnique({
      where: {
        userId_channel: {
          userId,
          channel
        }
      }
    })
    return preference
  }

  async getDeliveryStats(tenantId: string): Promise<DeliveryStats> {
    const [total, sent, failed, pending] = await Promise.all([
      prisma.notificationDelivery.count({
        where: { notification: { tenantId } }
      }),
      prisma.notificationDelivery.count({
        where: { notification: { tenantId }, status: 'success' }
      }),
      prisma.notificationDelivery.count({
        where: { notification: { tenantId }, status: 'failed' }
      }),
      prisma.notificationDelivery.count({
        where: { notification: { tenantId }, status: 'pending' }
      })
    ])

    return { total, sent, failed, pending }
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
export default NotificationService 