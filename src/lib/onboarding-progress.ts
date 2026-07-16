export const ONBOARDING_TOTAL_STEPS = 3;

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const calculateOnboardingProgress = (completedSteps: number, totalSteps = ONBOARDING_TOTAL_STEPS) => {
  if (totalSteps <= 0) {
    return 0;
  }

  const safeCompletedSteps = Math.max(0, Math.min(completedSteps, totalSteps));
  return Math.round((safeCompletedSteps / totalSteps) * 100);
};

export const getOnboardingSteps = (hasPets: boolean): OnboardingStep[] => {
  return [
    {
      id: "pet-registration",
      title: "ペット登録",
      description: "ペットの基本情報を登録",
      completed: hasPets
    },
    {
      id: "emergency-info",
      title: "緊急情報入力",
      description: "持病・アレルギー・連絡先",
      completed: false // TODO: 実際の緊急情報完了状態をチェック
    },
    {
      id: "qr-share",
      title: "QR共有",
      description: "緊急用QRコードを共有",
      completed: false // TODO: 実際のQR共有完了状態をチェック
    }
  ];
};
