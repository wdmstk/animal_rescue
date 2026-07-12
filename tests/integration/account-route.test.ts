import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, updateUserMock, prismaMock, stripeMock, serviceRoleMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  updateUserMock: vi.fn(),
  prismaMock: {
    householdMember: {
      findFirst: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn()
    },
    userSubscription: {
      findUnique: vi.fn(),
      deleteMany: vi.fn()
    },
    ownerDisplaySettings: {
      deleteMany: vi.fn()
    },
    ownerProfile: {
      deleteMany: vi.fn()
    },
    $transaction: vi.fn()
  },
  stripeMock: {
    subscriptions: {
      cancel: vi.fn()
    }
  },
  serviceRoleMock: {
    auth: {
      admin: {
        deleteUser: vi.fn()
      }
    }
  }
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: getUserMock,
      updateUser: updateUserMock
    }
  })
}));

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceRoleClient: () => serviceRoleMock
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

vi.mock("@/lib/billing/stripe", () => ({
  stripe: stripeMock
}));

import { GET, PATCH, DELETE } from "../../src/app/api/account/route";

describe("/api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns account payload", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "user@example.com",
          user_metadata: { display_name: "Taro" }
        }
      },
      error: null
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual({
      userId: "u1",
      email: "user@example.com",
      displayName: "Taro"
    });
  });

  it("returns null displayName when user_metadata.display_name is missing", async () => {
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "u1",
          email: "user@example.com",
          user_metadata: {}
        }
      },
      error: null
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual({
      userId: "u1",
      email: "user@example.com",
      displayName: null
    });
  });

  it("updates displayName and password", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    updateUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "Hanako", password: "password123" })
      })
    );

    expect(response.status).toBe(200);
    expect(updateUserMock).toHaveBeenCalledWith({
      password: "password123",
      data: { display_name: "Hanako" }
    });
  });

  it("returns 400 when payload has no updatable fields", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({})
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(updateUserMock).not.toHaveBeenCalled();
    expect(payload.error).toBeDefined();
  });

  describe("DELETE", () => {
    it("returns 401 when unauthenticated", async () => {
      getUserMock.mockResolvedValue({ data: { user: null }, error: null });

      const response = await DELETE();

      expect(response.status).toBe(401);
    });

    it("returns 400 when user has no household membership", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      prismaMock.householdMember.findFirst.mockResolvedValue(null);

      const response = await DELETE();
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload.error).toBe("所属世帯が見つかりません");
    });

    it("returns 409 when last OWNER tries to delete with other members present", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      prismaMock.householdMember.findFirst.mockResolvedValue({
        id: "m1",
        householdId: "h1",
        role: "OWNER"
      });
      prismaMock.householdMember.count
        .mockResolvedValueOnce(1) // ownerCount
        .mockResolvedValueOnce(2); // totalMemberCount

      const response = await DELETE();
      const payload = await response.json();

      expect(response.status).toBe(409);
      expect(payload.error).toContain("最後のOWNERは、他のメンバーがいる世帯を削除できません");
    });

    it("deletes account successfully for single OWNER", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      prismaMock.householdMember.findFirst.mockResolvedValue({
        id: "m1",
        householdId: "h1",
        role: "OWNER"
      });
      prismaMock.householdMember.count
        .mockResolvedValueOnce(1) // ownerCount
        .mockResolvedValueOnce(1); // totalMemberCount
      prismaMock.userSubscription.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (operations) => {
        // Simulate the actual transaction by calling each operation
        const userSubscriptionDeleteMany = operations[0];
        const ownerDisplaySettingsDeleteMany = operations[1];
        const ownerProfileDeleteMany = operations[2];
        const householdMemberDeleteMany = operations[3];

        await userSubscriptionDeleteMany;
        await ownerDisplaySettingsDeleteMany;
        await ownerProfileDeleteMany;
        await householdMemberDeleteMany;
      });
      serviceRoleMock.auth.admin.deleteUser.mockResolvedValue({ error: null });

      const response = await DELETE();
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.ok).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(serviceRoleMock.auth.admin.deleteUser).toHaveBeenCalledWith("u1");
    });

    it("deletes account successfully for FAMILY member", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      prismaMock.householdMember.findFirst.mockResolvedValue({
        id: "m1",
        householdId: "h1",
        role: "FAMILY"
      });
      prismaMock.userSubscription.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (operations) => {
        for (const operation of operations) {
          await operation;
        }
      });
      serviceRoleMock.auth.admin.deleteUser.mockResolvedValue({ error: null });

      const response = await DELETE();
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.ok).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("cancels Stripe subscription when present", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      prismaMock.householdMember.findFirst.mockResolvedValue({
        id: "m1",
        householdId: "h1",
        role: "OWNER"
      });
      prismaMock.householdMember.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      prismaMock.userSubscription.findUnique.mockResolvedValue({
        stripeSubscriptionId: "sub_123"
      });
      stripeMock.subscriptions.cancel.mockResolvedValue({ id: "sub_123" });
      prismaMock.$transaction.mockImplementation(async (operations) => {
        for (const operation of operations) {
          await operation;
        }
      });
      serviceRoleMock.auth.admin.deleteUser.mockResolvedValue({ error: null });

      const response = await DELETE();

      expect(response.status).toBe(200);
      expect(stripeMock.subscriptions.cancel).toHaveBeenCalledWith("sub_123");
    });

    it("continues deletion even if Stripe cancellation fails", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      prismaMock.householdMember.findFirst.mockResolvedValue({
        id: "m1",
        householdId: "h1",
        role: "OWNER"
      });
      prismaMock.householdMember.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      prismaMock.userSubscription.findUnique.mockResolvedValue({
        stripeSubscriptionId: "sub_123"
      });
      stripeMock.subscriptions.cancel.mockRejectedValue(new Error("Stripe error"));
      prismaMock.$transaction.mockImplementation(async (operations) => {
        for (const operation of operations) {
          await operation;
        }
      });
      serviceRoleMock.auth.admin.deleteUser.mockResolvedValue({ error: null });

      const response = await DELETE();

      expect(response.status).toBe(200);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("continues deletion even if Supabase auth deletion fails", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      prismaMock.householdMember.findFirst.mockResolvedValue({
        id: "m1",
        householdId: "h1",
        role: "OWNER"
      });
      prismaMock.householdMember.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      prismaMock.userSubscription.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockImplementation(async (operations) => {
        for (const operation of operations) {
          await operation;
        }
      });
      serviceRoleMock.auth.admin.deleteUser.mockRejectedValue(new Error("Auth error"));

      const response = await DELETE();

      expect(response.status).toBe(200);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it("returns 500 when Prisma transaction fails", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
      prismaMock.householdMember.findFirst.mockResolvedValue({
        id: "m1",
        householdId: "h1",
        role: "OWNER"
      });
      prismaMock.householdMember.count
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      prismaMock.userSubscription.findUnique.mockResolvedValue(null);
      prismaMock.$transaction.mockRejectedValue(new Error("DB error"));

      const response = await DELETE();
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload.error).toBe("アカウント削除に失敗しました");
    });
  });
});
