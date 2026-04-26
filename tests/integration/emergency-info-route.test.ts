import { beforeEach, describe, expect, it, vi } from "vitest";

const { findPetMock, upsertMock } = vi.hoisted(() => ({
  findPetMock: vi.fn(),
  upsertMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findUnique: findPetMock
    },
    petEmergencyInfo: {
      upsert: upsertMock
    }
  }
}));

import { PUT } from "../../src/app/api/pets/[petId]/emergency-info/route";

describe("PUT /api/pets/[petId]/emergency-info", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const payload = {
    disease: "僧帽弁閉鎖不全症",
    allergy: "鶏肉",
    currentMedications: "ピモベンダン",
    vetName: "みなと動物病院",
    vetPhone: "03-1234-5678",
    emergencyContactName: "山田 花子",
    emergencyContactPhone: "090-1234-5678"
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid petId", async () => {
    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
      { params: { petId: "sample-pet" } }
    );

    expect(response.status).toBe(400);
    expect(findPetMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid payload", async () => {
    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          ...payload,
          emergencyContactPhone: "x".repeat(41)
        })
      }),
      { params: { petId: validPetId } }
    );

    expect(response.status).toBe(400);
    expect(findPetMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet does not exist", async () => {
    findPetMock.mockResolvedValue(null);

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
      { params: { petId: validPetId } }
    );

    expect(response.status).toBe(404);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("upserts emergency info", async () => {
    findPetMock.mockResolvedValue({ id: validPetId });
    upsertMock.mockResolvedValue({
      id: "info-1",
      petId: validPetId,
      ...payload
    });

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify(payload)
      }),
      { params: { petId: validPetId } }
    );

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith({
      where: { petId: validPetId },
      update: payload,
      create: {
        petId: validPetId,
        ...payload
      }
    });
  });
});
