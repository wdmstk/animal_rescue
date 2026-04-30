-- CreateEnum
CREATE TYPE "LabResultCategory" AS ENUM ('BLOOD', 'URINE', 'ENDOCRINE');

-- AlterTable
ALTER TABLE "PetLabResultEntry"
ADD COLUMN "category" "LabResultCategory" NOT NULL DEFAULT 'BLOOD';

-- Update existing rows explicitly for clarity during migration history review
UPDATE "PetLabResultEntry"
SET "category" = 'BLOOD'
WHERE "category" IS NULL;

-- Replace index to include category for common filtered reads
DROP INDEX "PetLabResultEntry_petId_marker_recordedAt_idx";
CREATE INDEX "PetLabResultEntry_petId_category_marker_recordedAt_idx"
ON "PetLabResultEntry"("petId", "category", "marker", "recordedAt");
