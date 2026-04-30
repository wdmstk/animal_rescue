import { describe, expect, it } from "vitest";
import type { HealthTrendSeries } from "../../src/types/health";
import { filterHealthSeries, pickDisplaySeriesKey } from "../../src/lib/services/health-series-filter";

const baseSeries: HealthTrendSeries[] = [
  {
    key: "core:WEIGHT_KG",
    label: "体重 (kg)",
    points: [
      { x: "2026-04-20", y: 4.2 },
      { x: "2026-04-24", y: 4.3 }
    ]
  },
  {
    key: "lab:CRE",
    label: "Cre",
    points: [{ x: "2026-04-23", y: 1.1 }]
  },
  {
    key: "ext:点滴量",
    label: "点滴量 (mL)",
    points: [{ x: "2026-04-10", y: 120 }]
  }
];

describe("health series filter", () => {
  it("filters by category", () => {
    const filtered = filterHealthSeries(baseSeries, "lab", null, new Date("2026-04-25T00:00:00.000Z"));
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.key).toBe("lab:CRE");
  });

  it("filters by day window and drops empty series", () => {
    const filtered = filterHealthSeries(baseSeries, "all", 7, new Date("2026-04-25T00:00:00.000Z"));
    expect(filtered.map((item) => item.key)).toEqual(["core:WEIGHT_KG", "lab:CRE"]);
    expect(filtered[0]?.points).toEqual([
      { x: "2026-04-20", y: 4.2 },
      { x: "2026-04-24", y: 4.3 }
    ]);
  });

  it("keeps current key when available", () => {
    expect(pickDisplaySeriesKey(baseSeries, "lab:CRE")).toBe("lab:CRE");
  });

  it("falls back to first key when current is missing", () => {
    expect(pickDisplaySeriesKey(baseSeries, "core:BODY_TEMPERATURE_C")).toBe("core:WEIGHT_KG");
  });
});
