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
      marker: "CRE",
      value: -0.1,
      unit: "mg/dL",
      recordedAt: "2026-04-20"
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts optional extension unit", () => {
    const parsed = healthExtensionEntryInputSchema.safeParse({
      key: "INFUSION_ML",
      value: 100,
      recordedAt: "2026-04-20",
      unit: null
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects blank lab unit", () => {
    const parsed = labResultEntryInputSchema.safeParse({
      marker: "CRE",
      value: 1.8,
      unit: "   ",
      recordedAt: "2026-04-20"
    });

    expect(parsed.success).toBe(false);
  });
});
