import { beforeEach, describe, expect, it, vi } from "vitest";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findFirstMock, findManyMock, createMock } = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petMedication: {
      findFirst: findFirstMock
    },
    petMedicationLog: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/medications/[medicationId]/logs/route";

describe("/api/pets/[petId]/medications/[medicationId]/logs", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const validMedicationId = "22222222-2222-4222-8222-222222222222";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 400 on invalid UUID params for GET", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "sample-pet", medicationId: validMedicationId })
    });
    expect(response.status).toBe(400);
  });

  it("returns logs for medication on GET", async () => {
    findFirstMock.mockResolvedValue({ id: validMedicationId });
    findManyMock.mockResolvedValue([{ id: "log-1", status: "TAKEN" }]);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId, medicationId: validMedicationId })
    });

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalled();
  });

  it("registers log on POST", async () => {
    findFirstMock.mockResolvedValue({ id: validMedicationId });
    createMock.mockResolvedValue({ id: "log-created", status: "TAKEN" });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "TAKEN",
          note: "Gave with food"
        })
      }),
      { params: Promise.resolve({ petId: validPetId, medicationId: validMedicationId }) }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalled();
  });
});
