import { z } from "zod";

export const petInputSchema = z.object({
  householdId: z.string().uuid(),
  name: z.string().min(1).max(64),
  species: z.enum(["dog", "cat", "other"]),
  breed: z.string().max(64).optional().nullable(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]),
  birthday: z.string().date().optional().nullable(),
  ageYears: z.number().int().min(0).max(99).optional().nullable(),
  weightKg: z.number().min(0.1).max(200).optional().nullable(),
  notesPersonality: z.string().max(500).optional().nullable(),
  notesFeatures: z.string().max(500).optional().nullable(),
  microchipNumber: z.string().max(64).optional().nullable()
});

export const petUpdateSchema = petInputSchema.omit({ householdId: true }).partial();

export type PetInput = z.infer<typeof petInputSchema>;
