import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findManyMock, createMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petMedicalDocument: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/medical-documents/route";

describe("/api/pets/[petId]/medical-documents", () => {
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
      params: Promise.resolve({ petId: "invalid" })
    });

    expect(response.status).toBe(400);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns document list", async () => {
    findManyMock.mockResolvedValue([{ id: "doc-1" }]);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { petId: validPetId },
      orderBy: [{ createdAt: "desc" }]
    });
  });

  it("creates a document", async () => {
    createMock.mockResolvedValue({ id: "doc-1", photoUrl: "https://images.unsplash.com/photo-1" });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          photoUrl: "https://images.unsplash.com/photo-1",
          capturedAt: "2026-05-04T11:10:00.000Z"
        })
      }),
      {
        params: Promise.resolve({ petId: validPetId })
      }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        petId: validPetId,
        photoUrl: "https://images.unsplash.com/photo-1",
        capturedAt: new Date("2026-05-04T11:10:00.000Z")
      }
    });
  });

  it("returns 404 when pet access denied", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          photoUrl: "https://images.unsplash.com/photo-1"
        })
      }),
      {
        params: Promise.resolve({ petId: validPetId })
      }
    );

    expect(response.status).toBe(404);
    expect(createMock).not.toHaveBeenCalled();
  });
});
