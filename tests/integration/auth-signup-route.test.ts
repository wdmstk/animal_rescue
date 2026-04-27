import { beforeEach, describe, expect, it, vi } from "vitest";

const { signUpMock } = vi.hoisted(() => ({
  signUpMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      signUp: signUpMock
    }
  })
}));

import { POST } from "../../src/app/api/auth/signup/route";

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });
});
