import { beforeEach, describe, expect, it, vi } from "vitest";

const { signInWithPasswordMock } = vi.hoisted(() => ({
  signInWithPasswordMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock
    }
  })
}));

import { POST } from "../../src/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
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
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("returns 401 when auth fails", async () => {
    signInWithPasswordMock.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" }
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
    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123"
    });
  });

  it("returns 200 when login succeeds", async () => {
    signInWithPasswordMock.mockResolvedValue({
      data: { user: { id: "u1" }, session: { access_token: "token" } },
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
