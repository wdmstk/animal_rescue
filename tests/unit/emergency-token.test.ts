import { describe, expect, it } from "vitest";
import { generateEmergencyToken, isEmergencyToken } from "../../src/lib/security/emergency-token";

describe("emergency token", () => {
  it("generates valid UUID token", () => {
    const token = generateEmergencyToken();

    expect(isEmergencyToken(token)).toBe(true);
  });

  it("rejects non UUID token", () => {
    expect(isEmergencyToken("not-token")).toBe(false);
  });
});

