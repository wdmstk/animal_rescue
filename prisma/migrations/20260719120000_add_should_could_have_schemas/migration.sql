-- CreateEnum
CREATE TYPE "EmergencyTagCategory" AS ENUM ('DISEASE', 'ALLERGY', 'MEDICATION');

-- AlterTable
ALTER TABLE "Pet" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PetDisplaySettings" ADD COLUMN "vaccineReminderChannel" TEXT NOT NULL DEFAULT 'email',
ADD COLUMN "vaccineReminderDestination" TEXT NOT NULL DEFAULT '',
ADD COLUMN "vaccineReminderEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PetEmergencyInfo" ADD COLUMN "emergencyContactName2" TEXT,
ADD COLUMN "emergencyContactPhone2" TEXT,
ADD COLUMN "insuranceCompany" TEXT,
ADD COLUMN "insurancePolicyNumber" TEXT,
ADD COLUMN "specialNotes" TEXT;

-- CreateTable
CREATE TABLE "PetEmergencyInfoTag" (
    "id" UUID NOT NULL,
    "emergencyInfoId" UUID NOT NULL,
    "category" "EmergencyTagCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetEmergencyInfoTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetMedicationLog" (
    "id" UUID NOT NULL,
    "medicationId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "PetMedicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetVaccineReminderDispatchLog" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "vaccinationId" UUID NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetVaccineReminderDispatchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PetEmergencyInfoTag_emergencyInfoId_idx" ON "PetEmergencyInfoTag"("emergencyInfoId");

-- CreateIndex
CREATE INDEX "PetMedicationLog_medicationId_loggedAt_idx" ON "PetMedicationLog"("medicationId", "loggedAt");

-- CreateIndex
CREATE INDEX "PetVaccineReminderDispatchLog_reminderDate_idx" ON "PetVaccineReminderDispatchLog"("reminderDate");

-- CreateIndex
CREATE UNIQUE INDEX "PetVaccineReminderDispatchLog_petId_vaccinationId_reminderDate_key" ON "PetVaccineReminderDispatchLog"("petId", "vaccinationId", "reminderDate");

-- AddForeignKey
ALTER TABLE "PetEmergencyInfoTag" ADD CONSTRAINT "PetEmergencyInfoTag_emergencyInfoId_fkey" FOREIGN KEY ("emergencyInfoId") REFERENCES "PetEmergencyInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetMedicationLog" ADD CONSTRAINT "PetMedicationLog_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "PetMedication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetVaccineReminderDispatchLog" ADD CONSTRAINT "PetVaccineReminderDispatchLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
