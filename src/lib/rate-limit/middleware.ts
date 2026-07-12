/**
 * Rate limiting middleware with Fail-Open support
 * Implements sliding window rate limiting using Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit'
import type { RateLimitResult, RateLimitType } from './types'
import { getClientIp } from './ip-extractor'
import { getRedisClient } from './client'
import { RATE_LIMIT_CONFIGS } from './types'

/**
 * Check rate limit for a given request
 * Implements Fail-Open: if Redis is unavailable, the request is allowed
 *
 * @param req - The incoming request
 * @param type - The type of rate limit to apply
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  req: Request,
  type: RateLimitType
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[type]
  const ip = getClientIp(req)
  const identifier = `ratelimit:${type}:${ip}`

  try {
    const redis = getRedisClient()
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, config.window),
      analytics: false, // Disable analytics to reduce overhead
    })

    const result = await ratelimit.limit(identifier)

    return {
      success: result.success,
      limit: config.limit,
      remaining: result.remaining,
      reset: Math.floor(result.reset / 1000), // Convert to seconds
      error: null,
    }
  } catch (error) {
    // Fail-Open: If Redis is unavailable, allow the request
    console.error('Rate Limit Store Error (Fail-Open active):', error)

    // TODO: Send to monitoring service (Sentry, etc.)
    // Sentry.captureException(error, {
    //   tags: { component: 'rate-limit', action: 'fail-open' },
    //   extra: { type, ip },
    // })

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.floor(Date.now() / 1000) + 60, // Assume 1 minute window
      error: 'RATE_LIMIT_STORE_ERROR',
    }
  }
}

/**
 * Create rate limit response headers
 *
 * @param result - Rate limit result
 * @returns Headers object with rate limit information
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

/**
 * Create rate limit error response
 *
 * @param result - Rate limit result
 * @returns Response object with 429 status and error details
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.max(0, result.reset - Math.floor(Date.now() / 1000))

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'リクエスト数が制限を超えました。しばらく待ってから再試行してください。',
      retryAfter,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        ...createRateLimitHeaders(result),
      },
    }
  )
}
