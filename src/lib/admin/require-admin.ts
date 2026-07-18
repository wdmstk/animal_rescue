import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const getAdminEmails = (): string[] =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

/**
 * Server Component 用：管理者でなければ / にリダイレクトする
 */
export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email || !getAdminEmails().includes(user.email)) {
    redirect("/");
  }

  return user;
}

/**
 * Route Handler 用：管理者でなければ 403 を返す
 */
export async function requireAdminUserForApi(): Promise<{ email: string; id: string } | NextResponse> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getAdminEmails().includes(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { email: user.email, id: user.id };
}
