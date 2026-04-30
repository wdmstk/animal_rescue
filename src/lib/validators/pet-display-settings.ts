import { z } from "zod";

export const petDisplaySettingsParamSchema = z.object({
  petId: z.string().uuid()
});

export const petDisplaySettingsSchema = z.object({
  showMedicationCard: z.boolean(),
  showVaccinationCard: z.boolean(),
  showHealthCard: z.boolean(),
  showMedicalRecordCard: z.boolean(),
  showEmergencyMedicationSummary: z.boolean(),
  showEmergencyVaccinationSummary: z.boolean(),
  showEmergencyMedicalRecordSummary: z.boolean()
});

export const petDisplaySettingsPatchSchema = petDisplaySettingsSchema.partial().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  {
    message: "At least one setting is required"
  }
);

export type PetDisplaySettingsInput = z.infer<typeof petDisplaySettingsSchema>;
