import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginInputSchema } from "@/lib/validators/auth";
import { badRequest, unauthorized } from "@/lib/api-error";

export async function POST(request: Request) {
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

  return NextResponse.json({ ok: true });
}
