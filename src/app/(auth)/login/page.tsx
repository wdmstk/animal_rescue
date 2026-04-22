import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginInputSchema } from "@/lib/validators/auth";
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

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">ログイン</h1>
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
      </form>
    </div>
  );
}
