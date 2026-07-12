import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, createRateLimitHeaders, createRateLimitResponse } from '@/lib/rate-limit/middleware'
import { resetRedisClient } from '@/lib/rate-limit/client'

// Mock Upstash Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn()
}))

// Mock Upstash Ratelimit with static method
const globalMockLimit = vi.fn()
const mockRatelimitInstance = {
  limit: globalMockLimit
}

const { RatelimitMock } = vi.hoisted(() => ({
  RatelimitMock: class MockRatelimit {
    constructor(config: any) {
      return mockRatelimitInstance
    }
    static slidingWindow(limit: number, window: string) {
      return { limiter: 'slidingWindow' }
    }
  }
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: RatelimitMock
}))

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRedisClient()
    // Set environment variables for tests
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    globalMockLimit.mockClear()
  })

  it('正常にレート制限チェックを行う', async () => {
    globalMockLimit.mockResolvedValue({
      success: true,
      remaining: 9,
      reset: Date.now() + 60000
    })

    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '192.0.2.1' }
    })

    const result = await checkRateLimit(req, 'login')

    expect(result.success).toBe(true)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(9)
    expect(result.error).toBe(null)
    expect(globalMockLimit).toHaveBeenCalledWith('ratelimit:login:192.0.2.1')
  })

  it('レート制限超過時にsuccess=falseを返す', async () => {
    globalMockLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 60000
    })

    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '192.0.2.1' }
    })

    const result = await checkRateLimit(req, 'login')

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.error).toBe(null)
  })

  it('Redis接続エラー時にFail-Openする', async () => {
    globalMockLimit.mockRejectedValue(new Error('Connection failed'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const req = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '192.0.2.1' }
    })

    const result = await checkRateLimit(req, 'login')

    expect(result.success).toBe(true) // Fail-Open
    expect(result.error).toBe('RATE_LIMIT_STORE_ERROR')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Rate Limit Store Error (Fail-Open active):',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('signupタイプで正しい制限値を使用する', async () => {
    globalMockLimit.mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Date.now() + 60000
    })

    const req = new Request('http://example.com')

    const result = await checkRateLimit(req, 'signup')

    expect(result.limit).toBe(5)
    expect(result.remaining).toBe(4)
  })

  it('publicタイプで正しい制限値を使用する', async () => {
    globalMockLimit.mockResolvedValue({
      success: true,
      remaining: 59,
      reset: Date.now() + 60000
    })

    const req = new Request('http://example.com')

    const result = await checkRateLimit(req, 'public')

    expect(result.limit).toBe(60)
    expect(result.remaining).toBe(59)
  })

  it('環境変数が未設定の場合、Fail-Openでリクエストを許可する', async () => {
    // 環境変数を一時的に削除
    const originalUrl = process.env.UPSTASH_REDIS_REST_URL
    const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    resetRedisClient()

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const req = new Request('http://example.com')

    const result = await checkRateLimit(req, 'login')

    expect(result.success).toBe(true) // Fail-Open allows request
    expect(result.error).toBe('RATE_LIMIT_STORE_ERROR')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Rate Limit Store Error (Fail-Open active):',
      expect.any(Error)
    )

    consoleSpy.mockRestore()

    // 環境変数を復元
    if (originalUrl) process.env.UPSTASH_REDIS_REST_URL = originalUrl
    if (originalToken) process.env.UPSTASH_REDIS_REST_TOKEN = originalToken
  })
})

describe('createRateLimitHeaders', () => {
  it('レート制限情報を含むヘッダーを作成する', () => {
    const result = {
      success: true,
      limit: 10,
      remaining: 5,
      reset: 1720876800,
      error: null
    }

    const headers = createRateLimitHeaders(result)

    expect(headers).toEqual({
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': '5',
      'X-RateLimit-Reset': '1720876800'
    })
  })
})

describe('createRateLimitResponse', () => {
  it('429ステータスとエラーレスポンスを作成する', () => {
    const result = {
      success: false,
      limit: 10,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 45,
      error: null
    }

    const response = createRateLimitResponse(result)

    expect(response.status).toBe(429)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('Retry-After')).toBeTruthy()
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('エラーレスポンスのJSON構造を検証する', async () => {
    const result = {
      success: false,
      limit: 10,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 45,
      error: null
    }

    const response = createRateLimitResponse(result)
    const payload = await response.json()

    expect(payload).toMatchObject({
      error: 'Too many requests',
      message: 'リクエスト数が制限を超えました。しばらく待ってから再試行してください。',
      limit: 10,
      remaining: 0
    })
    expect(payload.retryAfter).toBeGreaterThanOrEqual(0)
  })
})
