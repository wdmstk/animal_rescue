import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { stripe } from "@/lib/billing/stripe";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "認証が必要です。ログイン後に再度お試しください。" }, { status: 401 });
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId: user.id },
    select: {
      stripeCustomerId: true
    }
  });

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "契約情報が見つかりません。先に無料トライアルを開始してください。" },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/settings`
  });

  return NextResponse.json({ data: { url: session.url } });
}
