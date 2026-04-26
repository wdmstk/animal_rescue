import { z } from "zod";
import { CORE_METRIC_TYPES, HEALTH_EXTENSION_KEYS, LAB_MARKER_TYPES } from "@/types/health";

const noteSchema = z.string().trim().max(500).optional().nullable();

export const coreHealthEntryInputSchema = z.object({
  type: z.enum(CORE_METRIC_TYPES),
  value: z.number().finite().nonnegative(),
  recordedAt: z.coerce.date(),
  note: noteSchema
});

export const labResultEntryInputSchema = z.object({
  marker: z.enum(LAB_MARKER_TYPES),
  value: z.number().finite().nonnegative(),
  unit: z.string().trim().min(1).max(20).optional(),
  recordedAt: z.coerce.date(),
  note: noteSchema
});

export const healthExtensionEntryInputSchema = z.object({
  key: z.enum(HEALTH_EXTENSION_KEYS),
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
