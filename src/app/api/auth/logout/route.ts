import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/api-error";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return serverError(error.message);
  }

  return NextResponse.json({ ok: true });
}
