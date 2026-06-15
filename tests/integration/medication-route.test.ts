import { beforeEach, describe, expect, it, vi } from "vitest";

const { findFirstMock, updateMock } = vi.hoisted(() => ({
  findFirstMock: vi.fn(),
  updateMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petMedication: {
      findFirst: findFirstMock,
      update: updateMock
    }
  }
}));

import { PATCH } from "../../src/app/api/pets/[petId]/medications/[medicationId]/route";

describe("PATCH /api/pets/[petId]/medications/[medicationId]", () => {
  const petId = "11111111-1111-4111-8111-111111111111";
  const medicationId = "22222222-2222-4222-8222-222222222222";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid params", async () => {
    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          name: "ピモベンダン",
          dosage: "1mg",
          frequency: "1日2回",
          startDate: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId: "invalid", medicationId }) }
    );

    expect(response.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 400 on invalid payload", async () => {
    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          name: "",
          dosage: "1mg",
          frequency: "1日2回",
          startDate: "bad"
        })
      }),
      { params: Promise.resolve({ petId, medicationId }) }
    );

    expect(response.status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when medication is not found", async () => {
    findFirstMock.mockResolvedValue(null);

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          name: "ピモベンダン",
          dosage: "1mg",
          frequency: "1日2回",
          startDate: "2026-04-20"
        })
      }),
      { params: Promise.resolve({ petId, medicationId }) }
    );

    expect(response.status).toBe(404);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("updates medication", async () => {
    findFirstMock.mockResolvedValue({ id: medicationId });
    updateMock.mockResolvedValue({ id: medicationId });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          name: "ピモベンダン",
          dosage: "1mg",
          frequency: "1日2回",
          startDate: "2026-04-20",
          endDate: null
        })
      }),
      { params: Promise.resolve({ petId, medicationId }) }
    );

    expect(response.status).toBe(200);
    expect(findFirstMock).toHaveBeenCalledWith({
      where: {
        id: medicationId,
        petId
      },
      select: { id: true }
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: medicationId },
      data: {
        name: "ピモベンダン",
        dosage: "1mg",
        frequency: "1日2回",
        startDate: new Date("2026-04-20"),
        endDate: null
      }
    });
  });
});
