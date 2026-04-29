import { beforeEach, describe, expect, it, vi } from "vitest";

const { signOutMock } = vi.hoisted(() => ({
  signOutMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      signOut: signOutMock
    }
  })
}));

import { POST } from "../../src/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when logout succeeds", async () => {
    signOutMock.mockResolvedValue({ error: null });

    const response = await POST();

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ ok: true });
  });

  it("returns 500 when logout fails", async () => {
    signOutMock.mockResolvedValue({ error: { message: "failed" } });

    const response = await POST();

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toEqual({ error: "failed" });
  });
});
