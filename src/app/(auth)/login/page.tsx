import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginInputSchema } from "@/lib/validators/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const login = async (formData: FormData) => {
  "use server";

  const parsed = loginInputSchema.parse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/pets");
};

type LoginPageProps = {
  searchParams?: Promise<{
    registered?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const registeredParam = resolvedSearchParams?.registered;
  const isRegistered = Array.isArray(registeredParam) ? registeredParam.includes("1") : registeredParam === "1";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">ログイン</h1>
        {isRegistered ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            確認メールを送信しました。メール内のリンクを開いてからログインしてください。
          </p>
        ) : null}
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        />
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">ログイン</button>
        <p className="text-center text-sm text-slate-600">
          はじめての方は{" "}
          <Link href="/signup" className="font-semibold text-slate-900 underline">
            新規登録
          </Link>
        </p>
      </form>
    </div>
  );
}
