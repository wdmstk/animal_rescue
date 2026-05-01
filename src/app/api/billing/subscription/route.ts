import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveBillingAccessState } from "@/lib/billing/access-policy";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId: user.id },
    select: {
      status: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      graceUntil: true
    }
  });

  const resolved = resolveBillingAccessState(subscription);

  return NextResponse.json({
    data: {
      planTier: resolved.planTier,
      subscriptionStatus: resolved.subscriptionStatus,
      status: resolved.subscriptionStatus,
      isActive: resolved.isActive,
      trialEndsAt: resolved.trialEndsAt,
      currentPeriodEnd: resolved.currentPeriodEnd,
      accessPolicy: resolved.accessPolicy
    }
  });
}
