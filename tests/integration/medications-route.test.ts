import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, createMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petMedication: {
      findMany: findManyMock,
      create: createMock
    }
  }
}));

import { GET, POST } from "../../src/app/api/pets/[petId]/medications/route";

describe("/api/pets/[petId]/medications", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid petId for GET", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: { petId: "sample-pet" }
    });

    expect(response.status).toBe(400);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns medications on GET", async () => {
    findManyMock.mockResolvedValue([{ id: "medication-1" }]);

    const response = await GET(new Request("http://localhost"), {
      params: { petId: validPetId }
    });

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { petId: validPetId },
      orderBy: { startDate: "desc" }
    });
  });

  it("returns 400 on invalid petId for POST", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          name: "ピモベンダン",
          dosage: "1mg",
          frequency: "1日2回",
          startDate: "2026-04-20"
        })
      }),
      { params: { petId: "sample-pet" } }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid POST payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          name: "",
          dosage: "1mg",
          frequency: "1日2回",
          startDate: "not-a-date"
        })
      }),
      { params: { petId: validPetId } }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates medication on POST", async () => {
    createMock.mockResolvedValue({
      id: "medication-1",
      petId: validPetId,
      name: "ピモベンダン",
      dosage: "1mg",
      frequency: "1日2回",
      startDate: new Date("2026-04-20T00:00:00.000Z"),
      endDate: null
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          name: "ピモベンダン",
          dosage: "1mg",
          frequency: "1日2回",
          startDate: "2026-04-20",
          endDate: null
        })
      }),
      { params: { petId: validPetId } }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: "ピモベンダン",
        dosage: "1mg",
        frequency: "1日2回",
        startDate: new Date("2026-04-20"),
        endDate: null,
        petId: validPetId
      }
    });
  });
});
