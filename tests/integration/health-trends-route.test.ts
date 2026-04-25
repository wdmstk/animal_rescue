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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns aggregated trend series", async () => {
    coreFindManyMock.mockResolvedValue([
      {
        id: "c1",
        petId: "pet-1",
        type: "WEIGHT_KG",
        value: 4.2,
        recordedAt: new Date("2026-04-02T00:00:00.000Z"),
        note: null
      }
    ]);
    labFindManyMock.mockResolvedValue([
      {
        id: "l1",
        petId: "pet-1",
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
        petId: "pet-1",
        key: "INFUSION_ML",
        value: 100,
        unit: "mL",
        recordedAt: new Date("2026-04-03T00:00:00.000Z"),
        note: null
      }
    ]);

    const response = await GET(new Request("http://localhost"), { params: { petId: "pet-1" } });

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
});
