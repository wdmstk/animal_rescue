import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { passwordResetRequestSchema } from "@/lib/validators/auth";
import { badRequest, tooManyRequests } from "@/lib/api-error";
import { getRedisClient } from "@/lib/rate-limit/client";
import { getClientIp } from "@/lib/rate-limit/ip-extractor";

const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds

export async function POST(req: Request) {
  try {
    // Rate limiting check
    const ip = getClientIp(req);
    const redis = getRedisClient();
    
    const rateLimitKey = `password-reset-request:${ip}`;
    const current = await redis.incr(rateLimitKey);
    
    if (current === 1) {
      await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
    }
    
    if (current > RATE_LIMIT_REQUESTS) {
      return tooManyRequests();
    }
    
    // Parse and validate request body
    const body = await req.json().catch(() => null);
    const parsed = passwordResetRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return badRequest("Invalid email format");
    }
    
    const { email } = parsed.data;
    
    // Call Supabase Auth resetPasswordForEmail
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login/reset-password`,
    });
    
    // Security: Always return the same message regardless of success/failure
    // This prevents user enumeration
    if (error) {
      console.error("Password reset request error:", error);
    }
    
    return NextResponse.json({
      message: "If the email is registered, a password reset link has been sent."
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    // Security: Still return success message on errors to prevent enumeration
    return NextResponse.json({
      message: "If the email is registered, a password reset link has been sent."
    });
  }
}