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
      <form action={signup} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">新規登録</h1>
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
        <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">登録する</button>
        <p className="text-center text-sm text-slate-600">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-semibold text-slate-900 underline">
            ログイン
          </Link>
        </p>
      </form>
    </div>
  );
}
