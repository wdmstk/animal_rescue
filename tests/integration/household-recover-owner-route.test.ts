import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock, prismaTransactionMock, tx } = vi.hoisted(() => {
  const txContext = {
    householdMember: {
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn()
    },
    householdRoleRecoveryLog: {
      create: vi.fn()
    }
  };

  return {
    getUserMock: vi.fn(),
    prismaTransactionMock: vi.fn(async (callback: (ctx: typeof txContext) => unknown) => callback(txContext)),
    tx: txContext
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: getUserMock
    }
  })
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: prismaTransactionMock
  }
}));

import { POST } from "../../src/app/api/households/recover-owner/route";

describe("/api/households/recover-owner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows oldest member to recover owner when no owners exist", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    tx.householdMember.findFirst
      .mockResolvedValueOnce({ id: "m1", householdId: "h1", userId: "u1" })
      .mockResolvedValueOnce({ id: "m1", userId: "u1" });
    tx.householdMember.count.mockResolvedValueOnce(0);
    tx.householdMember.update.mockResolvedValueOnce({ id: "m1", userId: "u1", role: "OWNER", createdAt: "now" });
    tx.householdRoleRecoveryLog.create.mockResolvedValueOnce({ id: "log1" });

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.role).toBe("OWNER");
    expect(tx.householdRoleRecoveryLog.create).toHaveBeenCalledWith({
      data: {
        householdId: "h1",
        recoveredUserId: "u1",
        triggeredByUserId: "u1",
        reason: "OWNER_MISSING"
      }
    });
  });

  it("rejects recovery by non-oldest member", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u2" } }, error: null });
    tx.householdMember.findFirst
      .mockResolvedValueOnce({ id: "m2", householdId: "h1", userId: "u2" })
      .mockResolvedValueOnce({ id: "m1", userId: "u1" });
    tx.householdMember.count.mockResolvedValueOnce(0);

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toBe("最古メンバーのみ復旧できます");
    expect(tx.householdMember.update).not.toHaveBeenCalled();
    expect(tx.householdRoleRecoveryLog.create).not.toHaveBeenCalled();
  });

  it("rejects recovery when an owner already exists", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    tx.householdMember.findFirst.mockResolvedValueOnce({ id: "m1", householdId: "h1", userId: "u1" });
    tx.householdMember.count.mockResolvedValueOnce(1);

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toBe("OWNERはすでに存在します");
    expect(tx.householdMember.update).not.toHaveBeenCalled();
    expect(tx.householdRoleRecoveryLog.create).not.toHaveBeenCalled();
  });
});
