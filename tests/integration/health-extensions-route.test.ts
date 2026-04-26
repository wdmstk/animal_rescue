import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, createMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petHealthExtensionEntry: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/health/extensions/route";

describe("/api/pets/[petId]/health/extensions", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ petId: "sample-pet" }) });

    expect(response.status).toBe(400);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "UNKNOWN_KEY",
          value: 120,
          recordedAt: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates entry with nullable unit", async () => {
    createMock.mockResolvedValue({
      id: "id-1",
      petId: validPetId,
      key: "INFUSION_ML",
      value: 120,
      unit: null,
      recordedAt: new Date("2026-04-20T00:00:00.000Z"),
      note: null
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "INFUSION_ML",
          value: 120,
          unit: null,
          recordedAt: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          petId: validPetId,
          key: "INFUSION_ML",
          unit: null
        })
      })
    );
  });

  it("returns entries on GET", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "id-1",
        petId: validPetId,
        key: "INFUSION_ML",
        value: 100,
        unit: "mL",
        recordedAt: new Date("2026-04-20T00:00:00.000Z"),
        note: null
      }
    ]);

    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ petId: validPetId }) });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0].key).toBe("INFUSION_ML");
  });
});
