-- AlterTable
ALTER TABLE "OwnerDisplaySettings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PetMedicalRecord" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PetMedication" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PetVaccination" ALTER COLUMN "updatedAt" DROP DEFAULT;
