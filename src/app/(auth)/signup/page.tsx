import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signupInputSchema } from "@/lib/validators/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const signup = async (formData: FormData) => {
  "use server";

  const parsed = signupInputSchema.parse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp(parsed);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/login?registered=1");
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={signup} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
        <h1 className="text-xl font-bold dark:text-slate-100">新規登録</h1>
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
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">登録する</button>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-semibold text-slate-900 underline dark:text-slate-100">
            ログイン
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
