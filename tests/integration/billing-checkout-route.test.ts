import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, findUniqueMock, upsertMock, createCustomerMock, createSessionMock, envMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  findUniqueMock: vi.fn(),
  upsertMock: vi.fn(),
  createCustomerMock: vi.fn(),
  createSessionMock: vi.fn(),
  envMock: {
    NEXT_PUBLIC_APP_URL: "https://example.com",
    STRIPE_PRICE_ID_MONTHLY_680: "price_123",
    STRIPE_PRICE_ID_ANNUAL_7800: "price_456"
  }
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

vi.mock("@/lib/env", () => ({
  env: envMock
}));

import { POST } from "../../src/app/api/billing/checkout/route";

describe("POST /api/billing/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    envMock.STRIPE_PRICE_ID_ANNUAL_7800 = "price_456";
  });

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(new Request("https://example.com/api/billing/checkout", { method: "POST" }));
    expect(res.status).toBe(401);
  });

  it("creates checkout session (defaults to monthly)", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "u@example.com" } }, error: null });
    findUniqueMock.mockResolvedValue(null);
    createCustomerMock.mockResolvedValue({ id: "cus_1" });
    upsertMock.mockResolvedValue({});
    createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/session/test" });

    const res = await POST(new Request("https://example.com/api/billing/checkout", { method: "POST" }));
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.data.url).toContain("checkout.stripe.com");
    expect(createCustomerMock).toHaveBeenCalled();
    expect(createSessionMock).toHaveBeenCalled();
  });

  it("creates checkout session with annual plan", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "u@example.com" } }, error: null });
    findUniqueMock.mockResolvedValue(null);
    createCustomerMock.mockResolvedValue({ id: "cus_1" });
    upsertMock.mockResolvedValue({});
    createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/session/test" });

    const res = await POST(
      new Request("https://example.com/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "annual" })
      })
    );
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.data.url).toContain("checkout.stripe.com");
    expect(createCustomerMock).toHaveBeenCalled();
    expect(createSessionMock).toHaveBeenCalled();
  });

  it("returns 400 when annual plan is not available", async () => {
    envMock.STRIPE_PRICE_ID_ANNUAL_7800 = undefined;
    getUserMock.mockResolvedValue({ data: { user: { id: "u1", email: "u@example.com" } }, error: null });

    const res = await POST(
      new Request("https://example.com/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "annual" })
      })
    );

    expect(res.status).toBe(400);
  });
});
