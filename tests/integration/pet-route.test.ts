import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findUnique: findUniqueMock
    }
  }
}));

import { GET } from "../../src/app/api/pets/[petId]/route";

describe("GET /api/pets/[petId]", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: { petId: "sample-pet" }
    });

    expect(response.status).toBe(400);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet is not found", async () => {
    findUniqueMock.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost"), {
      params: { petId: validPetId }
    });

    expect(response.status).toBe(404);
  });

  it("returns pet detail on success", async () => {
    findUniqueMock.mockResolvedValue({
      id: validPetId,
      name: "モカ"
    });

    const response = await GET(new Request("http://localhost"), {
      params: { petId: validPetId }
    });

    expect(response.status).toBe(200);
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: validPetId },
      include: {
        emergencyInfo: true,
        medicalRecords: { orderBy: { date: "desc" } },
        medications: { orderBy: { startDate: "desc" } },
        vaccinations: { orderBy: { date: "desc" } },
        emergencyToken: true,
        photos: { orderBy: { sortOrder: "asc" } }
      }
    });
  });
});
