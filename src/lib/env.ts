import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_ID_MONTHLY_680: z.string().min(1).optional(),
  STRIPE_PRICE_ID_MONTHLY_500: z.string().min(1).optional(),
  MEDICATION_REMINDER_JOB_TOKEN: z.string().min(1).optional(),
  REMINDER_SCHEDULE_TIMEZONE: z.string().min(1).optional(),
  REMINDER_EMAIL_WEBHOOK_URL: z.string().url().optional(),
  REMINDER_LINE_WEBHOOK_URL: z.string().url().optional()
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID_MONTHLY_680: process.env.STRIPE_PRICE_ID_MONTHLY_680,
  STRIPE_PRICE_ID_MONTHLY_500: process.env.STRIPE_PRICE_ID_MONTHLY_500,
  MEDICATION_REMINDER_JOB_TOKEN: process.env.MEDICATION_REMINDER_JOB_TOKEN,
  REMINDER_SCHEDULE_TIMEZONE: process.env.REMINDER_SCHEDULE_TIMEZONE,
  REMINDER_EMAIL_WEBHOOK_URL: process.env.REMINDER_EMAIL_WEBHOOK_URL,
  REMINDER_LINE_WEBHOOK_URL: process.env.REMINDER_LINE_WEBHOOK_URL
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

const stripePriceIdMonthly680 = parsed.data.STRIPE_PRICE_ID_MONTHLY_680 ?? parsed.data.STRIPE_PRICE_ID_MONTHLY_500;

if (!stripePriceIdMonthly680) {
  throw new Error("Invalid environment variables: STRIPE_PRICE_ID_MONTHLY_680 (or legacy _500) is required");
}

export const env = {
  ...parsed.data,
  STRIPE_PRICE_ID_MONTHLY_680: stripePriceIdMonthly680
};
