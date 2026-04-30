ALTER TABLE "PetDisplaySettings"
ADD COLUMN "medicationReminderEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "medicationReminderChannel" TEXT NOT NULL DEFAULT 'email',
ADD COLUMN "medicationReminderDestination" TEXT NOT NULL DEFAULT '';
