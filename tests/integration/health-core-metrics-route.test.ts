import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, createMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petCoreMetricEntry: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/health/core-metrics/route";

describe("/api/pets/[petId]/health/core-metrics", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ petId: "sample-pet" }) });

    expect(response.status).toBe(400);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid filter", async () => {
    const response = await GET(new Request("http://localhost?type=INVALID"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(400);
  });

  it("creates entry with valid payload", async () => {
    createMock.mockResolvedValue({
      id: "id-1",
      petId: validPetId,
      type: "WEIGHT_KG",
      value: 4.2,
      recordedAt: new Date("2026-04-20T00:00:00.000Z"),
      note: null
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WEIGHT_KG",
          value: 4.2,
          recordedAt: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledOnce();
  });

  it("returns 400 on invalid payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "WEIGHT_KG",
          value: -1,
          recordedAt: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns entries on GET", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "id-1",
        petId: validPetId,
        type: "WEIGHT_KG",
        value: 4.2,
        recordedAt: new Date("2026-04-20T00:00:00.000Z"),
        note: null
      }
    ]);

    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ petId: validPetId }) });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toHaveLength(1);
  });

  it("applies type filter on GET", async () => {
    findManyMock.mockResolvedValue([]);

    const response = await GET(new Request("http://localhost?type=WEIGHT_KG"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          petId: validPetId,
          type: "WEIGHT_KG"
        })
      })
    );
  });
});
