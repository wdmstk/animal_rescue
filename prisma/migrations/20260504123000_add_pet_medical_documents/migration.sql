-- CreateTable
CREATE TABLE "PetMedicalDocument" (
  "id" UUID NOT NULL,
  "petId" UUID NOT NULL,
  "recordId" UUID,
  "photoUrl" TEXT NOT NULL,
  "capturedAt" TIMESTAMP(3),
  "ocrText" TEXT,
  "ocrStructuredJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PetMedicalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PetMedicalDocument_petId_createdAt_idx" ON "PetMedicalDocument"("petId", "createdAt");

-- CreateIndex
CREATE INDEX "PetMedicalDocument_recordId_idx" ON "PetMedicalDocument"("recordId");

-- AddForeignKey
ALTER TABLE "PetMedicalDocument"
  ADD CONSTRAINT "PetMedicalDocument_petId_fkey"
  FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetMedicalDocument"
  ADD CONSTRAINT "PetMedicalDocument_recordId_fkey"
  FOREIGN KEY ("recordId") REFERENCES "PetMedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
