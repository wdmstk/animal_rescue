import { describe, expect, it } from "vitest";
import { getVaccinationDueStatus } from "../../src/lib/services/vaccination";

describe("getVaccinationDueStatus", () => {
  it("returns overdue when date is in the past", () => {
    expect(getVaccinationDueStatus("2000-01-01")).toBe("overdue");
  });

  it("returns ok when nextDue is null", () => {
    expect(getVaccinationDueStatus(null)).toBe("ok");
  });
});
