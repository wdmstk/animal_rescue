import { beforeEach, describe, expect, it, vi } from "vitest";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { updateMock, updateManyMock, transactionMock } = vi.hoisted(() => ({
  updateMock: vi.fn(),
  updateManyMock: vi.fn(),
  transactionMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      update: updateMock
    },
    petEmergencyToken: {
      updateMany: updateManyMock
    },
    $transaction: transactionMock
  }
}));

import { POST } from "../../src/app/api/pets/[petId]/archive/route";

describe("POST /api/pets/[petId]/archive", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("archives pet and deactivates emergency QR token", async () => {
    transactionMock.mockResolvedValue([{ id: validPetId, isArchived: true }, { count: 1 }]);

    const response = await POST(
      new Request("http://localhost", { method: "POST" }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(200);
    expect(transactionMock).toHaveBeenCalled();
  });
});
