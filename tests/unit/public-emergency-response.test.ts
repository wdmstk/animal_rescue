import { describe, expect, it } from "vitest";
import { toPublicEmergencyView } from "../../src/lib/services/public-emergency";

describe("toPublicEmergencyView", () => {
  it("normalizes blank strings to null", () => {
    const result = toPublicEmergencyView({
      petName: "モカ",
      disease: "  ",
      allergy: "鶏肉",
      currentMedications: " ",
      vetName: "みなと動物病院",
      vetPhone: "03-1234-5678",
      emergencyContactName: "山田 花子",
      emergencyContactPhone: "090-1234-5678"
    });

    expect(result.petName).toBe("モカ");
    expect(result.disease).toBeNull();
    expect(result.medications).toBeNull();
    expect(result.allergy).toBe("鶏肉");
  });
});

