import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, createMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/route";

describe("/api/pets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns pets on GET", async () => {
    findManyMock.mockResolvedValue([{ id: "pet-1" }]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      include: {
        emergencyInfo: true,
        emergencyToken: true,
        photos: true
      },
      orderBy: { createdAt: "desc" }
    });
  });

  it("returns 400 on invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          householdId: "invalid",
          name: "",
          species: "dog",
          sex: "UNKNOWN"
        })
      })
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates pet on POST", async () => {
    createMock.mockResolvedValue({
      id: "pet-1",
      name: "モカ"
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          householdId: "11111111-1111-4111-8111-111111111111",
          name: "モカ",
          species: "dog",
          breed: "トイプードル",
          sex: "FEMALE",
          birthday: "2020-03-10"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        householdId: "11111111-1111-4111-8111-111111111111",
        name: "モカ",
        species: "dog",
        breed: "トイプードル",
        sex: "FEMALE",
        birthday: new Date("2020-03-10")
      })
    });
  });
});
