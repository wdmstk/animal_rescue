import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, findUniqueMock, upsertMock, createCustomerMock, createSessionMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  findUniqueMock: vi.fn(),
  upsertMock: vi.fn(),
  createCustomerMock: vi.fn(),
  createSessionMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: getUserMock } })
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userSubscription: {
      findUnique: findUniqueMock,
      upsert: upsertMock
    }
  }
}));

vi.mock("@/lib/billing/stripe", () => ({
  stripe: {
    customers: { create: createCustomerMock },
    checkout: { sessions: { create: createSessionMock } }
  }
}));

import { POST } from "../../src/app/api/billing/checkout/route";

describe("POST /api/billing/checkout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("creates checkout session", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "u@example.com" } }, error: null });
    findUniqueMock.mockResolvedValue(null);
    createCustomerMock.mockResolvedValue({ id: "cus_1" });
    upsertMock.mockResolvedValue({});
    createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/session/test" });

    const res = await POST();
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.data.url).toContain("checkout.stripe.com");
    expect(createCustomerMock).toHaveBeenCalled();
    expect(createSessionMock).toHaveBeenCalled();
  });
});
