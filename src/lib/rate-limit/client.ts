/**
 * Upstash Redis client initialization
 * Handles Redis connection with proper error handling
 */

import { Redis } from '@upstash/redis'

let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient
  }

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error(
      'Upstash Redis credentials are not configured. ' +
        'Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
    )
  }

  redisClient = new Redis({
    url,
    token,
    // Enable automatic retries
    retry: {
      retries: 3,
    },
  })

  return redisClient
}

export function resetRedisClient(): void {
  redisClient = null
}
