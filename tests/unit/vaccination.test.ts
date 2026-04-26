import { describe, expect, it } from "vitest";
import { getVaccinationDueStatus } from "../../src/lib/services/vaccination";

describe("getVaccinationDueStatus", () => {
  it("returns overdue when date is in the past", () => {
    expect(getVaccinationDueStatus("2000-01-01")).toBe("overdue");
  });

  it("returns upcoming when due date is within 30 days", () => {
    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 7);
    const iso = upcoming.toISOString().slice(0, 10);
    expect(getVaccinationDueStatus(iso)).toBe("upcoming");
  });

  it("returns ok when due date is after 30 days", () => {
    const later = new Date();
    later.setDate(later.getDate() + 45);
    const iso = later.toISOString().slice(0, 10);
    expect(getVaccinationDueStatus(iso)).toBe("ok");
  });

  it("returns ok when nextDue is null", () => {
    expect(getVaccinationDueStatus(null)).toBe("ok");
  });
});
