import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock, createMock, updateMock, transactionMock, getUserMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  transactionMock: vi.fn(),
  getUserMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    householdInviteCode: {
      findUnique: findUniqueMock,
      update: updateMock
    },
    householdMember: {
      create: createMock
    },
    $transaction: transactionMock
  }
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: getUserMock
    }
  })
}));

import { POST } from "../../src/app/api/households/join/route";

describe("POST /api/households/join", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.mockResolvedValue([]);
  });

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ code: "ABC123" })
      })
    );

    expect(response.status).toBe(401);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid invite", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      error: null
    });
    findUniqueMock.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ code: "ABC123" })
      })
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 for already used invite code", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      error: null
    });
    findUniqueMock.mockResolvedValue({
      id: "invite-2",
      householdId: "11111111-1111-4111-8111-111111111111",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000)
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ code: "ABC123" })
      })
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 for expired invite code", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      error: null
    });
    findUniqueMock.mockResolvedValue({
      id: "invite-3",
      householdId: "11111111-1111-4111-8111-111111111111",
      usedAt: null,
      expiresAt: new Date(Date.now() - 60_000)
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ code: "ABC123" })
      })
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("joins household with authenticated user id", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      error: null
    });
    findUniqueMock.mockResolvedValue({
      id: "invite-1",
      householdId: "11111111-1111-4111-8111-111111111111",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000)
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ code: "ABC123" })
      })
    );

    expect(response.status).toBe(200);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "22222222-2222-4222-8222-222222222222"
        })
      })
    );
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usedBy: "22222222-2222-4222-8222-222222222222"
        })
      })
    );
  });
});
