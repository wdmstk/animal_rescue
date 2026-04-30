import { describe, expect, it } from "vitest";
import { buildHealthTrendSeries } from "../../src/lib/services/health-trends";

describe("buildHealthTrendSeries", () => {
  it("aggregates and sorts points by date", () => {
    const series = buildHealthTrendSeries(
      [
        {
          id: "c1",
          petId: "p1",
          type: "WEIGHT_KG",
          value: 4.2,
          recordedAt: "2026-04-02T00:00:00.000Z",
          note: null
        },
        {
          id: "c2",
          petId: "p1",
          type: "WEIGHT_KG",
          value: 4.1,
          recordedAt: "2026-04-01T00:00:00.000Z",
          note: null
        }
      ],
      [
        {
          id: "l1",
          petId: "p1",
          category: "BLOOD",
          marker: "CRE",
          value: 1.8,
          unit: "mg/dL",
          recordedAt: "2026-04-01T00:00:00.000Z",
          note: null
        }
      ],
      []
    );

    const weightSeries = series.find((item) => item.key === "core:WEIGHT_KG");
    expect(weightSeries?.points.map((point) => point.x)).toEqual(["2026-04-01", "2026-04-02"]);

    const creSeries = series.find((item) => item.key === "lab:CRE");
    expect(creSeries?.label).toBe("Cre");
  });
});
