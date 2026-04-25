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

  it("returns merged trend series", async () => {
    coreFindManyMock.mockResolvedValue([
      {
        id: "core-1",
        petId: "pet-1",
        type: "WEIGHT_KG",
        value: 4.2,
        recordedAt: new Date("2026-04-20T00:00:00.000Z"),
        note: null
      }
    ]);
    labFindManyMock.mockResolvedValue([
      {
        id: "lab-1",
        petId: "pet-1",
        marker: "CRE",
        value: 1.1,
        unit: "mg/dL",
        recordedAt: new Date("2026-04-19T00:00:00.000Z"),
        note: null
      }
    ]);
    extensionFindManyMock.mockResolvedValue([
      {
        id: "ext-1",
        petId: "pet-1",
        key: "INFUSION_ML",
        value: 120,
        unit: "mL",
        recordedAt: new Date("2026-04-18T00:00:00.000Z"),
        note: null
      }
    ]);

    const response = await GET(new Request("http://localhost"), { params: { petId: "pet-1" } });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.series).toEqual([
      {
        key: "core:WEIGHT_KG",
        label: "体重 (kg)",
        points: [{ x: "2026-04-20", y: 4.2 }]
      },
      {
        key: "ext:INFUSION_ML",
        label: "点滴量 (mL)",
        points: [{ x: "2026-04-18", y: 120 }]
      },
      {
        key: "lab:CRE",
        label: "Cre",
        points: [{ x: "2026-04-19", y: 1.1 }]
      }
    ]);
  });
});
