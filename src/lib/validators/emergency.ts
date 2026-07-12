import { z } from "zod";

const phonePattern = /^[0-9+()\-\s]+$/;
const fullWidthDigitPattern = /[０-９]/g;
const phoneSymbolMap: Record<string, string> = {
  "（": "(",
  "）": ")",
  "＋": "+",
  "ー": "-",
  "－": "-",
  "―": "-",
  "‐": "-",
  "　": " "
};

const normalizePhone = (value: string) =>
  value
    .replace(fullWidthDigitPattern, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
    .replace(/[（）＋ー－―‐　]/g, (symbol) => phoneSymbolMap[symbol] ?? symbol);

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

  const trimmed = normalizePhone(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().max(40).regex(phonePattern, "invalid_phone").nullable().optional());

export const emergencyInfoInputSchema = z.object({
  disease: nullableTrimmedText(1000),
  allergy: nullableTrimmedText(1000),
  currentMedications: nullableTrimmedText(1000),
  vetName: nullableTrimmedText(120),
  vetPhone: nullablePhone,
  emergencyContactName: nullableTrimmedText(120),
  emergencyContactPhone: nullablePhone,
  bloodType: nullableTrimmedText(50),
  emergencyVetName: nullableTrimmedText(200),
  emergencyVetPhone: nullablePhone,
  emergencyContactName2: nullableTrimmedText(100),
  emergencyContactPhone2: nullablePhone
});

export type EmergencyInfoInput = z.infer<typeof emergencyInfoInputSchema>;
