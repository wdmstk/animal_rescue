import { z } from "zod";

export const createInviteCodeSchema = z.object({
  householdId: z.string().uuid(),
  createdBy: z.string().uuid(),
  expiresInHours: z.number().int().min(1).max(168).default(72)
});

export const joinByInviteSchema = z.object({
  code: z.string().min(6).max(64),
  userId: z.string().uuid()
});

export type CreateInviteCodeInput = z.infer<typeof createInviteCodeSchema>;
export type JoinByInviteInput = z.infer<typeof joinByInviteSchema>;
