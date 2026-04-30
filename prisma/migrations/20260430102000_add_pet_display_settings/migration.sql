-- CreateTable
CREATE TABLE "PetDisplaySettings" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "showMedicationCard" BOOLEAN NOT NULL DEFAULT true,
    "showVaccinationCard" BOOLEAN NOT NULL DEFAULT true,
    "showHealthCard" BOOLEAN NOT NULL DEFAULT true,
    "showMedicalRecordCard" BOOLEAN NOT NULL DEFAULT true,
    "showEmergencyMedicationSummary" BOOLEAN NOT NULL DEFAULT true,
    "showEmergencyVaccinationSummary" BOOLEAN NOT NULL DEFAULT true,
    "showEmergencyMedicalRecordSummary" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetDisplaySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PetDisplaySettings_petId_key" ON "PetDisplaySettings"("petId");

-- AddForeignKey
ALTER TABLE "PetDisplaySettings" ADD CONSTRAINT "PetDisplaySettings_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
