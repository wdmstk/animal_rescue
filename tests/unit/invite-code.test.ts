import { describe, expect, it } from "vitest";
import { calculateExpiry, generateInviteCode } from "../../src/lib/services/invite-code";

describe("invite code", () => {
  it("generates uppercase code", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[0-9A-F]+$/);
  });

  it("calculates expiry by hours", () => {
    const now = new Date();
    const expiry = calculateExpiry(2);
    expect(expiry.getTime()).toBeGreaterThan(now.getTime());
  });
});
