import { beforeEach, describe, expect, it, vi } from "vitest";

const { constructEventMock, retrieveMock, findFirstMock, upsertMock } = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  retrieveMock: vi.fn(),
  findFirstMock: vi.fn(),
  upsertMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userSubscription: {
      findFirst: findFirstMock,
      upsert: upsertMock
    }
  }
}));

vi.mock("@/lib/billing/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: constructEventMock },
    subscriptions: { retrieve: retrieveMock }
  },
  toSubscriptionStatus: (status: string) => (status === "active" ? "ACTIVE" : "INCOMPLETE")
}));

vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "https://example.com",
    STRIPE_WEBHOOK_SECRET: "whsec_test"
  }
}));

import { POST } from "../../src/app/api/billing/webhook/route";

describe("POST /api/billing/webhook", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 without signature", async () => {
    const res = await POST(new Request("http://localhost", { method: "POST", body: "{}" }));
    expect(res.status).toBe(400);
  });

  it("handles checkout.session.completed", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { subscription: "sub_1", customer: "cus_1" } }
    });
    retrieveMock.mockResolvedValue({ id: "sub_1", status: "active", current_period_end: 1_715_000_000 });
    findFirstMock.mockResolvedValue({ userId: "u1" });
    upsertMock.mockResolvedValue({});

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "stripe-signature": "sig" },
        body: "{}"
      })
    );

    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalled();
  });
});
