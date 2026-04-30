CREATE TABLE "OwnerDisplaySettings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ownerUserId" UUID NOT NULL,
  "showMedicationCard" BOOLEAN NOT NULL DEFAULT true,
  "showVaccinationCard" BOOLEAN NOT NULL DEFAULT true,
  "showHealthCard" BOOLEAN NOT NULL DEFAULT true,
  "showMedicalRecordCard" BOOLEAN NOT NULL DEFAULT true,
  "showEmergencyMedicationSummary" BOOLEAN NOT NULL DEFAULT true,
  "showEmergencyVaccinationSummary" BOOLEAN NOT NULL DEFAULT true,
  "showEmergencyMedicalRecordSummary" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OwnerDisplaySettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OwnerDisplaySettings_ownerUserId_key" ON "OwnerDisplaySettings"("ownerUserId");

-- Backfill from existing pet-scoped settings, merged by owner user.
INSERT INTO "OwnerDisplaySettings" (
  "ownerUserId",
  "showMedicationCard",
  "showVaccinationCard",
  "showHealthCard",
  "showMedicalRecordCard",
  "showEmergencyMedicationSummary",
  "showEmergencyVaccinationSummary",
  "showEmergencyMedicalRecordSummary",
  "updatedAt"
)
SELECT
  hm."userId" AS "ownerUserId",
  COALESCE(bool_or(pds."showMedicationCard"), true) AS "showMedicationCard",
  COALESCE(bool_or(pds."showVaccinationCard"), true) AS "showVaccinationCard",
  COALESCE(bool_or(pds."showHealthCard"), true) AS "showHealthCard",
  COALESCE(bool_or(pds."showMedicalRecordCard"), true) AS "showMedicalRecordCard",
  COALESCE(bool_or(pds."showEmergencyMedicationSummary"), true) AS "showEmergencyMedicationSummary",
  COALESCE(bool_or(pds."showEmergencyVaccinationSummary"), true) AS "showEmergencyVaccinationSummary",
  COALESCE(bool_or(pds."showEmergencyMedicalRecordSummary"), true) AS "showEmergencyMedicalRecordSummary",
  now() AS "updatedAt"
FROM "HouseholdMember" hm
LEFT JOIN "Pet" p ON p."householdId" = hm."householdId"
LEFT JOIN "PetDisplaySettings" pds ON pds."petId" = p."id"
WHERE hm."role" = 'OWNER'
GROUP BY hm."userId"
ON CONFLICT ("ownerUserId") DO NOTHING;
