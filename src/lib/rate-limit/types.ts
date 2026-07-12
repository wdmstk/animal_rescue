/**
 * Rate limiting types and interfaces
 */

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp in seconds
  error: string | null
}

export interface RateLimitConfig {
  limit: number
  window: string // e.g., "1 m", "1 h", "1 d"
}

export type RateLimitType = 'login' | 'signup' | 'public'

export const RATE_LIMIT_CONFIGS: Record<RateLimitType, RateLimitConfig> = {
  login: { limit: 10, window: '1 m' },
  signup: { limit: 5, window: '1 m' },
  public: { limit: 60, window: '1 m' },
}
