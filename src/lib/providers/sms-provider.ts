import { NotificationProvider, NotificationMessage, NotificationProviderConfig } from '.'

export class SMSProvider implements NotificationProvider {
  private config: NotificationProviderConfig
  private available: boolean = true

  constructor(config: NotificationProviderConfig = {}) {
    this.config = {
      apiKey: process.env.SMS_PROVIDER_API_KEY,
      apiSecret: process.env.SMS_PROVIDER_API_SECRET,
      region: process.env.SMS_PROVIDER_REGION || 'us-east-1',
      ...config
    }
  }

  async send(message: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Simulate SMS sending
      console.log('Sending SMS:', {
        to: message.to,
        content: message.content,
        metadata: message.metadata
      })

      // Simulate random success/failure
      if (Math.random() > 0.95) {
        throw new Error('Simulated SMS sending failure')
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500))

      return {
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch {
      return {
        success: false,
        error: 'Unknown error'
      }
    }
  }

  async validateConfig(): Promise<boolean> {
    return !!(this.config.apiKey && this.config.apiSecret)
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