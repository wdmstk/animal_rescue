import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, findUniqueMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  findUniqueMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: getUserMock } })
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userSubscription: {
      findUnique: findUniqueMock
    }
  }
}));

import { GET } from "../../src/app/api/billing/subscription/route";

describe("GET /api/billing/subscription", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns default status when no subscription", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    findUniqueMock.mockResolvedValue(null);
    const res = await GET();
    const payload = await res.json();
    expect(payload.data.status).toBe("INCOMPLETE");
    expect(payload.data.isActive).toBe(false);
    expect(payload.data.accessPolicy.canCreate).toBe(false);
  });

  it("returns active status", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    findUniqueMock.mockResolvedValue({
      status: "ACTIVE",
      trialEndsAt: null,
      currentPeriodEnd: new Date("2026-05-01T00:00:00.000Z"),
      graceUntil: null
    });
    const res = await GET();
    const payload = await res.json();
    expect(payload.data.status).toBe("ACTIVE");
    expect(payload.data.isActive).toBe(true);
    expect(payload.data.accessPolicy.canCreate).toBe(true);
  });
});
