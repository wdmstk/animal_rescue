import { describe, expect, it } from "vitest";
import { createInviteCodeSchema, joinByInviteSchema } from "../../src/lib/validators/invite";

describe("invite validators", () => {
  it("rejects create invite payload with invalid householdId", () => {
    const result = createInviteCodeSchema.safeParse({
      householdId: "not-uuid",
      expiresInHours: 24
    });

    expect(result.success).toBe(false);
  });

  it("rejects join payload with too short code", () => {
    const result = joinByInviteSchema.safeParse({
      code: "12345"
    });

    expect(result.success).toBe(false);
  });
});
