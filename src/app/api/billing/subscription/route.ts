import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isPaidStatus } from "@/lib/billing/stripe";

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
    where: { userId: user.id }
  });

  return NextResponse.json({
    data: {
      status: subscription?.status ?? "INCOMPLETE",
      isActive: subscription ? isPaidStatus(subscription.status) : false,
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null
    }
  });
}
