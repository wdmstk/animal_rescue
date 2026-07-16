import { describe, expect, it } from "vitest";
import { ONBOARDING_TOTAL_STEPS, calculateOnboardingProgress, getOnboardingSteps } from "@/lib/onboarding-progress";

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

describe("getOnboardingSteps", () => {
  it("returns 3 steps when no pets registered", () => {
    const steps = getOnboardingSteps(false);
    expect(steps).toHaveLength(3);
    expect(steps[0].completed).toBe(false);
    expect(steps[0].id).toBe("pet-registration");
    expect(steps[0].title).toBe("ペット登録");
  });

  it("marks first step as completed when pets are registered", () => {
    const steps = getOnboardingSteps(true);
    expect(steps).toHaveLength(3);
    expect(steps[0].completed).toBe(true);
    expect(steps[1].completed).toBe(false);
    expect(steps[2].completed).toBe(false);
  });

  it("returns correct step structure", () => {
    const steps = getOnboardingSteps(false);
    steps.forEach(step => {
      expect(step).toHaveProperty("id");
      expect(step).toHaveProperty("title");
      expect(step).toHaveProperty("description");
      expect(step).toHaveProperty("completed");
      expect(typeof step.id).toBe("string");
      expect(typeof step.title).toBe("string");
      expect(typeof step.description).toBe("string");
      expect(typeof step.completed).toBe("boolean");
    });
  });
});
