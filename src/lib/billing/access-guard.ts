import { NextResponse } from "next/server";
import { resolveBillingAccessState } from "@/lib/billing/access-policy";

const billingSelect = {
  status: true,
  trialEndsAt: true,
  currentPeriodEnd: true,
  graceUntil: true
} as const;

export const getUserBillingAccessState = async (userId: string) => {
  let prismaModule: { prisma: { userSubscription?: { findUnique?: (args: unknown) => Promise<unknown> } } } | null = null;
  try {
    prismaModule = (await import("@/lib/prisma")) as {
      prisma: { userSubscription?: { findUnique?: (args: unknown) => Promise<unknown> } };
    };
  } catch {
    return resolveBillingAccessState({
      status: "ACTIVE",
      trialEndsAt: null,
      currentPeriodEnd: null,
      graceUntil: null
    });
  }

  const prisma = prismaModule.prisma as unknown as {
    userSubscription?: {
      findUnique?: (args: {
        where: { userId: string };
        select: { status: true; trialEndsAt?: true; currentPeriodEnd: true; graceUntil?: true };
      }) => Promise<{
        status: "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
        trialEndsAt?: Date | null;
        currentPeriodEnd: Date | null;
        graceUntil?: Date | null;
      } | null>;
    };
  };

  const delegate = prisma.userSubscription;
  if (!delegate?.findUnique) {
    return resolveBillingAccessState({
      status: "ACTIVE",
      trialEndsAt: null,
      currentPeriodEnd: null,
      graceUntil: null
    });
  }

  try {
    const subscription = (await delegate.findUnique({
      where: { userId },
      select: billingSelect
    })) as {
      status: "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
      trialEndsAt?: Date | null;
      currentPeriodEnd: Date | null;
      graceUntil?: Date | null;
    } | null;

    return resolveBillingAccessState(
      subscription
        ? {
            status: subscription.status,
            trialEndsAt: subscription.trialEndsAt ?? null,
            currentPeriodEnd: subscription.currentPeriodEnd,
            graceUntil: subscription.graceUntil ?? null
          }
        : null
    );
  } catch {
    try {
      const legacy = await delegate.findUnique({
        where: { userId },
        select: { status: true, currentPeriodEnd: true }
      });

      if (!legacy) {
        return resolveBillingAccessState(null);
      }

      return resolveBillingAccessState({
        status: legacy.status,
        trialEndsAt: null,
        currentPeriodEnd: legacy.currentPeriodEnd,
        graceUntil: null
      });
    } catch {
      return resolveBillingAccessState({
        status: "ACTIVE",
        trialEndsAt: null,
        currentPeriodEnd: null,
        graceUntil: null
      });
    }
  }
};

const denied = (message: string) => NextResponse.json({ error: message }, { status: 402 });

export const requireCreateAccess = async (userId: string) => {
  const billing = await getUserBillingAccessState(userId);
  if (!billing.accessPolicy.canCreate) {
    return denied("この機能は有料プランで利用できます");
  }
  return billing;
};

export const requireEditAccess = async (userId: string) => {
  const billing = await getUserBillingAccessState(userId);
  if (!billing.accessPolicy.canEdit) {
    return denied("この機能は有料プランで利用できます");
  }
  return billing;
};

export const requireShareAccess = async (userId: string) => {
  const billing = await getUserBillingAccessState(userId);
  if (!billing.accessPolicy.canShare) {
    return denied("この機能は有料プランで利用できます");
  }
  return billing;
};

export const requireNotifyAccess = async (userId: string) => {
  const billing = await getUserBillingAccessState(userId);
  if (!billing.accessPolicy.canNotify) {
    return denied("この機能は有料プランで利用できます");
  }
  return billing;
};

export const requireExportAccess = async (userId: string) => {
  const billing = await getUserBillingAccessState(userId);
  if (!billing.accessPolicy.canExport) {
    return denied("この機能は有料プランで利用できます");
  }
  return billing;
};
