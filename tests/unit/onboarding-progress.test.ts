import { describe, expect, it } from "vitest";
import { ONBOARDING_TOTAL_STEPS, calculateOnboardingProgress } from "@/lib/onboarding-progress";

describe("calculateOnboardingProgress", () => {
  it("returns 0 when no steps are completed", () => {
    expect(calculateOnboardingProgress(0, ONBOARDING_TOTAL_STEPS)).toBe(0);
  });

  it("returns rounded percentage for partial completion", () => {
    expect(calculateOnboardingProgress(1, ONBOARDING_TOTAL_STEPS)).toBe(33);
  });

  it("caps completion at 100", () => {
    expect(calculateOnboardingProgress(5, ONBOARDING_TOTAL_STEPS)).toBe(100);
  });
});
