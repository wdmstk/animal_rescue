import { z } from "zod";

export const emergencyInfoInputSchema = z.object({
  disease: z.string().max(1000).optional().nullable(),
  allergy: z.string().max(1000).optional().nullable(),
  currentMedications: z.string().max(1000).optional().nullable(),
  vetName: z.string().max(120).optional().nullable(),
  vetPhone: z.string().max(40).optional().nullable(),
  emergencyContactName: z.string().max(120).optional().nullable(),
  emergencyContactPhone: z.string().max(40).optional().nullable()
});

export type EmergencyInfoInput = z.infer<typeof emergencyInfoInputSchema>;
