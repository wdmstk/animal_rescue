import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/households/route";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    householdMember: {
      findFirst: vi.fn(),
      deleteMany: vi.fn()
    },
    pet: {
      deleteMany: vi.fn()
    },
    household: {
      delete: vi.fn()
    },
    auditLog: {
      create: vi.fn()
    },
    $transaction: vi.fn((callback) => callback(prisma))
  }
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

const mockUserId = "11111111-1111-4111-a111-111111111111";
const mockHouseholdId = "22222222-2222-4222-a222-222222222222";

describe("DELETE /api/households", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("Unauthorized") }) }
    } as any);

    const response = await DELETE(new Request("http://localhost/api/households", { method: "DELETE" }));
    expect(response.status).toBe(401);
  });

  it("returns 400 when user has no household", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } }, error: null }) }
    } as any);
    vi.mocked(prisma.householdMember.findFirst).mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost/api/households", { method: "DELETE" }));
    expect(response.status).toBe(400);
  });

  it("returns 403 when user is not OWNER", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } }, error: null }) }
    } as any);
    vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({
      householdId: mockHouseholdId,
      role: "FAMILY"
    } as any);

    const response = await DELETE(new Request("http://localhost/api/households", { method: "DELETE" }));
    expect(response.status).toBe(403);
  });

  it("deletes household successfully when user is OWNER and returns 204", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: mockUserId } }, error: null }) }
    } as any);
    vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({
      householdId: mockHouseholdId,
      role: "OWNER"
    } as any);
    vi.mocked(prisma.pet.deleteMany).mockResolvedValue({ count: 2 } as any);
    vi.mocked(prisma.householdMember.deleteMany).mockResolvedValue({ count: 1 } as any);
    vi.mocked(prisma.household.delete).mockResolvedValue({ id: mockHouseholdId } as any);

    const response = await DELETE(new Request("http://localhost/api/households", { method: "DELETE" }));

    expect(response.status).toBe(204);
    expect(prisma.pet.deleteMany).toHaveBeenCalledWith({ where: { householdId: mockHouseholdId } });
    expect(prisma.householdMember.deleteMany).toHaveBeenCalledWith({ where: { householdId: mockHouseholdId } });
    expect(prisma.household.delete).toHaveBeenCalledWith({ where: { id: mockHouseholdId } });
  });
});
