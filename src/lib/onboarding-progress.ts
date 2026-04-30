export const ONBOARDING_TOTAL_STEPS = 3;

export const calculateOnboardingProgress = (completedSteps: number, totalSteps = ONBOARDING_TOTAL_STEPS) => {
  if (totalSteps <= 0) {
    return 0;
  }

  const safeCompletedSteps = Math.max(0, Math.min(completedSteps, totalSteps));
  return Math.round((safeCompletedSteps / totalSteps) * 100);
};
