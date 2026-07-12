import { beforeEach, describe, expect, it, vi } from 'vitest'

// Define global mock outside hoisted function
const globalMockLimit = vi.fn()
const mockRatelimitInstance = {
  limit: globalMockLimit
}

const { signInWithPasswordMock, signUpMock, RatelimitMock } = vi.hoisted(() => ({
  signInWithPasswordMock: vi.fn(),
  signUpMock: vi.fn(),
  RatelimitMock: class MockRatelimit {
    constructor(config: any) {
      return mockRatelimitInstance
    }
    static slidingWindow(limit: number, window: string) {
      return { limiter: 'slidingWindow' }
    }
  }
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
      signUp: signUpMock
    }
  })
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    householdMember: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'hm1' })
    },
    household: {
      create: vi.fn().mockResolvedValue({ id: 'h1' })
    },
    userSubscription: {
      upsert: vi.fn().mockResolvedValue({ id: 'us1' })
    }
  }
}))

// Mock Upstash Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn()
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: RatelimitMock
}))

import { POST as LoginPOST } from '@/app/api/auth/login/route'
import { POST as SignupPOST } from '@/app/api/auth/signup/route'

describe('Rate limiting integration tests for auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set environment variables for tests
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    
    // Clear mock state
    globalMockLimit.mockClear()
  })

  describe('POST /api/auth/login', () => {
    it('レート制限未超過時は正常にリクエストを処理する', async () => {
      globalMockLimit.mockResolvedValue({
        success: true,
        remaining: 9,
        reset: Date.now() + 60000
      })

      signInWithPasswordMock.mockResolvedValue({
        data: { user: { id: 'u1' }, session: { access_token: 'token' } },
        error: null
      })

      const response = await LoginPOST(
        new Request('http://localhost', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.0.2.1' },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123'
          })
        })
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9')
    })

    it('レート制限超過時は429を返す', async () => {
      globalMockLimit.mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 60000
      })

      const response = await LoginPOST(
        new Request('http://localhost', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.0.2.1' },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123'
          })
        })
      )

      expect(response.status).toBe(429)
      const payload = await response.json()
      expect(payload.error).toBe('Too many requests')
      expect(signInWithPasswordMock).not.toHaveBeenCalled()
    })

    it('Redis接続エラー時にFail-Openでリクエストを許可する', async () => {
      globalMockLimit.mockRejectedValue(new Error('Connection failed'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      signInWithPasswordMock.mockResolvedValue({
        data: { user: { id: 'u1' }, session: { access_token: 'token' } },
        error: null
      })

      const response = await LoginPOST(
        new Request('http://localhost', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.0.2.1' },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123'
          })
        })
      )

      expect(response.status).toBe(200) // Fail-Open allows request
      expect(signInWithPasswordMock).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Rate Limit Store Error (Fail-Open active):',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('POST /api/auth/signup', () => {
    it('レート制限未超過時は正常にリクエストを処理する', async () => {
      globalMockLimit.mockResolvedValue({
        success: true,
        remaining: 4,
        reset: Date.now() + 60000
      })

      signUpMock.mockResolvedValue({
        data: { user: { id: 'u1' }, session: { access_token: 'token' } },
        error: null
      })

      const response = await SignupPOST(
        new Request('http://localhost', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.0.2.1' },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123'
          })
        })
      )

      expect(response.status).toBe(200)
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
    })

    it('レート制限超過時は429を返す', async () => {
      globalMockLimit.mockResolvedValue({
        success: false,
        remaining: 0,
        reset: Date.now() + 60000
      })

      const response = await SignupPOST(
        new Request('http://localhost', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.0.2.1' },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123'
          })
        })
      )

      expect(response.status).toBe(429)
      const payload = await response.json()
      expect(payload.error).toBe('Too many requests')
      expect(signUpMock).not.toHaveBeenCalled()
    })

    it('Redis接続エラー時にFail-Openでリクエストを許可する', async () => {
      globalMockLimit.mockRejectedValue(new Error('Connection failed'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      signUpMock.mockResolvedValue({
        data: { user: { id: 'u1' }, session: { access_token: 'token' } },
        error: null
      })

      const response = await SignupPOST(
        new Request('http://localhost', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.0.2.1' },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123'
          })
        })
      )

      expect(response.status).toBe(200) // Fail-Open allows request
      expect(signUpMock).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Rate Limit Store Error (Fail-Open active):',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })
})
