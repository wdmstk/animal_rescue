-- Add custom name for OTHER vaccination type
ALTER TABLE "PetVaccination"
  ADD COLUMN IF NOT EXISTS "customTypeName" TEXT;

-- Convert health extension key enum to free-text name
ALTER TABLE "PetHealthExtensionEntry"
  RENAME COLUMN "key" TO "name";

ALTER TABLE "PetHealthExtensionEntry"
  ALTER COLUMN "name" TYPE TEXT USING "name"::text;

DROP INDEX IF EXISTS "PetHealthExtensionEntry_petId_key_recordedAt_idx";
CREATE INDEX IF NOT EXISTS "PetHealthExtensionEntry_petId_name_recordedAt_idx"
  ON "PetHealthExtensionEntry"("petId", "name", "recordedAt");

-- Backfill existing INFUSION_ML name to Japanese label
UPDATE "PetHealthExtensionEntry"
SET "name" = '点滴量'
WHERE "name" = 'INFUSION_ML';
