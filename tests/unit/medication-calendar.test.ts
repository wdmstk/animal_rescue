import { describe, expect, it } from "vitest";
import { buildMedicationCalendar } from "../../src/lib/services/medication-calendar";

describe("buildMedicationCalendar", () => {
  it("maps medications onto date keys", () => {
    const calendar = buildMedicationCalendar(
      [
        { name: "ピモベンダン", startDate: "2026-04-01", endDate: null },
        { name: "抗生剤", startDate: "2026-03-01", endDate: "2026-03-02" }
      ],
      1
    );

    const first = Object.values(calendar)[0];
    expect(first).toContain("ピモベンダン");
    expect(first).not.toContain("抗生剤");
  });

  it("includes medication on endDate (inclusive)", () => {
    const keys = Object.keys(buildMedicationCalendar([], 2));
    const start = keys[0];
    const end = keys[1];
    const calendar = buildMedicationCalendar(
      [{ name: "整腸剤", startDate: start, endDate: end }],
      2
    );

    expect(calendar[end]).toContain("整腸剤");
  });

  it("returns empty list for date before startDate", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().slice(0, 10);
    const calendar = buildMedicationCalendar(
      [{ name: "抗生剤", startDate, endDate: null }],
      1
    );

    const first = Object.values(calendar)[0];
    expect(first).toEqual([]);
  });
});
