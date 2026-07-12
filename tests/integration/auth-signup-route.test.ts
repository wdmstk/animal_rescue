import { beforeEach, describe, expect, it, vi } from "vitest";

// Define global mock outside hoisted function
const globalMockLimit = vi.fn()
const mockRatelimitInstance = {
  limit: globalMockLimit
}

const { signUpMock, findFirstMembershipMock, createHouseholdMock, createMemberMock, upsertMock, RatelimitMock } = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  findFirstMembershipMock: vi.fn(),
  createHouseholdMock: vi.fn(),
  createMemberMock: vi.fn(),
  upsertMock: vi.fn(),
  RatelimitMock: class MockRatelimit {
    constructor(config: any) {
      return mockRatelimitInstance
    }
    static slidingWindow(limit: number, window: string) {
      return { limiter: 'slidingWindow' }
    }
  }
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      signUp: signUpMock
    }
  })
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    householdMember: {
      findFirst: findFirstMembershipMock,
      create: createMemberMock
    },
    household: {
      create: createHouseholdMock
    },
    userSubscription: {
      upsert: upsertMock
    }
  }
}));

// Mock Upstash Redis and Ratelimit
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn()
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: RatelimitMock
}))

import { POST } from "../../src/app/api/auth/signup/route";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findFirstMembershipMock.mockResolvedValue(null);
    createHouseholdMock.mockResolvedValue({ id: "h1" });
    createMemberMock.mockResolvedValue({ id: "m1" });
    upsertMock.mockResolvedValue({});
    
    // Set environment variables for tests
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    
    // Mock rate limiting to allow requests by default
    globalMockLimit.mockResolvedValue({
      success: true,
      remaining: 4,
      reset: Date.now() + 60000
    })
  });

  it("returns 400 when payload is invalid", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          password: "short"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("returns 401 when signup fails", async () => {
    signUpMock.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered" }
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123"
        })
      })
    );

    expect(response.status).toBe(401);
    expect(signUpMock).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123"
    });
  });

  it("returns 200 when signup succeeds", async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: "u1" }, session: null },
      error: null
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123"
        })
      })
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ ok: true });
    expect(createHouseholdMock).toHaveBeenCalled();
    expect(createMemberMock).toHaveBeenCalled();
    expect(upsertMock).toHaveBeenCalled();
  });
});
