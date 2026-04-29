import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { stripe, toSubscriptionStatus } from "@/lib/billing/stripe";

const upsertSubscriptionByStripe = async (input: {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: ReturnType<typeof toSubscriptionStatus>;
  currentPeriodEnd: Date | null;
}) => {
  const existing = await prisma.userSubscription.findFirst({
    where: { stripeCustomerId: input.stripeCustomerId },
    select: { userId: true }
  });

  if (!existing?.userId) {
    return;
  }

  await prisma.userSubscription.upsert({
    where: { userId: existing.userId },
    create: {
      userId: existing.userId,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd
    },
    update: {
      stripeSubscriptionId: input.stripeSubscriptionId,
      status: input.status,
      currentPeriodEnd: input.currentPeriodEnd
    }
  });
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (typeof session.subscription === "string" && typeof session.customer === "string") {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await upsertSubscriptionByStripe({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: session.customer,
        status: toSubscriptionStatus(subscription.status),
        currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
      });
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    await upsertSubscriptionByStripe({
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: String(subscription.customer),
      status: toSubscriptionStatus(subscription.status),
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null
    });
  }

  return NextResponse.json({ received: true });
}
