import { NotificationProvider, NotificationMessage, NotificationProviderConfig } from '.'

export class WebhookProvider implements NotificationProvider {
  private config: NotificationProviderConfig
  private available: boolean = true

  constructor(config: NotificationProviderConfig = {}) {
    this.config = {
      endpoint: process.env.WEBHOOK_PROVIDER_ENDPOINT,
      apiKey: process.env.WEBHOOK_PROVIDER_API_KEY,
      ...config
    }
  }

  async send(message: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Simulate webhook call
      console.log('Sending webhook notification:', {
        endpoint: this.config.endpoint,
        payload: {
          to: message.to,
          subject: message.subject,
          content: message.content,
          metadata: message.metadata,
          timestamp: new Date().toISOString()
        }
      })

      // Simulate random success/failure
      if (Math.random() > 0.95) {
        throw new Error('Simulated webhook failure')
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 800))

      return {
        success: true,
        messageId: `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch {
      return {
        success: false,
        error: 'Unknown error'
      }
    }
  }

  async validateConfig(): Promise<boolean> {
    return !!this.config.endpoint
  }

  async getStatus(): Promise<{ available: boolean; latency: number }> {
    const startTime = Date.now()
    
    try {
      await this.validateConfig()
      const latency = Date.now() - startTime
      
      return {
        available: this.available,
        latency
      }
    } catch {
      return {
        available: false,
        latency: -1
      }
    }
  }
} 