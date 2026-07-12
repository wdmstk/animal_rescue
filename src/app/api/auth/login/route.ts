import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginInputSchema } from "@/lib/validators/auth";
import { badRequest, unauthorized } from "@/lib/api-error";
import { checkRateLimit, createRateLimitResponse, createRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(request, 'login');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const body = await request.json();
  const parsed = loginInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return unauthorized(error.message);
  }

  return NextResponse.json({ ok: true }, {
    headers: createRateLimitHeaders(rateLimitResult),
  });
}
