import { beforeEach, describe, expect, it, vi } from "vitest";

const { resetPasswordForEmailMock, getUserMock, updateUserMock, incrMock, expireMock } = vi.hoisted(() => ({
  resetPasswordForEmailMock: vi.fn(),
  getUserMock: vi.fn(),
  updateUserMock: vi.fn(),
  incrMock: vi.fn(),
  expireMock: vi.fn()
}))

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      resetPasswordForEmail: resetPasswordForEmailMock,
      getUser: getUserMock,
      updateUser: updateUserMock
    }
  })
}));

// Mock Upstash Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn()
}))

vi.mock("@/lib/rate-limit/client", () => ({
  getRedisClient: () => ({
    incr: incrMock,
    expire: expireMock
  })
}));

vi.mock("@/lib/rate-limit/ip-extractor", () => ({
  getClientIp: () => "127.0.0.1"
}));

import { POST } from "../../src/app/api/auth/reset-password-request/route";
import { POST as ResetPasswordPOST } from "../../src/app/api/auth/reset-password/route";

describe("POST /api/auth/reset-password-request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set environment variables for tests
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
    
    // Mock rate limiting to allow requests by default
    incrMock.mockResolvedValue(1)
    expireMock.mockResolvedValue(undefined)
  });

  it("returns 400 for invalid email format", async () => {
    const request = new Request("http://localhost:3000/api/auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid email format");
  });

  it("returns 429 for rate limit exceeded", async () => {
    incrMock.mockResolvedValue(6)

    const request = new Request("http://localhost:3000/api/auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain("リクエストが多すぎます");
  });

  it("returns 200 for valid email even if user doesn't exist (security)", async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null })

    const request = new Request("http://localhost:3000/api/auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email: "nonexistent@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toContain("If the email is registered");
  });

  it("returns 200 for valid email when user exists", async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null })

    const request = new Request("http://localhost:3000/api/auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toContain("If the email is registered");
  });

  it("handles Supabase errors gracefully", async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: new Error("Supabase error") })

    const request = new Request("http://localhost:3000/api/auth/reset-password-request", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toContain("If the email is registered");
  });
});

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set environment variables for tests
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  });

  it("returns 400 for invalid password format", async () => {
    const request = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password: "weak" }),
    });

    const response = await ResetPasswordPOST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Password must be at least 8 characters");
  });

  it("returns 401 when user is not authenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: new Error("Not authenticated") })

    const request = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password: "ValidPassword123" }),
    });

    const response = await ResetPasswordPOST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Invalid or expired reset token");
  });

  it("returns 200 for valid password update", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null })
    updateUserMock.mockResolvedValue({ error: null })

    const request = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password: "ValidPassword123" }),
    });

    const response = await ResetPasswordPOST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toContain("Password updated successfully");
    expect(data.redirectUrl).toBe("/pets");
  });

  it("returns 500 when password update fails", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null })
    updateUserMock.mockResolvedValue({ error: new Error("Update failed") })

    const request = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password: "ValidPassword123" }),
    });

    const response = await ResetPasswordPOST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain("Failed to update password");
  });
});