import { SubscriptionStatus } from "@prisma/client";

export type PlanTier = "trial" | "paid" | "free";
export type BillingSubscriptionStatus =
  | "INCOMPLETE"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "GRACE";

export type AccessPolicy = {
  canCreate: boolean;
  canEdit: boolean;
  canNotify: boolean;
  canShare: boolean;
  canExport: boolean;
  historyWindowDays: number | null;
};

type SubscriptionLike = {
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  graceUntil: Date | null;
} | null;

export type BillingAccessState = {
  planTier: PlanTier;
  subscriptionStatus: BillingSubscriptionStatus;
  isActive: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  accessPolicy: AccessPolicy;
};

const FREE_HISTORY_WINDOW_DAYS = 30;

const toIso = (value: Date | null): string | null => (value ? value.toISOString() : null);

const isDateInFuture = (value: Date | null, now: Date): boolean => {
  if (!value) {
    return false;
  }
  return value.getTime() >= now.getTime();
};

export const resolveBillingAccessState = (subscription: SubscriptionLike, now = new Date()): BillingAccessState => {
  const fullAccessPolicy: AccessPolicy = {
    canCreate: true,
    canEdit: true,
    canNotify: true,
    canShare: true,
    canExport: true,
    historyWindowDays: null
  };

  if (!subscription) {
    return {
      planTier: "free",
      subscriptionStatus: "INCOMPLETE",
      isActive: true,
      trialEndsAt: null,
      currentPeriodEnd: null,
      accessPolicy: fullAccessPolicy
    };
  }

  if (subscription.status === "TRIALING") {
    return {
      planTier: "trial",
      subscriptionStatus: "TRIALING",
      isActive: true,
      trialEndsAt: toIso(subscription.trialEndsAt),
      currentPeriodEnd: toIso(subscription.currentPeriodEnd),
      accessPolicy: fullAccessPolicy
    };
  }

  if (subscription.status === "ACTIVE") {
    return {
      planTier: "paid",
      subscriptionStatus: "ACTIVE",
      isActive: true,
      trialEndsAt: toIso(subscription.trialEndsAt),
      currentPeriodEnd: toIso(subscription.currentPeriodEnd),
      accessPolicy: fullAccessPolicy
    };
  }

  if (subscription.status === "PAST_DUE" && isDateInFuture(subscription.graceUntil, now)) {
    return {
      planTier: "free",
      subscriptionStatus: "GRACE",
      isActive: true,
      trialEndsAt: toIso(subscription.trialEndsAt),
      currentPeriodEnd: toIso(subscription.currentPeriodEnd),
      accessPolicy: fullAccessPolicy
    };
  }

  return {
    planTier: "free",
    subscriptionStatus: subscription.status,
    isActive: true,
    trialEndsAt: toIso(subscription.trialEndsAt),
    currentPeriodEnd: toIso(subscription.currentPeriodEnd),
    accessPolicy: fullAccessPolicy
  };
};

export const getHistoryWindowStartDate = (historyWindowDays: number | null, now = new Date()): Date | null => {
  if (!historyWindowDays) {
    return null;
  }

  const base = new Date(now);
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() - historyWindowDays + 1);
  return base;
};
