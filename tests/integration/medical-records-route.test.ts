import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findManyMock, createMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petMedicalRecord: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/medical-records/route";

describe("/api/pets/[petId]/medical-records", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: validPetId,
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "sample-pet" })
    });

    expect(response.status).toBe(400);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns entries on GET", async () => {
    findManyMock.mockResolvedValue([{ id: "record-1" }]);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { petId: validPetId },
      orderBy: { date: "desc" }
    });
  });

  it("returns 400 on invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "not-date",
          title: "",
          description: "desc",
          recordType: "EXAM"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid petId for POST", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-04-26",
          title: "定期診察",
          description: "異常なし",
          recordType: "EXAM"
        })
      }),
      { params: Promise.resolve({ petId: "sample-pet" }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet is missing", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-04-26",
          title: "定期診察",
          description: "異常なし",
          recordType: "EXAM"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(404);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates record on valid payload", async () => {
    createMock.mockResolvedValue({
      id: "record-1",
      petId: validPetId,
      date: new Date("2026-04-26T00:00:00.000Z"),
      title: "定期診察",
      description: "異常なし",
      recordType: "EXAM"
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-04-26",
          title: "定期診察",
          description: "異常なし",
          recordType: "EXAM"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        date: new Date("2026-04-26"),
        title: "定期診察",
        description: "異常なし",
        recordType: "EXAM",
        petId: validPetId
      }
    });
  });
});
