import { z } from "zod";
import { CORE_METRIC_TYPES, LAB_MARKER_CATEGORY_MAP, LAB_MARKER_TYPES, LAB_RESULT_CATEGORIES } from "@/types/health";

const noteSchema = z.string().trim().max(500).optional().nullable();

export const coreHealthEntryInputSchema = z.object({
  type: z.enum(CORE_METRIC_TYPES),
  value: z.number().finite().nonnegative(),
  recordedAt: z.coerce.date(),
  note: noteSchema
});

export const labResultEntryInputSchema = z.object({
  category: z.enum(LAB_RESULT_CATEGORIES).default("BLOOD"),
  marker: z.enum(LAB_MARKER_TYPES),
  value: z.number().finite().nonnegative(),
  unit: z.string().trim().min(1).max(20).optional(),
  recordedAt: z.coerce.date(),
  note: noteSchema
}).superRefine((value, ctx) => {
  const expectedCategory = LAB_MARKER_CATEGORY_MAP[value.marker];
  if (value.category !== expectedCategory) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `marker ${value.marker} requires category ${expectedCategory}`,
      path: ["category"]
    });
  }
});

export const healthExtensionEntryInputSchema = z.object({
  name: z.string().trim().min(1).max(50),
  value: z.number().finite().nonnegative(),
  unit: z.string().trim().min(1).max(20).optional().nullable(),
  recordedAt: z.coerce.date(),
  note: noteSchema
});

export const coreMetricTypeFilterSchema = z.object({
  type: z.enum(CORE_METRIC_TYPES).optional()
});

export const healthPetIdParamSchema = z.object({
  petId: z.string().uuid()
});
