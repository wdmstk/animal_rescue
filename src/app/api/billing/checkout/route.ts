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
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const current = await prisma.userSubscription.findUnique({
    where: { userId: user.id }
  });

  let customerId = current?.stripeCustomerId ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: {
        userId: user.id
      }
    });
    customerId = customer.id;
  }

  await prisma.userSubscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stripeCustomerId: customerId
    },
    update: {
      stripeCustomerId: customerId
    }
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: env.STRIPE_PRICE_ID_MONTHLY_500, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings?billing=cancel`
  });

  return NextResponse.json({ data: { url: session.url } });
}
