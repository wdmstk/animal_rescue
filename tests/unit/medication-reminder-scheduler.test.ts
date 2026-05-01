import { describe, expect, it } from "vitest";
import { toTimezoneDay } from "../../src/lib/services/medication-reminder-scheduler";

describe("toTimezoneDay", () => {
  it("uses UTC day by default", () => {
    const date = new Date("2026-05-01T23:30:00.000Z");
    expect(toTimezoneDay(date).toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  it("uses configured timezone day for boundary case", () => {
    const date = new Date("2026-05-01T23:30:00.000Z");
    expect(toTimezoneDay(date, "Asia/Tokyo").toISOString()).toBe("2026-05-02T00:00:00.000Z");
  });
});
