import { passwordResetRequestSchema } from "@/lib/validators/auth";
import { redirect } from "next/navigation";

const requestPasswordReset = async (formData: FormData) => {
  "use server";

  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    redirect("/login/reset-password-request?error=invalid_email");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(parsed.data)
  });

  if (!response.ok) {
    redirect("/login/reset-password-request?error=request_failed");
  }

  redirect("/login/reset-password-request?success=true");
};

type ResetPasswordRequestPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    success?: string | string[];
  }>;
};

export default async function ResetPasswordRequestPage({ searchParams }: ResetPasswordRequestPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorParam = resolvedSearchParams?.error;
  const successParam = resolvedSearchParams?.success;
  const loginError = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const isSuccess = Array.isArray(successParam) ? successParam.includes("true") : successParam === "true";
  const isInvalidEmail = loginError === "invalid_email";
  const isRequestFailed = loginError === "request_failed";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={requestPasswordReset} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
        <h1 className="text-xl font-bold dark:text-slate-100">パスワードリセット</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          登録したメールアドレスを入力してください。パスワード再設定用のリンクを送信します。
        </p>
        {isSuccess ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            パスワード再設定用のリンクを送信しました。メールをご確認ください。
          </p>
        ) : null}
        {isInvalidEmail ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
            有効なメールアドレスを入力してください。
          </p>
        ) : null}
        {isRequestFailed ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
            リクエストの処理に失敗しました。もう一度お試しください。
          </p>
        ) : null}
        <label htmlFor="email" className="sr-only">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="メールアドレス"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:focus:ring-slate-400"
          required
        />
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
          リセットリンクを送信
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