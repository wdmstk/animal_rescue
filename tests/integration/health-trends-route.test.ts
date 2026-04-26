import { beforeEach, describe, expect, it, vi } from "vitest";

const { coreFindManyMock, labFindManyMock, extensionFindManyMock } = vi.hoisted(() => ({
  coreFindManyMock: vi.fn(),
  labFindManyMock: vi.fn(),
  extensionFindManyMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    petCoreMetricEntry: {
      findMany: coreFindManyMock
    },
    petLabResultEntry: {
      findMany: labFindManyMock
    },
    petHealthExtensionEntry: {
      findMany: extensionFindManyMock
    }
  }
}));

import { GET } from "../../src/app/api/pets/[petId]/health/trends/route";

describe("/api/pets/[petId]/health/trends", () => {
  const validPetId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 on invalid petId", async () => {
    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ petId: "sample-pet" }) });

    expect(response.status).toBe(400);
    expect(coreFindManyMock).not.toHaveBeenCalled();
    expect(labFindManyMock).not.toHaveBeenCalled();
    expect(extensionFindManyMock).not.toHaveBeenCalled();
  });

  it("returns aggregated trend series", async () => {
    coreFindManyMock.mockResolvedValue([
      {
        id: "c1",
        petId: validPetId,
        type: "WEIGHT_KG",
        value: 4.2,
        recordedAt: new Date("2026-04-02T00:00:00.000Z"),
        note: null
      }
    ]);
    labFindManyMock.mockResolvedValue([
      {
        id: "l1",
        petId: validPetId,
        marker: "CRE",
        value: 1.8,
        unit: "mg/dL",
        recordedAt: new Date("2026-04-01T00:00:00.000Z"),
        note: null
      }
    ]);
    extensionFindManyMock.mockResolvedValue([
      {
        id: "e1",
        petId: validPetId,
        key: "INFUSION_ML",
        value: 100,
        unit: "mL",
        recordedAt: new Date("2026-04-03T00:00:00.000Z"),
        note: null
      }
    ]);

    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ petId: validPetId }) });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.series).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "core:WEIGHT_KG", label: "体重 (kg)" }),
        expect.objectContaining({ key: "lab:CRE", label: "Cre" }),
        expect.objectContaining({ key: "ext:INFUSION_ML", label: "点滴量 (mL)" })
      ])
    );
  });

  it("returns empty series when no records exist", async () => {
    coreFindManyMock.mockResolvedValue([]);
    labFindManyMock.mockResolvedValue([]);
    extensionFindManyMock.mockResolvedValue([]);

    const response = await GET(new Request("http://localhost"), { params: Promise.resolve({ petId: validPetId }) });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.series).toEqual([]);
  });
});
