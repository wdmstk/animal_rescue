import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveBillingAccessState } from "@/lib/billing/access-policy";

const billingSelect = {
  status: true,
  trialEndsAt: true,
  currentPeriodEnd: true,
  graceUntil: true
} as const;

export const getUserBillingAccessState = async (userId: string) => {
  const delegate = (prisma as unknown as { userSubscription?: { findUnique?: (args: unknown) => Promise<unknown> } })
    .userSubscription;
  if (!delegate?.findUnique) {
    return resolveBillingAccessState({
      status: "ACTIVE",
      trialEndsAt: null,
      currentPeriodEnd: null,
      graceUntil: null
    });
  }

  try {
    const subscription = (await prisma.userSubscription.findUnique({
      where: { userId },
      select: billingSelect
    })) as {
      status: "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
      trialEndsAt: Date | null;
      currentPeriodEnd: Date | null;
      graceUntil: Date | null;
    } | null;

    return resolveBillingAccessState(subscription);
  } catch {
    try {
      const legacy = await prisma.userSubscription.findUnique({
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
