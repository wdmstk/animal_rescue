CREATE TABLE "HouseholdRoleRecoveryLog" (
    "id" UUID NOT NULL,
    "householdId" UUID NOT NULL,
    "recoveredUserId" UUID NOT NULL,
    "triggeredByUserId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdRoleRecoveryLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HouseholdRoleRecoveryLog_householdId_createdAt_idx" ON "HouseholdRoleRecoveryLog"("householdId", "createdAt");
CREATE INDEX "HouseholdRoleRecoveryLog_triggeredByUserId_createdAt_idx" ON "HouseholdRoleRecoveryLog"("triggeredByUserId", "createdAt");
