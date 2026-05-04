import { z } from "zod";

const petInputBaseSchema = z.object({
  householdId: z.string().uuid(),
  name: z.string().min(1).max(64),
  species: z.enum(["dog", "cat", "other"]),
  breed: z.string().max(64).optional().nullable(),
  sex: z.enum(["MALE", "FEMALE", "UNKNOWN"]),
  reproductiveStatus: z.enum(["INTACT", "NEUTERED", "SPAYED", "UNKNOWN"]).optional(),
  sterilizedAt: z.string().date().optional().nullable(),
  birthday: z.string().date().optional().nullable(),
  ageYears: z.number().int().min(0).max(99).optional().nullable(),
  weightKg: z.number().min(0.1).max(200).optional().nullable(),
  notesPersonality: z.string().max(500).optional().nullable(),
  notesFeatures: z.string().max(500).optional().nullable(),
  microchipNumber: z.string().max(64).optional().nullable()
});

export const petInputSchema = petInputBaseSchema.superRefine((value, ctx) => {
  const status = value.reproductiveStatus ?? "UNKNOWN";
  if ((status === "INTACT" || status === "UNKNOWN") && value.sterilizedAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["sterilizedAt"],
      message: "未実施/不明の場合は実施日を指定できません"
    });
  }
});

export const petCreateSchema = petInputBaseSchema
  .partial({ householdId: true })
  .superRefine((value, ctx) => {
    const status = value.reproductiveStatus ?? "UNKNOWN";
    if ((status === "INTACT" || status === "UNKNOWN") && value.sterilizedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sterilizedAt"],
        message: "未実施/不明の場合は実施日を指定できません"
      });
    }
  });

export const petUpdateSchema = petInputBaseSchema
  .omit({ householdId: true })
  .partial()
  .superRefine((value, ctx) => {
    const status = value.reproductiveStatus;
    if ((status === "INTACT" || status === "UNKNOWN") && value.sterilizedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sterilizedAt"],
        message: "未実施/不明の場合は実施日を指定できません"
      });
    }
  });

export type PetInput = z.infer<typeof petInputSchema>;
