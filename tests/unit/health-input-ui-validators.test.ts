import { describe, expect, it } from "vitest";
import { isValidDateInput, parseNonNegativeNumber } from "../../src/lib/validators/health-input-ui";

describe("health input ui validators", () => {
  it("parses valid non-negative number", () => {
    expect(parseNonNegativeNumber(" 4.25 ")).toBe(4.25);
    expect(parseNonNegativeNumber("0")).toBe(0);
  });

  it("returns null for invalid number input", () => {
    expect(parseNonNegativeNumber("")).toBeNull();
    expect(parseNonNegativeNumber("-0.1")).toBeNull();
    expect(parseNonNegativeNumber("abc")).toBeNull();
  });

  it("accepts valid YYYY-MM-DD date", () => {
    expect(isValidDateInput("2026-04-26")).toBe(true);
    expect(isValidDateInput("2024-02-29")).toBe(true);
  });

  it("rejects invalid date formats and values", () => {
    expect(isValidDateInput("2026/04/26")).toBe(false);
    expect(isValidDateInput("2026-13-01")).toBe(false);
    expect(isValidDateInput("2026-02-30")).toBe(false);
  });
});
