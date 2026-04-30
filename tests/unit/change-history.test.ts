import { describe, expect, it } from "vitest";
import { buildChangeHistoryItems } from "../../src/lib/services/change-history";

describe("buildChangeHistoryItems", () => {
  it("builds and sorts change history across emergency/medication/vaccination/medical record", () => {
    const items = buildChangeHistoryItems({
      emergencyInfo: { updatedAt: "2026-04-01T09:00:00.000Z" },
      medications: [{ id: "m1", name: "ピモベンダン", createdAt: "2026-04-02T09:00:00.000Z" }],
      vaccinations: [{ id: "v1", type: "RABIES", customTypeName: null, createdAt: "2026-04-03T09:00:00.000Z" }],
      medicalRecords: [{ id: "r1", title: "定期健診", createdAt: "2026-04-04T09:00:00.000Z" }]
    });

    expect(items).toHaveLength(4);
    expect(items[0]).toMatchObject({ target: "医療記録: 定期健診" });
    expect(items[1]).toMatchObject({ target: "ワクチン: 狂犬病" });
    expect(items[2]).toMatchObject({ target: "投薬: ピモベンダン" });
    expect(items[3]).toMatchObject({ target: "緊急情報" });
  });

  it("uses custom name for OTHER vaccination", () => {
    const items = buildChangeHistoryItems({
      emergencyInfo: null,
      medications: [],
      vaccinations: [{ id: "v1", type: "OTHER", customTypeName: "抗体検査", createdAt: "2026-04-03T09:00:00.000Z" }],
      medicalRecords: []
    });

    expect(items[0]).toMatchObject({ target: "ワクチン: 抗体検査" });
  });
});
