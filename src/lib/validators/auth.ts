import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const signupInputSchema = loginInputSchema;

export type SignupInput = z.infer<typeof signupInputSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().email().max(255, "Email must be less than 255 characters")
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
