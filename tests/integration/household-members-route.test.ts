import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getUserMock,
  householdMemberFindFirstMock,
  householdFindUniqueMock,
  householdMemberUpdateMock
} = vi.hoisted(() => ({
  getUserMock: vi.fn(),
  householdMemberFindFirstMock: vi.fn(),
  householdFindUniqueMock: vi.fn(),
  householdMemberUpdateMock: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      getUser: getUserMock
    }
  })
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    householdMember: {
      findFirst: householdMemberFindFirstMock,
      update: householdMemberUpdateMock
    },
    household: {
      findUnique: householdFindUniqueMock
    }
  }
}));

import { GET } from "../../src/app/api/households/members/route";
import { PATCH } from "../../src/app/api/households/members/[memberId]/route";

describe("/api/households/members", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns members list", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    householdMemberFindFirstMock.mockResolvedValueOnce({ householdId: "h1", role: "OWNER" });
    householdFindUniqueMock.mockResolvedValueOnce({
      id: "h1",
      name: "family",
      members: [{ id: "m1", userId: "u1", role: "OWNER", createdAt: "2026-01-01" }]
    });

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.currentUserRole).toBe("OWNER");
    expect(payload.data.household.id).toBe("h1");
  });

  it("rejects role update by non-owner", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u2" } }, error: null });
    householdMemberFindFirstMock.mockResolvedValueOnce({ householdId: "h1", role: "FAMILY" });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ role: "OWNER" })
      }),
      { params: Promise.resolve({ memberId: "m2" }) }
    );

    expect(response.status).toBe(403);
    expect(householdMemberUpdateMock).not.toHaveBeenCalled();
  });

  it("allows role update by owner", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    householdMemberFindFirstMock.mockResolvedValueOnce({ householdId: "h1", role: "OWNER" });
    householdMemberFindFirstMock.mockResolvedValueOnce({ id: "m2", userId: "u2" });
    householdMemberUpdateMock.mockResolvedValueOnce({ id: "m2", userId: "u2", role: "FAMILY", createdAt: "now" });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ role: "FAMILY" })
      }),
      { params: Promise.resolve({ memberId: "m2" }) }
    );

    expect(response.status).toBe(200);
    expect(householdMemberUpdateMock).toHaveBeenCalled();
  });
});
