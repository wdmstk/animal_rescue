import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findFirstMock, updateMock, deleteMock } = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petMedicalRecord: {
      findFirst: findFirstMock,
      update: updateMock,
      delete: deleteMock
    }
  }
}));

import { PATCH, DELETE } from "../../src/app/api/pets/[petId]/medical-records/[recordId]/route";

describe("/api/pets/[petId]/medical-records/[recordId]", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const validRecordId = "22222222-2222-4222-8222-222222222222";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 400 on invalid petId or recordId for PATCH", async () => {
    const response = await PATCH(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "sample-pet", recordId: validRecordId })
    });
    expect(response.status).toBe(400);
  });

  it("updates medical record on PATCH", async () => {
    findFirstMock.mockResolvedValue({ id: validRecordId });
    updateMock.mockResolvedValue({ id: validRecordId, title: "Updated" });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-05-01",
          title: "Updated",
          description: "Updated desc",
          recordType: "SURGERY"
        })
      }),
      { params: Promise.resolve({ petId: validPetId, recordId: validRecordId }) }
    );

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalled();
  });

  it("deletes medical record on DELETE", async () => {
    findFirstMock.mockResolvedValue({ id: validRecordId });
    deleteMock.mockResolvedValue({ id: validRecordId });

    const response = await DELETE(
      new Request("http://localhost", { method: "DELETE" }),
      { params: Promise.resolve({ petId: validPetId, recordId: validRecordId }) }
    );

    expect(response.status).toBe(200);
    expect(deleteMock).toHaveBeenCalled();
  });
});
