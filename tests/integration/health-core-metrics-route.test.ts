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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid filter", async () => {
    const response = await GET(new Request("http://localhost?type=INVALID"), { params: { petId: "pet-1" } });

    expect(response.status).toBe(400);
  });

  it("creates entry with valid payload", async () => {
    createMock.mockResolvedValue({
      id: "id-1",
      petId: "pet-1",
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
      { params: { petId: "pet-1" } }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledOnce();
  });

  it("returns entries on GET", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "id-1",
        petId: "pet-1",
        type: "WEIGHT_KG",
        value: 4.2,
        recordedAt: new Date("2026-04-20T00:00:00.000Z"),
        note: null
      }
    ]);

    const response = await GET(new Request("http://localhost"), { params: { petId: "pet-1" } });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toHaveLength(1);
  });
});
