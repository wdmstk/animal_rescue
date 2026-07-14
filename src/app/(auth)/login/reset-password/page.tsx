import { passwordResetSchema } from "@/lib/validators/auth";
import { redirect } from "next/navigation";

const resetPassword = async (formData: FormData) => {
  "use server";

  const parsed = passwordResetSchema.safeParse({
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login/reset-password?error=invalid_password");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(parsed.data)
  });

  if (!response.ok) {
    redirect("/login/reset-password?error=update_failed");
  }

  redirect("/pets");
};

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorParam = resolvedSearchParams?.error;
  const loginError = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const isInvalidPassword = loginError === "invalid_password";
  const isUpdateFailed = loginError === "update_failed";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={resetPassword} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
        <h1 className="text-xl font-bold dark:text-slate-100">パスワード再設定</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          新しいパスワードを入力してください。
        </p>
        {isInvalidPassword ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
            パスワードは8文字以上で、大文字・小文字・数字を含む必要があります。
          </p>
        ) : null}
        {isUpdateFailed ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
            パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。もう一度リセットをやり直してください。
          </p>
        ) : null}
        <label htmlFor="password" className="sr-only">新しいパスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="新しいパスワード（8文字以上、大文字・小文字・数字を含む）"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-slate-400"
          required
          minLength={8}
        />
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
          パスワードを更新
        </button>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          <a href="/login" className="font-semibold text-slate-900 underline dark:text-slate-100">
            ログイン画面へ戻る
          </a>
        </p>
      </form>
    </div>
  );
}