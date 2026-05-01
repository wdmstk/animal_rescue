import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, findUniqueMock, createPortalSessionMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  findUniqueMock: vi.fn(),
  createPortalSessionMock: vi.fn()
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

vi.mock("@/lib/billing/stripe", () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: createPortalSessionMock
      }
    }
  }
}));

import { POST } from "../../src/app/api/billing/portal/route";

describe("POST /api/billing/portal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns 400 when stripeCustomerId is missing", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    findUniqueMock.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(400);
  });

  it("creates billing portal session", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    findUniqueMock.mockResolvedValue({ stripeCustomerId: "cus_123" });
    createPortalSessionMock.mockResolvedValue({ url: "https://billing.stripe.com/p/session/test" });

    const res = await POST();
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.data.url).toContain("billing.stripe.com");
    expect(createPortalSessionMock).toHaveBeenCalledWith(expect.objectContaining({ customer: "cus_123" }));
  });
});
