import { z } from "zod";

export const accountUpdateSchema = z
  .object({
    displayName: z.string().trim().min(1).max(50).optional(),
    password: z.string().min(8).max(72).optional()
  })
  .refine((value) => value.displayName !== undefined || value.password !== undefined, {
    message: "少なくとも1項目を指定してください"
  });

export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
