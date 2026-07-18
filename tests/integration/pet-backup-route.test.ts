import { beforeEach, describe, expect, it, vi } from "vitest";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findUniqueMock, transactionMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  transactionMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findUnique: findUniqueMock
    },
    $transaction: transactionMock
  }
}));

import { GET } from "../../src/app/api/pets/[petId]/backup/export/route";
import { POST } from "../../src/app/api/pets/[petId]/backup/restore/route";

describe("Pet Backup API routes", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("exports pet backup data to JSON", async () => {
    findUniqueMock.mockResolvedValue({
      id: validPetId,
      name: "Choco",
      medicalRecords: [],
      medications: [],
      vaccinations: [],
      coreMetrics: [],
      labResults: []
    });

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.backupVersion).toBe("1.0.0");
    expect(json.petId).toBe(validPetId);
  });

  it("restores pet backup data from JSON", async () => {
    transactionMock.mockResolvedValue(true);

    const backupPayload = {
      backupVersion: "1.0.0",
      medicalRecords: [
        {
          date: "2026-05-01T00:00:00.000Z",
          title: "診察",
          description: "良好",
          recordType: "EXAM",
          photoUrl: null
        }
      ],
      medications: [],
      vaccinations: [],
      coreMetrics: [],
      labResults: []
    };

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupPayload)
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(200);
    expect(transactionMock).toHaveBeenCalled();
  });
});
