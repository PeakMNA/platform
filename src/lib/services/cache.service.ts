import { EventEmitter } from 'events'
import Redis from 'ioredis'

interface CacheEntry<T> {
  value: T
  expiresAt: number | null
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
}

class CacheService {
  private memoryCache: Map<string, CacheEntry<unknown>>
  private redisClient: Redis | null
  private events: EventEmitter
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    this.memoryCache = new Map()
    this.events = new EventEmitter()
    
    // Initialize Redis if configured
    const redisUrl = process.env.REDIS_URL
    if (redisUrl) {
      this.redisClient = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000)
          return delay
        }
      })

      this.redisClient.on('error', (error) => {
        console.error('Redis connection error:', error)
      })

      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully')
      })
    } else {
      this.redisClient = null
      console.log('Redis not configured, using in-memory cache only')
    }
    
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first if available
      if (this.redisClient) {
        const redisValue = await this.redisClient.get(key)
        if (redisValue) {
          const parsed = JSON.parse(redisValue)
          if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
            await this.delete(key)
            return null
          }
          return parsed.value as T
        }
      }

      // Fallback to memory cache
      const memoryEntry = this.memoryCache.get(key)
      if (!memoryEntry) {
        return null
      }

      // Check if entry has expired
      if (memoryEntry.expiresAt && memoryEntry.expiresAt < Date.now()) {
        this.memoryCache.delete(key)
        return null
      }

      return memoryEntry.value as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const expiresAt = options.ttl ? Date.now() + options.ttl : null
      const entry: CacheEntry<T> = { value, expiresAt }

      // Set in Redis if available
      if (this.redisClient) {
        await this.redisClient.set(
          key,
          JSON.stringify(entry),
          'PX',
          options.ttl || 0
        )
      }

      // Set in memory cache as backup
      this.memoryCache.set(key, entry as CacheEntry<unknown>)
      this.events.emit('set', key)
    } catch (error) {
      console.error('Cache set error:', error)
      // Fallback to memory cache only
      const entry: CacheEntry<T> = {
        value,
        expiresAt: options.ttl ? Date.now() + options.ttl : null
      }
      this.memoryCache.set(key, entry as CacheEntry<unknown>)
      this.events.emit('set', key)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.del(key)
      }
      this.memoryCache.delete(key)
      this.events.emit('delete', key)
    } catch (error) {
      console.error('Cache delete error:', error)
      // Fallback to memory cache only
      this.memoryCache.delete(key)
      this.events.emit('delete', key)
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.flushall()
      }
      this.memoryCache.clear()
      this.events.emit('clear')
    } catch (error) {
      console.error('Cache clear error:', error)
      // Fallback to memory cache only
      this.memoryCache.clear()
      this.events.emit('clear')
    }
  }

  onSet(callback: (key: string) => void): void {
    this.events.on('set', callback)
  }

  onDelete(callback: (key: string) => void): void {
    this.events.on('delete', callback)
  }

  onClear(callback: () => void): void {
    this.events.on('clear', callback)
  }

  private async cleanup(): Promise<void> {
    const now = Date.now()
    
    // Cleanup memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.memoryCache.delete(key)
        this.events.emit('delete', key)
      }
    }
  }

  // Cleanup on service shutdown
  async destroy(): Promise<void> {
    clearInterval(this.cleanupInterval)
    this.events.removeAllListeners()
    if (this.redisClient) {
      await this.redisClient.quit()
    }
    this.memoryCache.clear()
  }
}

// Export singleton instance
export const cacheService = new CacheService() 