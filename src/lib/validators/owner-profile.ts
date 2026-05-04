import { z } from "zod";

const toNull = (value: string | null | undefined) => {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const optionalTrimmed = z.string().max(255).optional().nullable().transform(toNull);

export const ownerProfileUpdateSchema = z.object({
  fullName: z.string().max(255).optional().nullable().transform(toNull),
  phone: z.string().max(64).optional().nullable().transform(toNull),
  email: z
    .string()
    .email("メールアドレスの形式が正しくありません")
    .max(255)
    .optional()
    .nullable()
    .transform(toNull),
  postalCode: z.string().max(32).optional().nullable().transform(toNull),
  addressLine1: optionalTrimmed,
  addressLine2: optionalTrimmed,
  note: z.string().max(500).optional().nullable().transform(toNull)
});

export const ownerProfileResponseSchema = z.object({
  ownerUserId: z.string(),
  fullName: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  postalCode: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  note: z.string().nullable()
});

export type OwnerProfileUpdateInput = z.infer<typeof ownerProfileUpdateSchema>;
