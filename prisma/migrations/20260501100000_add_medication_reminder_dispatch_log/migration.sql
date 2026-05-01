CREATE TABLE "PetMedicationReminderDispatchLog" (
  "id" UUID NOT NULL,
  "petId" UUID NOT NULL,
  "reminderDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PetMedicationReminderDispatchLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PetMedicationReminderDispatchLog_petId_reminderDate_key"
  ON "PetMedicationReminderDispatchLog"("petId", "reminderDate");

CREATE INDEX "PetMedicationReminderDispatchLog_reminderDate_idx"
  ON "PetMedicationReminderDispatchLog"("reminderDate");

ALTER TABLE "PetMedicationReminderDispatchLog"
  ADD CONSTRAINT "PetMedicationReminderDispatchLog_petId_fkey"
  FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
