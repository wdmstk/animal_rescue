import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock, getUserMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  getUserMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    householdInviteCode: {
      create: createMock
    }
  }
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: getUserMock
    }
  })
}));

import { POST } from "../../src/app/api/households/invite-codes/route";

describe("POST /api/households/invite-codes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          householdId: "11111111-1111-4111-8111-111111111111"
        })
      })
    );

    expect(response.status).toBe(401);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("uses authenticated user as createdBy", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      error: null
    });
    createMock.mockResolvedValue({
      id: "invite-1",
      householdId: "11111111-1111-4111-8111-111111111111",
      createdBy: "22222222-2222-4222-8222-222222222222",
      code: "ABCDEF",
      expiresAt: new Date("2026-04-30T00:00:00.000Z")
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          householdId: "11111111-1111-4111-8111-111111111111",
          expiresInHours: 48
        })
      })
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          createdBy: "22222222-2222-4222-8222-222222222222"
        })
      })
    );
  });
});
