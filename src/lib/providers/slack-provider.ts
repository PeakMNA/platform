import { NotificationProvider, NotificationMessage, NotificationProviderConfig } from '.'

export class SlackProvider implements NotificationProvider {
  private config: NotificationProviderConfig
  private available: boolean = true

  constructor(config: NotificationProviderConfig = {}) {
    this.config = {
      apiKey: process.env.SLACK_BOT_TOKEN,
      endpoint: process.env.SLACK_WEBHOOK_URL,
      ...config
    }
  }

  async send(message: NotificationMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Simulate Slack message sending
      console.log('Sending Slack message:', {
        channel: message.to,
        text: message.content,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: message.subject
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message.content
            }
          },
          ...(Array.isArray(message.metadata?.blocks) ? message.metadata.blocks : [])
        ]
      })

      // Simulate random success/failure
      if (Math.random() > 0.97) {
        throw new Error('Simulated Slack message failure')
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 400))

      return {
        success: true,
        messageId: `slack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch {
      return {
        success: false,
        error: 'Unknown error'
      }
    }
  }

  async validateConfig(): Promise<boolean> {
    return !!(this.config.apiKey || this.config.endpoint)
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