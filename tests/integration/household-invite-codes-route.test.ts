import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock, getUserMock, householdMemberFindFirstMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  getUserMock: vi.fn(),
  householdMemberFindFirstMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    householdInviteCode: {
      create: createMock
    },
    householdMember: {
      findFirst: householdMemberFindFirstMock
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
    householdMemberFindFirstMock.mockResolvedValue({
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 400 when payload is invalid", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          householdId: "invalid-household-id",
          expiresInHours: 0
        })
      })
    );

    expect(response.status).toBe(400);
    expect(getUserMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
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

  it("resolves householdId from membership when omitted", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      error: null
    });
    createMock.mockResolvedValue({
      id: "invite-2",
      householdId: "11111111-1111-4111-8111-111111111111",
      createdBy: "22222222-2222-4222-8222-222222222222",
      code: "HIJKLM",
      expiresAt: new Date("2026-05-01T00:00:00.000Z")
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          expiresInHours: 24
        })
      })
    );

    expect(response.status).toBe(201);
    expect(householdMemberFindFirstMock).toHaveBeenCalledWith({
      where: { userId: "22222222-2222-4222-8222-222222222222" },
      select: { householdId: true },
      orderBy: { createdAt: "asc" }
    });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          householdId: "11111111-1111-4111-8111-111111111111"
        })
      })
    );
  });

  it("returns 400 when membership is not found and householdId is omitted", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      error: null
    });
    householdMemberFindFirstMock.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          expiresInHours: 24
        })
      })
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });
});
