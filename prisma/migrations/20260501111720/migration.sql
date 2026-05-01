-- AlterTable
ALTER TABLE "OwnerDisplaySettings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PetMedicalRecord'
      AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "PetMedicalRecord" ALTER COLUMN "updatedAt" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PetMedication'
      AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "PetMedication" ALTER COLUMN "updatedAt" DROP DEFAULT;
  END IF;
END $$;

-- AlterTable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'PetVaccination'
      AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "PetVaccination" ALTER COLUMN "updatedAt" DROP DEFAULT;
  END IF;
END $$;
