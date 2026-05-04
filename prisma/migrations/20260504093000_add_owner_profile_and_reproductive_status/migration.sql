-- CreateEnum
CREATE TYPE "ReproductiveStatus" AS ENUM ('INTACT', 'NEUTERED', 'SPAYED', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Pet"
ADD COLUMN "reproductiveStatus" "ReproductiveStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "sterilizedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OwnerProfile" (
    "id" UUID NOT NULL,
    "ownerUserId" UUID NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "postalCode" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnerProfile_ownerUserId_key" ON "OwnerProfile"("ownerUserId");
