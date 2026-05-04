import { describe, expect, it } from "vitest";
import { emergencyInfoInputSchema } from "../../src/lib/validators/emergency";
import { petInputSchema } from "../../src/lib/validators/pet";

describe("validators", () => {
  it("rejects invalid pet species", () => {
    const result = petInputSchema.safeParse({
      householdId: "c4a5c8b5-2dc0-4a9a-8d95-218f6e0aef54",
      name: "モカ",
      species: "rabbit",
      sex: "UNKNOWN"
    });

    expect(result.success).toBe(false);
  });

  it("rejects sterilizedAt when reproductiveStatus is INTACT", () => {
    const result = petInputSchema.safeParse({
      householdId: "c4a5c8b5-2dc0-4a9a-8d95-218f6e0aef54",
      name: "モカ",
      species: "dog",
      sex: "FEMALE",
      reproductiveStatus: "INTACT",
      sterilizedAt: "2024-01-01"
    });

    expect(result.success).toBe(false);
  });

  it("accepts sterilizedAt when reproductiveStatus is SPAYED", () => {
    const result = petInputSchema.safeParse({
      householdId: "c4a5c8b5-2dc0-4a9a-8d95-218f6e0aef54",
      name: "モカ",
      species: "dog",
      sex: "FEMALE",
      reproductiveStatus: "SPAYED",
      sterilizedAt: "2024-01-01"
    });

    expect(result.success).toBe(true);
  });

  it("accepts emergency info with nullable fields", () => {
    const result = emergencyInfoInputSchema.safeParse({
      disease: null,
      allergy: "鶏肉",
      currentMedications: null,
      vetName: "みなと動物病院",
      vetPhone: "03-1234-5678"
    });

    expect(result.success).toBe(true);
  });

  it("rejects emergency phone with unsupported characters", () => {
    const result = emergencyInfoInputSchema.safeParse({
      emergencyContactPhone: "090-1234-5678#999"
    });

    expect(result.success).toBe(false);
  });

  it("normalizes full-width emergency phone characters", () => {
    const result = emergencyInfoInputSchema.safeParse({
      emergencyContactPhone: "０９０ー１２３４ー５６７８"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emergencyContactPhone).toBe("090-1234-5678");
    }
  });
});
