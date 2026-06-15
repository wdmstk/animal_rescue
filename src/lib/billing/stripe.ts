import Stripe from "stripe";
import { env } from "@/lib/env";
import { SubscriptionStatus } from "@prisma/client";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia"
});

export const toSubscriptionStatus = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "unpaid":
      return "UNPAID";
    default:
      return "INCOMPLETE";
  }
};

export const isPaidStatus = (status: SubscriptionStatus): boolean => {
  return status === "ACTIVE" || status === "TRIALING";
};
