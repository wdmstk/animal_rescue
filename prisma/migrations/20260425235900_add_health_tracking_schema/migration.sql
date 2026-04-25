-- CreateEnum
CREATE TYPE "CoreMetricType" AS ENUM ('WEIGHT_KG', 'WATER_INTAKE_ML', 'APPETITE_SCORE', 'URINATION_COUNT', 'DEFECATION_COUNT', 'VOMIT_COUNT', 'BODY_TEMPERATURE_C');

-- CreateEnum
CREATE TYPE "LabMarkerType" AS ENUM ('CRE', 'BUN', 'SDMA', 'PHOSPHORUS');

-- CreateEnum
CREATE TYPE "HealthExtensionKey" AS ENUM ('INFUSION_ML');

-- CreateTable
CREATE TABLE "PetCoreMetricEntry" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "type" "CoreMetricType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetCoreMetricEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetLabResultEntry" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "marker" "LabMarkerType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetLabResultEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetHealthExtensionEntry" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "key" "HealthExtensionKey" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetHealthExtensionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PetCoreMetricEntry_petId_type_recordedAt_idx" ON "PetCoreMetricEntry"("petId", "type", "recordedAt");

-- CreateIndex
CREATE INDEX "PetLabResultEntry_petId_marker_recordedAt_idx" ON "PetLabResultEntry"("petId", "marker", "recordedAt");

-- CreateIndex
CREATE INDEX "PetHealthExtensionEntry_petId_key_recordedAt_idx" ON "PetHealthExtensionEntry"("petId", "key", "recordedAt");

-- AddForeignKey
ALTER TABLE "PetCoreMetricEntry" ADD CONSTRAINT "PetCoreMetricEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetLabResultEntry" ADD CONSTRAINT "PetLabResultEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetHealthExtensionEntry" ADD CONSTRAINT "PetHealthExtensionEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
