import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requireAuthenticatedUser, requirePetAccess } from "@/lib/auth/pet-access";

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
  const requireAuthenticatedUserMock = vi.mocked(requireAuthenticatedUser);
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthenticatedUserMock.mockResolvedValue({
      userId: "22222222-2222-4222-8222-222222222222"
    });
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
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

  it("returns 401 when unauthenticated", async () => {
    requireAuthenticatedUserMock.mockResolvedValueOnce(NextResponse.json({ error: "認証が必要です" }, { status: 401 }));

    const response = await GET(new Request("http://localhost"), {
      params: { petId: validPetId }
    });

    expect(response.status).toBe(401);
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet is outside ownership boundary", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

    const response = await GET(new Request("http://localhost"), {
      params: { petId: validPetId }
    });

    expect(response.status).toBe(404);
    expect(findUniqueMock).not.toHaveBeenCalled();
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
