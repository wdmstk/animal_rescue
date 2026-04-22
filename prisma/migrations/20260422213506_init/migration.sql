-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'FAMILY');

-- CreateEnum
CREATE TYPE "PetSex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MedicalRecordType" AS ENUM ('EXAM', 'SURGERY', 'LAB', 'MEDICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "VaccinationType" AS ENUM ('RABIES', 'CORE', 'HEARTWORM', 'FLEA_TICK', 'OTHER');

-- CreateTable
CREATE TABLE "Household" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" UUID NOT NULL,
    "householdId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'FAMILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdInviteCode" (
    "id" UUID NOT NULL,
    "householdId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedBy" UUID,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdInviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" UUID NOT NULL,
    "householdId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "sex" "PetSex" NOT NULL DEFAULT 'UNKNOWN',
    "birthday" TIMESTAMP(3),
    "ageYears" INTEGER,
    "weightKg" DECIMAL(4,1),
    "mainPhotoUrl" TEXT,
    "notesPersonality" TEXT,
    "notesFeatures" TEXT,
    "microchipNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetPhoto" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetEmergencyInfo" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "disease" TEXT,
    "allergy" TEXT,
    "currentMedications" TEXT,
    "vetName" TEXT,
    "vetPhone" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetEmergencyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetMedicalRecord" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "recordType" "MedicalRecordType" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetMedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetMedication" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetVaccination" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "type" "VaccinationType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nextDue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetVaccination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetEmergencyToken" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "token" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rotatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetEmergencyToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HouseholdMember_userId_idx" ON "HouseholdMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_householdId_userId_key" ON "HouseholdMember"("householdId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdInviteCode_code_key" ON "HouseholdInviteCode"("code");

-- CreateIndex
CREATE INDEX "HouseholdInviteCode_householdId_idx" ON "HouseholdInviteCode"("householdId");

-- CreateIndex
CREATE INDEX "Pet_householdId_idx" ON "Pet"("householdId");

-- CreateIndex
CREATE INDEX "PetPhoto_petId_idx" ON "PetPhoto"("petId");

-- CreateIndex
CREATE UNIQUE INDEX "PetEmergencyInfo_petId_key" ON "PetEmergencyInfo"("petId");

-- CreateIndex
CREATE INDEX "PetMedicalRecord_petId_date_idx" ON "PetMedicalRecord"("petId", "date");

-- CreateIndex
CREATE INDEX "PetMedication_petId_startDate_idx" ON "PetMedication"("petId", "startDate");

-- CreateIndex
CREATE INDEX "PetVaccination_petId_date_idx" ON "PetVaccination"("petId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PetEmergencyToken_petId_key" ON "PetEmergencyToken"("petId");

-- CreateIndex
CREATE UNIQUE INDEX "PetEmergencyToken_token_key" ON "PetEmergencyToken"("token");

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdInviteCode" ADD CONSTRAINT "HouseholdInviteCode_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetPhoto" ADD CONSTRAINT "PetPhoto_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetEmergencyInfo" ADD CONSTRAINT "PetEmergencyInfo_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetMedicalRecord" ADD CONSTRAINT "PetMedicalRecord_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetMedication" ADD CONSTRAINT "PetMedication_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetVaccination" ADD CONSTRAINT "PetVaccination_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetEmergencyToken" ADD CONSTRAINT "PetEmergencyToken_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
