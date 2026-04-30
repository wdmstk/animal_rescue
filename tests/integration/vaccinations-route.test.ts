import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, createMock, findFirstMock, updateMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  createMock: vi.fn(),
  findFirstMock: vi.fn(),
  updateMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petVaccination: {
      findMany: findManyMock,
      create: createMock,
      findFirst: findFirstMock,
      update: updateMock
    }
  }
}));

import { GET, PATCH, POST } from "../../src/app/api/pets/[petId]/vaccinations/route";

describe("/api/pets/[petId]/vaccinations", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";
  const validVaccinationId = "22222222-2222-4222-8222-222222222222";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: "sample-pet" })
    });

    expect(response.status).toBe(400);
    expect(findManyMock).not.toHaveBeenCalled();
  });

  it("returns entries on GET", async () => {
    findManyMock.mockResolvedValue([{ id: "1" }]);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ petId: validPetId })
    });

    expect(response.status).toBe(200);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { petId: validPetId },
      orderBy: { date: "desc" }
    });
  });

  it("returns 400 on invalid POST payload", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          type: "INVALID",
          date: "2026-04-20"
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
        body: JSON.stringify({
          type: "CORE",
          date: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: "sample-pet" }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("creates record on POST", async () => {
    createMock.mockResolvedValue({
      id: validVaccinationId,
      petId: validPetId,
      type: "CORE",
      date: new Date("2026-04-20T00:00:00.000Z"),
      nextDue: null
    });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          type: "CORE",
          date: "2026-04-20",
          nextDue: null
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        type: "CORE",
        customTypeName: null,
        date: new Date("2026-04-20"),
        nextDue: null,
        petId: validPetId
      }
    });
  });

  it("returns 400 when OTHER is sent without customTypeName", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          type: "OTHER",
          date: "2026-04-20",
          nextDue: null
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid PATCH payload", async () => {
    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          id: "bad-id",
          type: "CORE",
          date: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(400);
    expect(findFirstMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid petId for PATCH", async () => {
    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          id: validVaccinationId,
          type: "CORE",
          date: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: "sample-pet" }) }
    );

    expect(response.status).toBe(400);
    expect(findFirstMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when PATCH target is not found", async () => {
    findFirstMock.mockResolvedValue(null);

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          id: validVaccinationId,
          type: "CORE",
          date: "2026-04-20",
          nextDue: null
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(404);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updates record on PATCH", async () => {
    findFirstMock.mockResolvedValue({
      id: validVaccinationId,
      petId: validPetId
    });
    updateMock.mockResolvedValue({
      id: validVaccinationId,
      petId: validPetId,
      type: "RABIES",
      date: new Date("2026-04-25T00:00:00.000Z"),
      nextDue: new Date("2027-04-25T00:00:00.000Z")
    });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          id: validVaccinationId,
          type: "RABIES",
          date: "2026-04-25",
          nextDue: "2027-04-25"
        })
      }),
      { params: Promise.resolve({ petId: validPetId }) }
    );

    expect(response.status).toBe(200);
    expect(findFirstMock).toHaveBeenCalledWith({
      where: {
        id: validVaccinationId,
        petId: validPetId
      }
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: validVaccinationId },
      data: {
        type: "RABIES",
        customTypeName: null,
        date: new Date("2026-04-25"),
        nextDue: new Date("2027-04-25")
      }
    });
  });
});
