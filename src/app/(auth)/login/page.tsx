import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginInputSchema } from "@/lib/validators/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const login = async (formData: FormData) => {
  "use server";

  const parsed = loginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login?error=invalid_input");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  redirect("/pets");
};

type LoginPageProps = {
  searchParams?: Promise<{
    registered?: string | string[];
    error?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const registeredParam = resolvedSearchParams?.registered;
  const errorParam = resolvedSearchParams?.error;
  const isRegistered = Array.isArray(registeredParam) ? registeredParam.includes("1") : registeredParam === "1";
  const loginError = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const isInvalidCredentials = loginError === "invalid_credentials";
  const isInvalidInput = loginError === "invalid_input";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
        <h1 className="text-xl font-bold dark:text-slate-100">ログイン</h1>
        {isRegistered ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            確認メールを送信しました。メール内のリンクを開いてからログインしてください。
          </p>
        ) : null}
        {isInvalidCredentials ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
            メールアドレスまたはパスワードが正しくありません。
          </p>
        ) : null}
        {isInvalidInput ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
            入力内容を確認してください。
          </p>
        ) : null}
        <label htmlFor="email" className="sr-only">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-slate-400"
          required
        />
        <label htmlFor="password" className="sr-only">パスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-slate-400"
          required
        />
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">ログイン</button>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          はじめての方は{" "}
          <Link href="/signup" className="font-semibold text-slate-900 underline dark:text-slate-100">
            新規登録
          </Link>
        </p>
      </form>
      <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-3">
        <Link href="/legal/terms" className="hover:underline">利用規約</Link>
        {"・"}
        <Link href="/legal/privacy" className="hover:underline">プライバシーポリシー</Link>
      </p>
    </div>
  );
}
