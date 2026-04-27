import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const signupInputSchema = loginInputSchema;

export type SignupInput = z.infer<typeof signupInputSchema>;
