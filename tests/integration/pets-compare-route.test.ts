import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirstMemberMock, findManyPetsMock } = vi.hoisted(() => ({
  findFirstMemberMock: vi.fn(),
  findManyPetsMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    householdMember: {
      findFirst: findFirstMemberMock
    },
    pet: {
      findMany: findManyPetsMock
    }
  }
}));

import { GET } from "../../src/app/api/households/compare/route";

describe("GET /api/households/compare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns comparison data for household pets", async () => {
    findFirstMemberMock.mockResolvedValue({ householdId: "h1" });
    findManyPetsMock.mockResolvedValue([
      {
        id: "pet-1",
        name: "Mugi",
        coreMetrics: [
          { value: 4.2, recordedAt: new Date("2026-05-01") }
        ],
        labResults: []
      }
    ]);

    const response = await GET();
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0].name).toBe("Mugi");
  });
});
