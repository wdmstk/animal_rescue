import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { upsertMock } = vi.hoisted(() => ({
  upsertMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petEmergencyInfo: {
      upsert: upsertMock
    }
  }
}));

import { PUT } from "../../src/app/api/pets/[petId]/emergency-info/route";

describe("PUT /api/pets/[petId]/emergency-info", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const requirePetAccessMock = vi.mocked(requirePetAccess);
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
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
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
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("accepts promised params object", async () => {
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
      { params: Promise.resolve({ petId: validPetId }) as unknown as { petId: string } }
    );

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { petId: validPetId }
      })
    );
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
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 400 when phone contains unsupported characters", async () => {
    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          ...payload,
          emergencyContactPhone: "090-1234-5678#99"
        })
      }),
      { params: { petId: validPetId } }
    );

    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet does not exist", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

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

  it("trims emergency payload before upsert", async () => {
    upsertMock.mockResolvedValue({
      id: "info-1",
      petId: validPetId,
      ...payload
    });

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          ...payload,
          vetName: "  みなと動物病院  ",
          vetPhone: " 03-1234-5678 "
        })
      }),
      { params: { petId: validPetId } }
    );

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          vetName: "みなと動物病院",
          vetPhone: "03-1234-5678"
        })
      })
    );
  });

  it("normalizes full-width phone characters before upsert", async () => {
    upsertMock.mockResolvedValue({
      id: "info-1",
      petId: validPetId,
      ...payload
    });

    const response = await PUT(
      new Request("http://localhost", {
        method: "PUT",
        body: JSON.stringify({
          ...payload,
          emergencyContactPhone: "０９０ー１２３４ー５６７８"
        })
      }),
      { params: { petId: validPetId } }
    );

    expect(response.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          emergencyContactPhone: "090-1234-5678"
        })
      })
    );
  });
});
