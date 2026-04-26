import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, createMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petLabResultEntry: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/health/lab-results/route";

describe("/api/pets/[petId]/health/lab-results", () => {
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
          marker: "CRE",
          value: -1,
          recordedAt: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("uses default unit when unit is omitted", async () => {
    createMock.mockResolvedValue({
      id: "id-1",
      petId: validPetId,
      marker: "CRE",
      value: 1.8,
      unit: "mg/dL",
      recordedAt: new Date("2026-04-20T00:00:00.000Z"),
      note: null
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marker: "CRE",
          value: 1.8,
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
          marker: "CRE",
          unit: "mg/dL"
        })
      })
    );
  });

  it("returns entries on GET", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "id-1",
        petId: validPetId,
        marker: "CRE",
        value: 1.8,
        unit: "mg/dL",
        recordedAt: new Date("2026-04-20T00:00:00.000Z"),
        note: null
      }
    ]);

    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ petId: validPetId }) });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data).toHaveLength(1);
    expect(payload.data[0].unit).toBe("mg/dL");
  });
});
