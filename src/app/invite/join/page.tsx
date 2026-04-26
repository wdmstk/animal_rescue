"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function InviteJoinPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCode = inviteCode.trim();
    if (!normalizedCode) {
      setErrorMessage("招待コードを入力してください");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/households/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizedCode })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(typeof payload?.error === "string" ? payload.error : "参加に失敗しました");
        return;
      }

      router.push("/pets");
      router.refresh();
    } catch {
      setErrorMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-md rounded-2xl bg-white p-4 shadow-sm">
      <h1 className="text-lg font-bold text-slate-900">家族として参加</h1>
      <p className="mt-2 text-sm text-slate-600">
        招待コードを入力して、ペット情報の共同編集に参加します。
      </p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          type="text"
          name="inviteCode"
          placeholder="招待コード"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          disabled={isSubmitting}
        />
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "参加中..." : "参加する"}
        </button>
      </form>
    </div>
  );
}
