import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petPhoto: {
      create: createMock
    }
  }
}));

import { POST } from "../../src/app/api/pets/[petId]/photos/route";

describe("POST /api/pets/[petId]/photos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          photoUrl: "not-url"
        })
      }),
      { params: { petId: "pet-1" } }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("persists photo URL and returns 201", async () => {
    createMock.mockResolvedValue({
      id: "photo-1",
      petId: "pet-1",
      photoUrl: "https://example.com/photo.jpg",
      sortOrder: 0
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          photoUrl: "https://example.com/photo.jpg",
          sortOrder: 0
        })
      }),
      { params: { petId: "pet-1" } }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        petId: "pet-1",
        photoUrl: "https://example.com/photo.jpg",
        sortOrder: 0
      }
    });
  });
});
