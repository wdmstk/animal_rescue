import { describe, expect, it } from "vitest";
import { coreHealthEntryInputSchema, healthExtensionEntryInputSchema, labResultEntryInputSchema } from "../../src/lib/validators/health";

describe("health validators", () => {
  it("accepts valid core metric payload", () => {
    const parsed = coreHealthEntryInputSchema.safeParse({
      type: "WEIGHT_KG",
      value: 4.25,
      recordedAt: "2026-04-20"
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects negative lab values", () => {
    const parsed = labResultEntryInputSchema.safeParse({
      category: "BLOOD",
      marker: "CRE",
      value: -0.1,
      unit: "mg/dL",
      recordedAt: "2026-04-20"
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts optional extension unit", () => {
    const parsed = healthExtensionEntryInputSchema.safeParse({
      name: "点滴量",
      value: 100,
      recordedAt: "2026-04-20",
      unit: null
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects blank lab unit", () => {
    const parsed = labResultEntryInputSchema.safeParse({
      category: "BLOOD",
      marker: "CRE",
      value: 1.8,
      unit: "   ",
      recordedAt: "2026-04-20"
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid recordedAt value", () => {
    const parsed = coreHealthEntryInputSchema.safeParse({
      type: "WEIGHT_KG",
      value: 4.25,
      recordedAt: "not-a-date"
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects inconsistent category and marker", () => {
    const parsed = labResultEntryInputSchema.safeParse({
      category: "URINE",
      marker: "CRE",
      value: 1.8,
      unit: "mg/dL",
      recordedAt: "2026-04-20"
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts urine marker with urine category", () => {
    const parsed = labResultEntryInputSchema.safeParse({
      category: "URINE",
      marker: "USG",
      value: 1.028,
      unit: "SG",
      recordedAt: "2026-04-20"
    });

    expect(parsed.success).toBe(true);
  });
});
