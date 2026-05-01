ALTER TABLE "UserSubscription"
  ADD COLUMN "trialEndsAt" TIMESTAMP(3),
  ADD COLUMN "graceUntil" TIMESTAMP(3);
