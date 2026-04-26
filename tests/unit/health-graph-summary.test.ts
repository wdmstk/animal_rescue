import { describe, expect, it } from "vitest";
import { summarizeHealthTrendSeries } from "../../src/lib/services/health-graph-summary";

describe("summarizeHealthTrendSeries", () => {
  it("returns null when series is null", () => {
    expect(summarizeHealthTrendSeries(null)).toBeNull();
  });

  it("returns null when points are empty", () => {
    expect(
      summarizeHealthTrendSeries({
        key: "core:WEIGHT_KG",
        label: "体重 (kg)",
        points: []
      })
    ).toBeNull();
  });

  it("builds summary from sorted points", () => {
    const summary = summarizeHealthTrendSeries({
      key: "core:WEIGHT_KG",
      label: "体重 (kg)",
      points: [
        { x: "2026-04-01", y: 4.1 },
        { x: "2026-04-03", y: 4.5 },
        { x: "2026-04-05", y: 4.3 }
      ]
    });

    expect(summary).toEqual({
      latest: 4.3,
      min: 4.1,
      max: 4.5,
      count: 3,
      startDate: "2026-04-01",
      endDate: "2026-04-05"
    });
  });
});
