import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { stripe } from "@/lib/billing/stripe";
import { unauthorized, badRequest } from "@/lib/api-error";

interface CheckoutRequest {
  plan: "monthly" | "annual";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return unauthorized();
  }

  let plan: "monthly" | "annual" = "monthly";
  try {
    const body: CheckoutRequest = await request.json();
    if (body.plan === "monthly" || body.plan === "annual") {
      plan = body.plan;
    }
  } catch {
    // If no body or invalid JSON, default to monthly
  }

  if (plan === "annual" && !env.STRIPE_PRICE_ID_ANNUAL_6800) {
    return badRequest("Annual plan is not available");
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
      stripeCustomerId: customerId,
      status: "TRIALING",
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    update: {
      stripeCustomerId: customerId
    }
  });

  const priceId = plan === "annual" 
    ? env.STRIPE_PRICE_ID_ANNUAL_6800 
    : env.STRIPE_PRICE_ID_MONTHLY_680;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 30
    },
    success_url: `${env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/settings?billing=cancel`
  });

  return NextResponse.json({ data: { url: session.url } });
}
