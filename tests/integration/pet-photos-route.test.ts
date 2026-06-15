import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { requirePetAccess } from "@/lib/auth/pet-access";

const { findManyMock, createMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petPhoto: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/photos/route";

describe("/api/pets/[petId]/photos", () => {
  const requirePetAccessMock = vi.mocked(requirePetAccess);

  beforeEach(() => {
    vi.clearAllMocks();
    requirePetAccessMock.mockResolvedValue({
      petId: "11111111-1111-4111-8111-111111111111",
      householdId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("returns 400 for invalid petId on GET", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "pet-1" })
    });

    expect(response.status).toBe(400);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns photos on GET", async () => {
    findManyMock.mockResolvedValue([{ id: "photo-1" }]);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "11111111-1111-4111-8111-111111111111" })
    });

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { petId: "11111111-1111-4111-8111-111111111111" },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    });
  });

  it("returns 400 for invalid petId on POST", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
          sortOrder: 0
        })
      }),
      { params: Promise.resolve({ petId: "pet-1" }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          photoUrl: "https://example.com/photo.jpg"
        })
      }),
      { params: Promise.resolve({ petId: "pet-1" }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 404 when pet is missing", async () => {
    requirePetAccessMock.mockResolvedValueOnce(NextResponse.json({ error: "Pet not found" }, { status: 404 }));

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
          sortOrder: 0
        })
      }),
      { params: Promise.resolve({ petId: "11111111-1111-4111-8111-111111111111" }) }
    );

    expect(response.status).toBe(404);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("persists photo URL and returns 201", async () => {
    createMock.mockResolvedValue({
      id: "photo-1",
      petId: "pet-1",
      photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
      sortOrder: 0
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
          sortOrder: 0
        })
      }),
      { params: Promise.resolve({ petId: "11111111-1111-4111-8111-111111111111" }) }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        petId: "11111111-1111-4111-8111-111111111111",
        photoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
        sortOrder: 0
      }
    });
  });
});
