import { z } from "zod";

const phonePattern = /^[0-9+()\-\s]+$/;

const nullableTrimmedText = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable().optional());

const nullablePhone = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().max(40).regex(phonePattern, "invalid_phone").nullable().optional());

export const emergencyInfoInputSchema = z.object({
  disease: nullableTrimmedText(1000),
  allergy: nullableTrimmedText(1000),
  currentMedications: nullableTrimmedText(1000),
  vetName: nullableTrimmedText(120),
  vetPhone: nullablePhone,
  emergencyContactName: nullableTrimmedText(120),
  emergencyContactPhone: nullablePhone
});

export type EmergencyInfoInput = z.infer<typeof emergencyInfoInputSchema>;
