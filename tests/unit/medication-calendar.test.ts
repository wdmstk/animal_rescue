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
});
