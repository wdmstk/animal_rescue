import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { accountUpdateSchema } from "@/lib/validators/account";
import { badRequest, unauthorized } from "@/lib/api-error";

const resolveDisplayName = (metadata: unknown): string | null => {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const value = (metadata as { display_name?: unknown }).display_name;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return unauthorized();
  }

  return NextResponse.json({
    data: {
      userId: user.id,
      email: user.email ?? null,
      displayName: resolveDisplayName(user.user_metadata)
    }
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = accountUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return unauthorized();
  }

  const updatePayload: { password?: string; data?: { display_name?: string } } = {};

  if (parsed.data.password) {
    updatePayload.password = parsed.data.password;
  }
  if (parsed.data.displayName) {
    updatePayload.data = { display_name: parsed.data.displayName };
  }

  const { error: updateError } = await supabase.auth.updateUser(updatePayload);
  if (updateError) {
    return badRequest(updateError.message);
  }

  return NextResponse.json({ ok: true });
}
