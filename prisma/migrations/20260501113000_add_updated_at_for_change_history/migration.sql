ALTER TABLE "PetMedication"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "PetVaccination"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "PetMedicalRecord"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "PetMedication" SET "updatedAt" = "createdAt";
UPDATE "PetVaccination" SET "updatedAt" = "createdAt";
UPDATE "PetMedicalRecord" SET "updatedAt" = "createdAt";
